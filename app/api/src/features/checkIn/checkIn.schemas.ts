import { z } from 'zod';

export const scanCheckInPassSchema = z.object({
  token: z.string().trim().min(20).max(2048)
});
