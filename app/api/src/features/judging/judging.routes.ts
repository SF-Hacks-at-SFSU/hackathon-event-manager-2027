import { z } from 'zod';
import { t } from '../../core/trpc';
import { eventProcedure, judgeProcedure, organizerProcedure, teamProcedure } from '../../common/common.middleware';
import {
  assignJudge,
  autoAssignJudges,
  createRubric,
  getLeaderboard,
  listAssignmentsForJudge,
  listRubrics,
  listSubmissions,
  submitProject,
  submitScore
} from './judging.controller';
import {
  assignJudgeSchema,
  autoAssignSchema,
  createRubricSchema,
  submitProjectSchema,
  submitScoreSchema
} from './judging.schemas';

export const judgingRouter = t.router({
  // hacker team submits/updates their project
  submitProject: teamProcedure.input(submitProjectSchema).mutation(({ ctx, input }) => {
    return submitProject(ctx.event!.id, ctx.teamId, input);
  }),

  // organizer: full submission list
  listSubmissions: organizerProcedure.query(({ ctx }) => {
    return listSubmissions(ctx.event!.id);
  }),

  // organizer: rubric management
  createRubric: organizerProcedure.input(createRubricSchema).mutation(({ ctx, input }) => {
    return createRubric(ctx.event!.id, input);
  }),
  listRubrics: eventProcedure.query(({ ctx }) => {
    return listRubrics(ctx.event!.id);
  }),

  // organizer: judge assignment
  assignJudge: organizerProcedure.input(assignJudgeSchema).mutation(({ ctx, input }) => {
    return assignJudge(ctx.event!.id, input);
  }),
  autoAssignJudges: organizerProcedure.input(autoAssignSchema).mutation(({ ctx, input }) => {
    return autoAssignJudges(ctx.event!.id, input);
  }),

  // judge: their queue and scoring
  myAssignments: judgeProcedure.query(({ ctx }) => {
    return listAssignmentsForJudge(ctx.event!.id, ctx.eventProfile.profileId);
  }),
  submitScore: judgeProcedure.input(submitScoreSchema).mutation(({ ctx, input }) => {
    return submitScore(ctx.eventProfile.profileId, input);
  }),

  // organizer + judge: live results
  leaderboard: eventProcedure.input(z.object({}).optional()).query(({ ctx }) => {
    return getLeaderboard(ctx.event!.id);
  })
});

export type JudgingRouter = typeof judgingRouter;
