import prisma from '../config/prismaClient';
import type { UpsertEmailTemplateInput } from './email.templates.schemas';

export function upsertEmailTemplate(eventId: string, input: UpsertEmailTemplateInput) {
  return prisma.emailTemplate.upsert({
    where: { eventId_key: { eventId, key: input.key } },
    create: { eventId, ...input },
    update: { subject: input.subject, bodyHtml: input.bodyHtml }
  });
}

export function listEmailTemplates(eventId: string) {
  return prisma.emailTemplate.findMany({ where: { eventId } });
}

export function listEmailLogs(eventId: string) {
  return prisma.emailLog.findMany({ where: { eventId }, orderBy: { createdAt: 'desc' }, take: 200 });
}
