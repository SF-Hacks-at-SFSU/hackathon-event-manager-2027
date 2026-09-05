import { TRPCError } from '@trpc/server';
import prisma from '../../config/prismaClient';
import { isCheckInTestMode, operationalMode } from '../../config/operationalMode';
import { createCheckInToken, verifyCheckInToken } from './checkIn.token';

export async function getMyCheckInPass(eventId: string, userId: string) {
  const application = await prisma.application.findFirst({
    where: { eventId, userId },
    select: { publicStatus: true }
  });

  if (!application) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Application not found' });
  }
  if (application.publicStatus !== 'accepted') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'A check-in pass is available after acceptance'
    });
  }

  return { token: createCheckInToken(eventId, userId) };
}

export async function scanCheckInPass(eventId: string, token: string) {
  let payload: ReturnType<typeof verifyCheckInToken>;
  try {
    payload = verifyCheckInToken(token);
  } catch (error) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: error instanceof Error ? error.message : 'Invalid check-in pass'
    });
  }

  if (payload.eventId !== eventId) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'This pass belongs to a different event' });
  }

  const application = await prisma.application.findFirst({
    where: { eventId, userId: payload.userId },
    include: { profile: { select: { firstName: true, lastName: true } } }
  });

  if (!application) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'No application matches this pass' });
  }
  if (application.publicStatus !== 'accepted') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'This participant is not accepted' });
  }

  const wasAlreadyCheckedIn = application.checkedIn;
  const checkedInApplication =
    isCheckInTestMode || wasAlreadyCheckedIn
      ? application
      : await prisma.application.update({
          where: { id: application.id },
          data: { checkedIn: true, checkedInAt: new Date() },
          include: { profile: { select: { firstName: true, lastName: true } } }
        });

  return {
    mode: operationalMode.checkIn,
    recorded: !isCheckInTestMode && !wasAlreadyCheckedIn,
    alreadyCheckedIn: wasAlreadyCheckedIn,
    participant: {
      applicationId: application.id,
      name:
        [application.profile.firstName, application.profile.lastName].filter(Boolean).join(' ') ||
        'Participant',
      checkedIn: checkedInApplication.checkedIn,
      checkedInAt: checkedInApplication.checkedInAt
    }
  };
}

export function getCheckInMode() {
  return { mode: operationalMode.checkIn };
}
