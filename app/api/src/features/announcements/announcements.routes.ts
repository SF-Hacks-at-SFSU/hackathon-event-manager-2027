import { z } from 'zod';
import { t } from '../../core/trpc';
import { eventProcedure, organizerProcedure } from '../../common/common.middleware';
import { createAnnouncement, deleteAnnouncement, listAnnouncements } from './announcements.controller';
import { createAnnouncementSchema } from './announcements.schemas';

export const announcementsRouter = t.router({
  // any authenticated event participant can read announcements
  list: eventProcedure.query(({ ctx }) => {
    return listAnnouncements(ctx.event!.id);
  }),

  // only organizers can post/remove them
  create: organizerProcedure.input(createAnnouncementSchema).mutation(({ ctx, input }) => {
    return createAnnouncement(ctx.event!.id, input);
  }),
  delete: organizerProcedure.input(z.object({ id: z.uuid() })).mutation(({ ctx, input }) => {
    return deleteAnnouncement(ctx.event!.id, input.id);
  })
});

export type AnnouncementsRouter = typeof announcementsRouter;
