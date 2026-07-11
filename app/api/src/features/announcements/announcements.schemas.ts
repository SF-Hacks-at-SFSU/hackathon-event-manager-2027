import z from 'zod';

export const createAnnouncementSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  isPinned: z.boolean().default(false)
});
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
