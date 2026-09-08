'use client';

import { Button } from '@/components/shadcn/ui/button';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { trpc } from '@/utils/trpc';
import { CheckCircle2, Copy, ExternalLink, QrCode, Share2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'sonner';
import { useEventSelection } from '@/providers/EventSelectionProvider';

type ApplicationStatus = 'PENDING' | 'REJECTED' | 'ACCEPTED' | 'WAITLISTED';

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
    description: 'Your spot is confirmed. Keep this check-in pass ready for event day.'
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
  const checkInPass = trpc.checkIn.myPass.useQuery(undefined, {
    enabled: isAccepted,
    retry: false
  });
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
        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
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

          {isAccepted && (
            <div className="flex flex-col items-center justify-center border-t border-white/8 bg-white/[0.025] p-6 text-center sm:p-8 lg:border-l lg:border-t-0">
              <p className="text-sm font-semibold">Your check-in QR</p>
              <p className="mt-1 text-xs text-muted-foreground">Show this pass at the entrance.</p>
              <div className="mt-5 flex min-h-60 min-w-60 items-center justify-center rounded-3xl bg-white p-3 shadow-2xl shadow-black/25">
                {checkInPass.isLoading && <Spinner className="text-black" />}
                {checkInPass.isError && (
                  <p className="max-w-48 text-sm leading-5 text-red-600">
                    {checkInPass.error.message}
                  </p>
                )}
                {checkInPass.data?.token && (
                  <QRCodeCanvas value={checkInPass.data.token} size={220} includeMargin />
                )}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                This pass is unique to you. Don’t share it.
              </p>
            </div>
          )}
        </div>
      </section>

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
