import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { t } from '../../core/trpc';
import { sendAuthOtp } from './auth.service';

const OTP_COOLDOWN_MS = 60_000;
const recentSends = new Map<string, number>();

function reserveSend(email: string) {
  const now = Date.now();
  const previousSend = recentSends.get(email);

  if (previousSend && now - previousSend < OTP_COOLDOWN_MS) {
    const retryAfterSeconds = Math.ceil((OTP_COOLDOWN_MS - (now - previousSend)) / 1000);
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: `A code was already sent. Please wait ${retryAfterSeconds} seconds before requesting another.`
    });
  }

  recentSends.set(email, now);

  // Keep the process-local cooldown cache bounded on long-running API instances.
  if (recentSends.size > 1_000) {
    for (const [address, sentAt] of recentSends) {
      if (now - sentAt >= OTP_COOLDOWN_MS) recentSends.delete(address);
    }
  }

  return now;
}

export const authRouter = t.router({
  sendOtp: t.procedure.input(z.object({ email: z.email() })).mutation(async ({ input }) => {
    const email = input.email.trim().toLowerCase();
    const reservedAt = reserveSend(email);

    try {
      await sendAuthOtp(email);
      return { sent: true };
    } catch (error) {
      // Let a real delivery failure be retried immediately while preserving a
      // newer reservation from a concurrent request.
      if (recentSends.get(email) === reservedAt) recentSends.delete(email);
      throw error;
    }
  })
});

export type AuthRouter = typeof authRouter;
