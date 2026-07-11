import { t } from '../core/trpc';
import { organizerProcedure } from '../common/common.middleware';
import { listEmailLogs, listEmailTemplates, upsertEmailTemplate } from './email.templates.controller';
import { upsertEmailTemplateSchema } from './email.templates.schemas';

export const emailTemplatesRouter = t.router({
  list: organizerProcedure.query(({ ctx }) => listEmailTemplates(ctx.event!.id)),
  upsert: organizerProcedure.input(upsertEmailTemplateSchema).mutation(({ ctx, input }) =>
    upsertEmailTemplate(ctx.event!.id, input)
  ),
  logs: organizerProcedure.query(({ ctx }) => listEmailLogs(ctx.event!.id))
});

export type EmailTemplatesRouter = typeof emailTemplatesRouter;
