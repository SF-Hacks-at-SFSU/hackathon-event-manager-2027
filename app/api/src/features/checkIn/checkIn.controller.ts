import { TRPCError } from '@trpc/server';
import prisma from '../../config/prismaClient';
import { isCheckInTestMode, operationalMode } from '../../config/operationalMode';
import { createEventCheckInToken, verifyEventCheckInToken } from './checkIn.token';

export function getEventCheckInPass(eventId: string) {
  return { token: createEventCheckInToken(eventId), persistent: true };
}

export async function selfCheckIn(eventId: string, userId: string, token: string) {
  let payload: ReturnType<typeof verifyEventCheckInToken>;
  try {
    payload = verifyEventCheckInToken(token);
  } catch (error) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: error instanceof Error ? error.message : 'Invalid event check-in code'
    });
  }

  if (payload.eventId !== eventId) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'This pass belongs to a different event' });
  }

  const application = await prisma.application.findFirst({
    where: { eventId, userId },
    include: { profile: { select: { firstName: true, lastName: true } } }
  });

  if (!application) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'You do not have an application for this event'
    });
  }
  if (application.publicStatus !== 'accepted' && !isCheckInTestMode) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Only accepted participants can check in' });
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
