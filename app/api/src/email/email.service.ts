import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import dotenv from 'dotenv';
import prisma from '../config/prismaClient';
import { supabase } from '../config/supabase';

dotenv.config();

const sesClient = new SESClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

interface EmailInput {
  to: string;
  subject: string;
  html: string;
}

const escapeHtml = (value: string | null | undefined) =>
  (value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

export const sendPersonalizedEmail = ({ to, subject, html }: EmailInput) => {
  const command = new SendEmailCommand({
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Html: { Data: html } }
    },
    Source: `"SFHacks Team" <${process.env.SES_FROM_ADDRESS!}>`
  });

  return sesClient.send(command);
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

  const applicantName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Unknown applicant';
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
 * went out without digging through SES/CloudWatch.
 */
export async function sendTemplatedEmail(
  eventId: string,
  templateKey: string,
  userId: string,
  variables: Record<string, string> = {}
) {
  const template = await prisma.emailTemplate.findUnique({
    where: { eventId_key: { eventId, key: templateKey } }
  });

  if (!template) {
    return prisma.emailLog.create({
      data: {
        eventId,
        templateKey,
        toEmail: 'unknown',
        status: 'failed',
        errorMessage: `No email template registered for key "${templateKey}"`
      }
    });
  }

  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
  const toEmail = authUser?.user?.email;

  if (authError || !toEmail) {
    return prisma.emailLog.create({
      data: {
        eventId,
        templateKey,
        toEmail: 'unknown',
        status: 'failed',
        errorMessage: authError?.message ?? 'User has no email on file'
      }
    });
  }

  try {
    const result = await sendPersonalizedEmail({
      to: toEmail,
      subject: renderTemplate(template.subject, variables),
      html: renderTemplate(template.bodyHtml, variables)
    });

    return prisma.emailLog.create({
      data: {
        eventId,
        templateKey,
        toEmail,
        status: 'sent',
        providerMessageId: result.MessageId
      }
    });
  } catch (err) {
    return prisma.emailLog.create({
      data: {
        eventId,
        templateKey,
        toEmail,
        status: 'failed',
        errorMessage: err instanceof Error ? err.message : String(err)
      }
    });
  }
}
