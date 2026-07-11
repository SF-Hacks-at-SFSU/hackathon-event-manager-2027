import { TRPCError } from '@trpc/server';
import prisma from '../../config/prismaClient';
import type {
  AssignJudgeInput,
  AutoAssignInput,
  CreateRubricInput,
  SubmitProjectInput,
  SubmitScoreInput
} from './judging.schemas';

export function submitProject(eventId: string, teamId: string, input: SubmitProjectInput) {
  return prisma.submission.upsert({
    where: { teamId },
    create: { eventId, teamId, ...input, submittedAt: new Date() },
    update: { ...input, submittedAt: new Date() }
  });
}

export function listSubmissions(eventId: string) {
  return prisma.submission.findMany({
    where: { eventId },
    include: { team: { include: { members: { include: { profile: true } } } } },
    orderBy: { submittedAt: 'desc' }
  });
}

export function createRubric(eventId: string, input: CreateRubricInput) {
  return prisma.rubric.create({
    data: {
      eventId,
      name: input.name,
      criteria: { create: input.criteria }
    },
    include: { criteria: true }
  });
}

export function listRubrics(eventId: string) {
  return prisma.rubric.findMany({
    where: { eventId },
    include: { criteria: true },
    orderBy: { createdAt: 'desc' }
  });
}

export function assignJudge(eventId: string, input: AssignJudgeInput) {
  return prisma.judgeAssignment.upsert({
    where: {
      judgeProfileId_submissionId: {
        judgeProfileId: input.judgeProfileId,
        submissionId: input.submissionId
      }
    },
    create: { eventId, ...input },
    update: {}
  });
}

/**
 * Even round-robin distribution across all judges assigned to the event,
 * so no judge sees a wildly different workload than another.
 */
export async function autoAssignJudges(eventId: string, input: AutoAssignInput) {
  const [judges, submissions] = await Promise.all([
    prisma.eventProfile.findMany({ where: { eventId, role: 'judge' }, select: { profileId: true } }),
    prisma.submission.findMany({ where: { eventId }, select: { id: true } })
  ]);

  if (judges.length === 0) {
    throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'No judges assigned to this event yet' });
  }

  const assignments: { eventId: string; judgeProfileId: string; submissionId: string }[] = [];
  submissions.forEach((submission, i) => {
    for (let j = 0; j < input.submissionsPerJudge && j < judges.length; j++) {
      const judge = judges[(i + j) % judges.length]!;
      assignments.push({ eventId, judgeProfileId: judge.profileId, submissionId: submission.id });
    }
  });

  await prisma.judgeAssignment.createMany({ data: assignments, skipDuplicates: true });
  return { assignedCount: assignments.length };
}

export function listAssignmentsForJudge(eventId: string, judgeProfileId: string) {
  return prisma.judgeAssignment.findMany({
    where: { eventId, judgeProfileId },
    include: {
      submission: {
        include: { scores: { where: { judgeProfileId } }, team: true }
      }
    }
  });
}

export function submitScore(judgeProfileId: string, input: SubmitScoreInput) {
  return prisma.$transaction(
    input.scores.map((score) =>
      prisma.score.upsert({
        where: {
          submissionId_judgeProfileId_criterionId: {
            submissionId: input.submissionId,
            judgeProfileId,
            criterionId: score.criterionId
          }
        },
        create: {
          submissionId: input.submissionId,
          judgeProfileId,
          criterionId: score.criterionId,
          value: score.value,
          comment: score.comment
        },
        update: { value: score.value, comment: score.comment }
      })
    )
  );
}

interface LeaderboardScore {
  judgeProfileId: string;
  value: number;
  criterion: { weight: number };
}

interface LeaderboardSubmission {
  id: string;
  title: string;
  team: { name: string | null };
  scores: LeaderboardScore[];
}

/**
 * Weighted-average scoring, pulled out as a pure function so the aggregation
 * math can be unit tested without a database.
 */
export function computeLeaderboard(submissions: LeaderboardSubmission[]) {
  return submissions
    .map((submission) => {
      const totalWeight = submission.scores.reduce((sum, s) => sum + s.criterion.weight, 0);
      const weightedTotal = submission.scores.reduce((sum, s) => sum + s.value * s.criterion.weight, 0);
      return {
        submissionId: submission.id,
        title: submission.title,
        teamName: submission.team.name,
        judgeCount: new Set(submission.scores.map((s) => s.judgeProfileId)).size,
        averageScore: totalWeight > 0 ? weightedTotal / totalWeight : 0
      };
    })
    .sort((a, b) => b.averageScore - a.averageScore);
}

export async function getLeaderboard(eventId: string) {
  const submissions = await prisma.submission.findMany({
    where: { eventId },
    include: {
      team: true,
      scores: { include: { criterion: true } }
    }
  });

  return computeLeaderboard(submissions);
}
