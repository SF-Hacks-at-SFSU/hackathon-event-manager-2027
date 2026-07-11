import {
  organizerProcedure,
  requireAuth,
  requireEvent,
  requireEventAccess
} from '../../common/common.middleware';
import { t } from '../../core/trpc';
import {
  createOrUpdateApplication,
  getMyApplication,
  listApplicationsForEvent,
  updateApplicationStatus
} from './application.controller';
import { applicationCreateSchema, updateApplicationStatusSchema } from './application.schemas';

export const applicationRouter = t.router({
  createOrUpdate: t.procedure
    .use(requireAuth)
    .use(requireEvent)
    .input(applicationCreateSchema)
    .mutation(({ ctx, input }) =>
      createOrUpdateApplication(ctx.user?.id || '', ctx.event.id, input)
    ),

  me: t.procedure.use(requireEventAccess).query(({ ctx }) => getMyApplication(ctx)),

  // organizer-only review queue
  listByEvent: organizerProcedure.query(({ ctx }) => listApplicationsForEvent(ctx.event!.id)),

  // organizer-only review action, triggers the matching status-change email
  updateStatus: organizerProcedure
    .input(updateApplicationStatusSchema)
    .mutation(({ ctx, input }) => updateApplicationStatus(ctx.event!.id, input))
});
