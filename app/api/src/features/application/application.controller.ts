import { Prisma, participation_level } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import prisma from '../../config/prismaClient';
import { sendNewApplicationNotification, sendTemplatedEmail } from '../../email/email.service';
import { createCheckInToken } from '../checkIn/checkIn.token';
import type { Context } from '../../core/context';
import { isApplicationStatusTestMode, operationalMode } from '../../config/operationalMode';
import { supabase } from '../../config/supabase';
import type {
  ApplicationCreate as CreateApplicationInput,
  UpdateApplicationStatusInput
} from './application.schemas';

function toParticipationLevel(s?: string): participation_level | null {
  const norm = (s ?? '').toLowerCase();
  if (norm === 'hacker') return participation_level.hacker;
  if (norm === 'judge') return participation_level.judge;
  if (norm === 'organizer' || norm === 'mentor') return participation_level.organizer;
  return null;
}

function buildUpdateData(input: CreateApplicationInput): Prisma.ApplicationUncheckedUpdateInput {
  // Filter out undefined values
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  ) as Prisma.ApplicationUncheckedUpdateInput;
}

async function buildCreateData(
  userId: string,
  eventId: string,
  input: Partial<CreateApplicationInput>
): Promise<Prisma.ApplicationUncheckedCreateInput> {
  const filteredInput = Object.fromEntries(
    Object.entries(input).filter(([, v]) => v !== undefined)
  ) as Partial<CreateApplicationInput>;

  // 1️⃣ Create or find the user's eventProfile
  await prisma.eventProfile.create({
    data: {
      eventId,
      profileId: userId // assuming userId === profileId (if not, fix this)
    }
  });

  // 2️⃣ Return Prisma-compliant data
  return {
    userId,
    eventId,
    ...filteredInput
  };
}

export async function createOrUpdateApplication(
  userId: string,
  eventId: string,
  input: CreateApplicationInput
) {
  if (!eventId) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'eventId header is required' });
  }

  //TODO clarify this later on with different roles.
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.application.findUnique({
      where: { eventId_userId: { eventId, userId } }
    });

    const application = existing
      ? await tx.application.update({
          where: { id: existing.id },
          data: buildUpdateData(input)
        })
      : await tx.application.create({
          data: await buildCreateData(userId, eventId, input)
        });

    const roleStr = 'hacker';
    const roleEnum = toParticipationLevel(roleStr);

    const eventProfile = await tx.eventProfile.upsert({
      where: { profileId_eventId: { profileId: userId, eventId } },
      update: roleEnum ? { role: roleEnum } : {},
      create: {
        profileId: userId,
        eventId,
        ...(roleEnum ? { role: roleEnum } : {})
      }
    });

    //create team for new user and new user only not for updates
    if (!existing) {
      const numTeamsInEvent = await tx.team.count({
        where: {
          eventId: eventId
        }
      });

      const newOrExistingTeam = await tx.team.create({
        data: {
          eventId: eventId,
          name: `New Team #${numTeamsInEvent}`
        },
        select: {
          id: true
        }
      });

      await tx.teamMember.create({
        data: {
          teamId: newOrExistingTeam.id,
          userId: userId,
          event_id: eventId,
          isAdmin: true
        }
      });
    }

    return { application, eventProfile, isNewApplication: !existing };
  });

  if (result.isNewApplication) {
    try {
      await sendNewApplicationNotification(eventId, result.application.id, userId);
    } catch (error) {
      console.error('Failed to send organizer application notification:', error);
    }
  }

  return { application: result.application, eventProfile: result.eventProfile };
}

/**
 * Organizer-only status transition. Fires the matching triggered email
 * ("application_accepted" / "application_rejected" / "application_waitlisted" /
 * "application_pending" template keys) so status changes don't require a
 * separate manual bulk-email step, which was the gap in the 2026 admin flow.
 */
export async function updateApplicationStatus(
  eventId: string,
  input: UpdateApplicationStatusInput
) {
  const existingApplication = await prisma.application.findFirst({
    where: { id: input.applicationId, eventId },
    include: {
      profile: { select: { firstName: true } },
      event: { select: { name: true } }
    }
  });

  if (!existingApplication) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Application not found' });
  }

  const application = isApplicationStatusTestMode
    ? existingApplication
    : await prisma.application.update({
        where: { id: input.applicationId, eventId },
        data: { publicStatus: input.publicStatus, internalStatus: input.publicStatus }
      });

  const testRecipient = operationalMode.applicationStatusTestRecipient;
  const notification = await sendTemplatedEmail(
    eventId,
    `application_${input.publicStatus}`,
    existingApplication.userId,
    {
      firstName: existingApplication.profile.firstName ?? 'Builder',
      eventName: existingApplication.event.name,
      status: input.publicStatus
    },
    {
      toEmailOverride: isApplicationStatusTestMode ? testRecipient : null,
      subjectPrefix: isApplicationStatusTestMode ? '[TEST] ' : '',
      dryRun: isApplicationStatusTestMode && !testRecipient,
      checkInToken:
        input.publicStatus === 'accepted'
          ? createCheckInToken(eventId, existingApplication.userId)
          : undefined
    }
  );

  return {
    application,
    requestedStatus: input.publicStatus,
    statusChanged: !isApplicationStatusTestMode,
    mode: operationalMode.applicationStatus,
    notification
  };
}

// organizer-only: the admin portal's application review queue
export async function listApplicationsForEvent(eventId: string) {
  const applications = await prisma.application.findMany({
    where: { eventId },
    include: { profile: true },
    orderBy: { createdAt: 'desc' }
  });

  const schoolIds = [
    ...new Set(
      applications
        .flatMap((application) => [application.schoolId, application.school])
        .filter((value): value is string =>
          Boolean(
            value?.match(
              /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
            )
          )
        )
    )
  ];
  const schools = schoolIds.length
    ? await prisma.school.findMany({
        where: { id: { in: schoolIds } },
        select: { id: true, name: true }
      })
    : [];
  const schoolNames = new Map(schools.map((school) => [school.id, school.name]));

  const uniqueUserIds = [...new Set(applications.map((application) => application.userId))];
  const emailEntries = await Promise.all(
    uniqueUserIds.map(async (userId) => {
      try {
        const { data, error } = await supabase.auth.admin.getUserById(userId);
        if (error) {
          console.warn(`Could not load email for applicant ${userId}:`, error.message);
        }
        return [userId, data.user?.email ?? null] as const;
      } catch (error) {
        console.warn(`Could not load email for applicant ${userId}:`, error);
        return [userId, null] as const;
      }
    })
  );
  const emails = new Map(emailEntries);

  return applications.map((application) => ({
    ...application,
    applicantEmail: emails.get(application.userId) ?? application.schoolEmail ?? null,
    schoolName:
      (application.schoolId ? schoolNames.get(application.schoolId) : undefined) ??
      (application.school ? schoolNames.get(application.school) : undefined) ??
      application.school ??
      null
  }));
}

export async function getMyApplication(ctx: Context) {
  const { user, event } = ctx;
  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  if (!event) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Missing x-event-id' });
  }

  const application = await prisma.application.findFirst({
    where: { userId: user.id, eventId: event.id }
  });

  return application;
}
