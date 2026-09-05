import { z } from 'zod';

export const scanCheckInPassSchema = z.object({
  token: z.string().trim().min(20).max(2048)
});

export const createTestCheckInPassSchema = z.object({
  applicationId: z.string().uuid()
});
