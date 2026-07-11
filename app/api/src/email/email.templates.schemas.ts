import z from 'zod';

// key is a free-form slug the app looks up by, e.g. "application_accepted",
// "application_rejected", "application_waitlisted", "application_confirmed"
export const upsertEmailTemplateSchema = z.object({
  key: z.string().min(1),
  subject: z.string().min(1),
  bodyHtml: z.string().min(1)
});
export type UpsertEmailTemplateInput = z.infer<typeof upsertEmailTemplateSchema>;
