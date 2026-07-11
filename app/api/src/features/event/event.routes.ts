import { requireEvent } from '../../common/common.middleware';
import { idParamsSchema } from '../../common/common.schema';
import { t } from '../../core/trpc';
import { getEventById, getEventsByQuery } from './event.controller';
import { getEventsByQuerySchema } from './event.schemas';

export const eventRouter = t.router({
  // GET /:id -> getById procedure
  getById: t.procedure.input(idParamsSchema).query(({ input }) => {
    return getEventById(input.id);
  }),

  // GET / -> getByQuery procedure
  getByQuery: t.procedure.input(getEventsByQuerySchema).query(({ input }) => {
    return getEventsByQuery(input);
  }),

  me: t.procedure.use(requireEvent).query(({ ctx }) => {
    return getEventById(ctx.event.id);
  })
});

export type EventRouter = typeof eventRouter;
