import { z } from 'zod';
import { ApplicationCreateInputObjectSchema } from '../../zod/schemas';

export const ApplicationStatusEnum = z.enum(['pending', 'rejected', 'accepted', 'waitlisted']);

export const TShirtSizeEnum = z.enum([
  'US_XS',
  'US_S',
  'US_M',
  'US_L',
  'US_XL',
  'US_XXL',
  'UK_6',
  'UK_8',
  'UK_10',
  'UK_12',
  'UK_14',
  'UK_16'
]);

export const applicationCreateSchema = ApplicationCreateInputObjectSchema.omit({
  event: true,
  profile: true
});

export type ApplicationCreate = z.infer<typeof applicationCreateSchema>;

export const updateApplicationStatusSchema = z.object({
  applicationId: z.uuid(),
  publicStatus: ApplicationStatusEnum
});
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
