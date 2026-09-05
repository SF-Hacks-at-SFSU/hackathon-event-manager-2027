import { eventProcedure, organizerProcedure } from '../../common/common.middleware';
import { t } from '../../core/trpc';
import {
  createTestCheckInPass,
  getCheckInMode,
  getMyCheckInPass,
  scanCheckInPass
} from './checkIn.controller';
import { createTestCheckInPassSchema, scanCheckInPassSchema } from './checkIn.schemas';

export const checkInRouter = t.router({
  myPass: eventProcedure.query(({ ctx }) => getMyCheckInPass(ctx.event.id, ctx.user.id)),
  mode: organizerProcedure.query(() => getCheckInMode()),
  testPass: organizerProcedure
    .input(createTestCheckInPassSchema)
    .mutation(({ ctx, input }) => createTestCheckInPass(ctx.event.id, input.applicationId)),
  scan: organizerProcedure
    .input(scanCheckInPassSchema)
    .mutation(({ ctx, input }) => scanCheckInPass(ctx.event.id, input.token))
});

export type CheckInRouter = typeof checkInRouter;
