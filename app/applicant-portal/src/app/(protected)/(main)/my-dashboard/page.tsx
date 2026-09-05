'use client';
/**
 * My Dashboard Page
 */

import { trpc } from '@/utils/trpc';
import EventHeader from '@/components/ui/event-header';
import ErrorStateAlert from '../components/ErrorStateAlert';
import TeamView from './components/TeamView';
import Link from 'next/link';
export default function MyDashboardView() {
  // ✅ All hooks at the top
  const { error } = trpc.events.getById.useQuery({
    id: process.env.NEXT_PUBLIC_EVENT_ID || ''
  });
  // ✅ Conditional rendering after all hooks
  if (error) {
    const isNotFound = false;
    const isServerError = true;

    return (
      <main className="min-h-full flex items-center justify-center p-4">
        <ErrorStateAlert
          title={{
            text: isNotFound ? 'Event Not Found' : 'Unable to Load Dashboard'
          }}
          description={{
            text: isNotFound
              ? "The event you're looking for doesn't exist or has been removed."
              : isServerError
                ? "We're experiencing technical difficulties. Please try again later."
                : 'Something went wrong while loading your dashboard.'
          }}
          callToAction={{
            text: 'Back to Home',
            link: '/'
          }}
          variant="default"
        />
      </main>
    );
  }

  return (
    <main className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
      <section className="space-y-6">
        <EventHeader />
        <div className="portal-surface p-6 sm:p-8">
          <p className="portal-eyebrow">Application submitted</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">You’re all set for now.</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            We’ll show your decision here when applications are reviewed. In the meantime, you can
            invite teammates and keep your team details up to date.
          </p>
        </div>
      </section>
      <section className="portal-surface p-6 sm:p-8">
        <div className="mb-6">
          <p className="portal-eyebrow">Team workspace</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Your team</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Invite teammates and review everyone’s application status.
          </p>
        </div>
        <TeamView />
      </section>
      <section className="portal-surface p-6 sm:p-8 lg:col-span-2">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="portal-eyebrow">More from SF Hacks</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              See what we’re building next.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Discover upcoming hackathons, workshops, and community events.
            </p>
          </div>
          <Link
            href="https://sfhacks.io"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Explore upcoming events
          </Link>
        </div>
      </section>
    </main>
  );
}
