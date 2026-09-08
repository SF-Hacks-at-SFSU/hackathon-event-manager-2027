import { Resend } from 'resend';
import QRCode from 'qrcode';
import dotenv from 'dotenv';
import prisma from '../config/prismaClient';
import { supabase } from '../config/supabase';
import { getDefaultStatusEmailTemplate } from './status-email.templates';

dotenv.config();

interface EmailInput {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

interface EmailAttachment {
  filename: string;
  content: string;
  contentId?: string;
}

interface TemplatedEmailOptions {
  toEmailOverride?: string | null;
  subjectPrefix?: string;
  dryRun?: boolean;
  checkInToken?: string;
}

export interface TemplatedEmailResult {
  delivery: 'sent' | 'failed' | 'simulated';
  toEmail: string;
  message?: string;
}

const escapeHtml = (value: string | null | undefined) =>
  (value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

export const sendPersonalizedEmail = async ({ to, subject, html, attachments }: EmailInput) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_ADDRESS || 'SF Hacks <onboarding@resend.dev>',
    to: [to],
    subject,
    html,
    attachments
  });

  if (error) {
    throw new Error(error.message);
  }
  if (!data?.id) {
    throw new Error('Resend did not return a message ID');
  }

  return { MessageId: data.id };
};

export async function sendNewApplicationNotification(
  eventId: string,
  applicationId: string,
  userId: string
) {
  const organizerEmail = process.env.ORGANIZER_NOTIFICATION_EMAIL || 'sfhacksteam@gmail.com';
  const adminPortalUrl =
    process.env.ADMIN_PORTAL_URL || 'https://admin.sfhacks.io/dashboard/applications';

  const [application, event, profile, authResult] = await Promise.all([
    prisma.application.findUnique({ where: { id: applicationId } }),
    prisma.event.findUnique({ where: { id: eventId }, select: { name: true } }),
    prisma.userProfile.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true }
    }),
    supabase.auth.admin.getUserById(userId)
  ]);

  if (!application) {
    throw new Error(`Application ${applicationId} was not found after submission`);
  }

  const applicantName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Unknown applicant';
  const eventName = event?.name || 'SF Hacks event';
  const loginEmail = authResult.data.user?.email || 'Not available';
  const safeSubjectName = applicantName.replace(/[\r\n]+/g, ' ').trim();

  try {
    const result = await sendPersonalizedEmail({
      to: organizerEmail,
      subject: `New ${eventName} application — ${safeSubjectName}`,
      html: `
        <h2>New application received</h2>
        <p>A participant successfully submitted an application for <strong>${escapeHtml(eventName)}</strong>.</p>
        <table cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
          <tr><td><strong>Applicant</strong></td><td>${escapeHtml(applicantName)}</td></tr>
          <tr><td><strong>Login email</strong></td><td>${escapeHtml(loginEmail)}</td></tr>
          <tr><td><strong>School email</strong></td><td>${escapeHtml(application.schoolEmail || 'Not provided')}</td></tr>
          <tr><td><strong>School</strong></td><td>${escapeHtml(application.school || 'Not provided')}</td></tr>
          <tr><td><strong>Experience</strong></td><td>${escapeHtml(application.experienceLevel || 'Not provided')}</td></tr>
          <tr><td><strong>Team preference</strong></td><td>${escapeHtml(application.teamPreference || 'Not provided')}</td></tr>
          <tr><td><strong>GitHub</strong></td><td>${escapeHtml(application.githubUrl || 'Not provided')}</td></tr>
          <tr><td><strong>Discord</strong></td><td>${escapeHtml(application.discordUsername || 'Not provided')}</td></tr>
          <tr><td><strong>Application ID</strong></td><td>${escapeHtml(application.id)}</td></tr>
        </table>
        <p><a href="${escapeHtml(adminPortalUrl)}">Review applications in the admin portal</a></p>
      `
    });

    await prisma.emailLog.create({
      data: {
        eventId,
        templateKey: 'organizer_new_application',
        toEmail: organizerEmail,
        status: 'sent',
        providerMessageId: result.MessageId
      }
    });
  } catch (error) {
    await prisma.emailLog.create({
      data: {
        eventId,
        templateKey: 'organizer_new_application',
        toEmail: organizerEmail,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    });
    throw error;
  }
}

function renderTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => variables[key] ?? '');
}

/**
 * Sends a templated, triggered email (e.g. on application status change) and
 * always writes an EmailLog row, even on failure, so organizers can see what
 * went out without digging through the email provider dashboard.
 */
export async function sendTemplatedEmail(
  eventId: string,
  templateKey: string,
  userId: string,
  variables: Record<string, string> = {},
  options: TemplatedEmailOptions = {}
): Promise<TemplatedEmailResult> {
  const savedTemplate = await prisma.emailTemplate.findUnique({
    where: { eventId_key: { eventId, key: templateKey } }
  });
  const template = savedTemplate ?? getDefaultStatusEmailTemplate(templateKey);

  if (!template) {
    await prisma.emailLog.create({
      data: {
        eventId,
        templateKey,
        toEmail: 'unknown',
        status: 'failed',
        errorMessage: `No email template registered for key "${templateKey}"`
      }
    });
    return {
      delivery: 'failed',
      toEmail: 'unknown',
      message: `No email template registered for key "${templateKey}"`
    };
  }

  const safeHtmlVariables = Object.fromEntries(
    Object.entries(variables).map(([key, value]) => [key, escapeHtml(value)])
  );
  const renderedSubject = renderTemplate(template.subject, variables)
    .replace(/[\r\n]+/g, ' ')
    .trim();
  let renderedHtml = renderTemplate(template.bodyHtml, safeHtmlVariables);
  let attachments: EmailAttachment[] | undefined;

  if (options.checkInToken) {
    const qrCode = await QRCode.toBuffer(options.checkInToken, {
      type: 'png',
      width: 360,
      margin: 2,
      errorCorrectionLevel: 'M'
    });

    attachments = [
      {
        filename: 'sf-hacks-check-in-qr.png',
        content: qrCode.toString('base64'),
        contentId: 'sf-hacks-check-in-qr'
      }
    ];
    renderedHtml += `
      <div style="max-width:560px;margin:24px auto;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1d1d1f">
        <h2 style="margin:0 0 8px;font-size:22px">Your check-in QR</h2>
        <p style="margin:0 0 16px;color:#6e6e73">Save this email and show the QR code when you arrive.</p>
        <img src="cid:sf-hacks-check-in-qr" width="280" height="280" alt="Your SF Hacks check-in QR code" style="display:block;margin:0 auto;max-width:100%;background:#ffffff;border:12px solid #ffffff;border-radius:12px" />
        <p style="margin:12px 0 0;font-size:13px;color:#86868b">The same pass is available from your participant dashboard.</p>
      </div>
    `;
  }

  let toEmail = options.toEmailOverride ?? null;
  let authErrorMessage: string | null = null;

  if (!toEmail && !options.dryRun) {
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    toEmail = authUser?.user?.email ?? null;
    authErrorMessage = authError?.message ?? null;
  }

  if (options.dryRun) {
    return {
      delivery: 'simulated',
      toEmail: options.toEmailOverride ?? 'no email sent',
      message: 'Template rendered successfully. Test mode prevented delivery.'
    };
  }

  if (!toEmail) {
    await prisma.emailLog.create({
      data: {
        eventId,
        templateKey,
        toEmail: 'unknown',
        status: 'failed',
        errorMessage: authErrorMessage ?? 'User has no email on file'
      }
    });
    return {
      delivery: 'failed',
      toEmail: 'unknown',
      message: authErrorMessage ?? 'User has no email on file'
    };
  }

  try {
    const result = await sendPersonalizedEmail({
      to: toEmail,
      subject: `${options.subjectPrefix ?? ''}${renderedSubject}`,
      html: renderedHtml,
      attachments
    });

    await prisma.emailLog.create({
      data: {
        eventId,
        templateKey,
        toEmail,
        status: 'sent',
        providerMessageId: result.MessageId
      }
    });
    return { delivery: 'sent', toEmail };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.emailLog.create({
      data: {
        eventId,
        templateKey,
        toEmail,
        status: 'failed',
        errorMessage: message
      }
    });
    return { delivery: 'failed', toEmail, message };
  }
}
