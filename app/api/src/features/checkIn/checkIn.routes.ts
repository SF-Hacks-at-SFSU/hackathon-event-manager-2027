import { eventProcedure, organizerProcedure } from '../../common/common.middleware';
import { t } from '../../core/trpc';
import { getEventCheckInPass, getCheckInMode, selfCheckIn } from './checkIn.controller';
import { selfCheckInSchema } from './checkIn.schemas';

export const checkInRouter = t.router({
  mode: organizerProcedure.query(() => getCheckInMode()),
  eventPass: organizerProcedure.query(({ ctx }) => getEventCheckInPass(ctx.event.id)),
  self: eventProcedure
    .input(selfCheckInSchema)
    .mutation(({ ctx, input }) => selfCheckIn(ctx.event.id, ctx.user.id, input.token))
});

export type CheckInRouter = typeof checkInRouter;
