import { applicationRouter } from '../features/application/application.routes';
import { eventRouter } from '../features/event/event.routes';
import { eventProfileRouter } from '../features/eventProfiles/eventProfile.routes';
import { schoolsRouter } from '../features/schools/schools.routes';
import { teamsRouter } from '../features/teams/teams.routes';
import { userProfileRouter } from '../features/userProfile/userProfile.routes';
import { judgingRouter } from '../features/judging/judging.routes';
import { announcementsRouter } from '../features/announcements/announcements.routes';
import { emailTemplatesRouter } from '../email/email.templates.routes';
import { t } from './trpc';

export const trpcRouter = t.router({
  //TODO change event directory to be plural.
  events: eventRouter,
  teams: teamsRouter,
  applications: applicationRouter,
  schools: schoolsRouter,
  profile: userProfileRouter,
  eventProfile: eventProfileRouter,
  judging: judgingRouter,
  announcements: announcementsRouter,
  emailTemplates: emailTemplatesRouter
});

export type AppRouter = typeof trpcRouter;
