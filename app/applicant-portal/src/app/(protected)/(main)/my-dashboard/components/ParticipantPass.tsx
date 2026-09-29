'use client';

import { Button } from '@/components/shadcn/ui/button';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { trpc } from '@/utils/trpc';
import {
  BookOpen,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageCircle,
  QrCode,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { useEventSelection } from '@/providers/EventSelectionProvider';

type ApplicationStatus = 'PENDING' | 'REJECTED' | 'ACCEPTED' | 'WAITLISTED';

const PARTICIPANT_HANDBOOK_URL =
  'https://docs.google.com/document/d/1dWe2Uxme1wfz-_EUHqF7p8AiOahpWhyvvz-1KBiuRa0/view';
const DISCORD_INVITE_URL = 'https://discord.com/invite/2KwpfmGcU';

const statusCopy: Record<
  ApplicationStatus,
  { eyebrow: string; title: string; description: string }
> = {
  PENDING: {
    eyebrow: 'Application submitted',
    title: 'Your application is under review.',
    description: 'We’ll update this page and email you as soon as a decision is ready.'
  },
  ACCEPTED: {
    eyebrow: 'Application approved',
    title: 'You’re in!',
    description:
      'Your spot is confirmed. At the entrance, scan the event QR and sign in to check yourself in.'
  },
  WAITLISTED: {
    eyebrow: 'Application update',
    title: 'You’re on the waitlist.',
    description: 'We’ll email you if a spot becomes available.'
  },
  REJECTED: {
    eyebrow: 'Application update',
    title: 'Thank you for applying.',
    description: 'We appreciate the time you took to apply and hope to see you at a future event.'
  }
};

export default function ParticipantPass() {
  const selectedEvent = useEventSelection();
  const { data: event } = trpc.events.me.useQuery(undefined, { retry: false });
  const {
    data: team,
    isLoading,
    error
  } = trpc.teams.getOwnTeam.useQuery(undefined, {
    retry: false
  });

  const member = team?.team.members.find((item) => item.userId === team.requestorUserId);
  const application = member?.profile.applications[0];
  const status = (application?.publicStatus ?? application?.status ?? 'pending').toUpperCase() as
    ApplicationStatus | string;
  const safeStatus: ApplicationStatus =
    status === 'ACCEPTED' ||
    status === 'WAITLISTED' ||
    status === 'REJECTED' ||
    status === 'PENDING'
      ? status
      : 'PENDING';
  const isAccepted = safeStatus === 'ACCEPTED';
  const eventWebsite = selectedEvent.website;
  const copy = statusCopy[safeStatus];

  const shareEvent = async () => {
    const shareData = {
      title: event?.name ?? 'SF Hacks',
      text: `Apply to ${event?.name ?? 'SF Hacks'}`,
      url: eventWebsite
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(eventWebsite);
      toast.success('Event link copied. Send it to a friend!');
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === 'AbortError') return;
      toast.error('Could not share the event link.');
    }
  };

  const copyEventLink = async () => {
    try {
      await navigator.clipboard.writeText(eventWebsite);
      toast.success('Event link copied.');
    } catch {
      toast.error('Could not copy the event link.');
    }
  };

  if (isLoading) {
    return (
      <div className="portal-surface flex min-h-80 items-center justify-center p-8">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="portal-surface p-6 sm:p-8">
        <p className="portal-eyebrow">Application status</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">We couldn’t load your pass.</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Refresh the page to try again. If the issue continues, contact the SF Hacks team.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="portal-surface overflow-hidden">
        <div className="grid">
          <div className="flex flex-col justify-center p-6 sm:p-9">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              {isAccepted ? <CheckCircle2 className="size-6" /> : <QrCode className="size-6" />}
            </div>
            <p className="portal-eyebrow mt-7">{copy.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
              {copy.description}
            </p>
            <div className="mt-7">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
                  isAccepted ? 'bg-emerald-400/12 text-emerald-300' : 'bg-white/8 text-foreground'
                }`}
              >
                {safeStatus.charAt(0) + safeStatus.slice(1).toLowerCase()}
              </span>
            </div>
          </div>
        </div>
      </section>

      {isAccepted && (
        <div className="space-y-6">
          <section className="portal-surface overflow-hidden">
            <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <BookOpen className="size-6" />
                </div>
                <div>
                  <p className="portal-eyebrow">Accepted participant resource</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Participant handbook
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    Review the event schedule, venue details, tracks, submission requirements, and
                    judging information before hackathon day.
                  </p>
                </div>
              </div>
              <a
                href={PARTICIPANT_HANDBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Open handbook
                <ExternalLink className="size-4" />
              </a>
            </div>
          </section>

          <section className="portal-surface overflow-hidden">
            <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#5865f2]/15 text-[#8b95ff]">
                  <MessageCircle className="size-6" />
                </div>
                <div>
                  <p className="portal-eyebrow">Participant community</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">GDG SFSU Discord</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    Meet teammates, ask questions, and receive event announcements from the
                    organizers.
                  </p>
                </div>
              </div>
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#5865f2] px-5 text-sm font-semibold text-white transition hover:bg-[#6773f3]"
              >
                Join Discord
                <ExternalLink className="size-4" />
              </a>
            </div>
          </section>
        </div>
      )}

      <section className="portal-surface p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="portal-eyebrow">Bring a friend</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Know someone who should join?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Share the official event page so they can learn more and apply.
            </p>
            <a
              href={eventWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              {eventWebsite.replace(/^https?:\/\//, '')}
              <ExternalLink className="size-3.5" />
            </a>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button variant="outline" size="lg" onClick={copyEventLink}>
              <Copy className="size-4" />
              Copy link
            </Button>
            <Button size="lg" onClick={shareEvent}>
              <Share2 className="size-4" />
              Invite a friend
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
