import { eventProcedure, organizerProcedure } from '../../common/common.middleware';
import { t } from '../../core/trpc';
import { getCheckInMode, getMyCheckInPass, scanCheckInPass } from './checkIn.controller';
import { scanCheckInPassSchema } from './checkIn.schemas';

export const checkInRouter = t.router({
  myPass: eventProcedure.query(({ ctx }) => getMyCheckInPass(ctx.event.id, ctx.user.id)),
  mode: organizerProcedure.query(() => getCheckInMode()),
  scan: organizerProcedure
    .input(scanCheckInPassSchema)
    .mutation(({ ctx, input }) => scanCheckInPass(ctx.event.id, input.token))
});

export type CheckInRouter = typeof checkInRouter;
