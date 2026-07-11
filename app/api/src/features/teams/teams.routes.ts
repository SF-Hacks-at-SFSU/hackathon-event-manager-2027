import z from 'zod';
import { protectedProcedure, teamProcedure } from '../../common/common.middleware';
import { idParamsSchema } from '../../common/common.schema';
import { t } from '../../core/trpc';
import { getTeamById, joinTeam, kickTeamMember, leaveTeam, getOrCreateJoinTeamToken, getTeamFromTeamToken, getTeamPreviewByInviteToken } from './teams.controller';

export const teamsRouter = t.router({
  getTeamById: protectedProcedure.input(idParamsSchema).query(({ input }) => {
    return getTeamById(input.id);
  }),

  getOwnTeam: teamProcedure.query(async ({ ctx }) => {
    return {
      team: await getTeamById(ctx.teamId),
      isTeamAdmin: ctx.isTeamAdmin,
      requestorUserId: ctx.user.id
    };
  }),

  getTeamInviteToken: teamProcedure
    .query(({ ctx }) => {
      return getOrCreateJoinTeamToken(ctx.teamId);
    }),

  getTeamPreviewByInviteToken: protectedProcedure
    .input(z.object({ teamToken: z.string() }))
    .query(({ ctx, input }) => {
      // pass current user id so controller can check blacklist and return an error
      return getTeamPreviewByInviteToken(input.teamToken, ctx.user.id);
    }),

  joinTeamById: teamProcedure
    .input(z.object({ teamToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const teamId = await getTeamFromTeamToken(input.teamToken);
      return joinTeam(teamId, ctx.user.id, ctx.event?.id!);
    }),

  leaveTeam: teamProcedure.mutation(({ ctx }) => {
    return leaveTeam(ctx.teamId, ctx.user.id);
  }),

  kickTeamMemberById: teamProcedure
    .input(z.object({ memberBeingKickedId: z.uuid() }))
    .mutation(({ ctx, input }) => {
      // memberBeingKickedId should also be a userId
      return kickTeamMember(ctx.user.id, input.memberBeingKickedId, ctx.teamId);
    })
});

export type TeamsRouter = typeof teamsRouter;
