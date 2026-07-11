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

