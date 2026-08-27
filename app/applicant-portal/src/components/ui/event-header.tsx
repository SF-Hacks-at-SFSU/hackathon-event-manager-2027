'use client';

import { trpc } from '@/utils/trpc';
import { CalendarDays } from 'lucide-react';

function formatEventDate(value?: string | Date | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));
}

export default function EventHeader({ compact = false }: { compact?: boolean }) {
  const { data: event } = trpc.events.me.useQuery(undefined, { retry: false });
  const eventDate = formatEventDate(event?.startDate);

  return (
    <div className="flex flex-col items-start justify-center gap-3">
      <p className="portal-eyebrow">Participant application</p>
      <h1 className={compact ? 'text-3xl font-semibold tracking-tight' : 'portal-heading'}>
        {event?.name || 'SF Hacks'}
      </h1>
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {eventDate && <CalendarDays className="size-4 text-primary" />}
        <span>{eventDate || 'Event details coming soon'}</span>
        <span aria-hidden="true">•</span>
        <span>San Francisco State University</span>
      </div>
    </div>
  );
}
