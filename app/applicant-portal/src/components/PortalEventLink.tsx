'use client';

import { useEventSelection } from '@/providers/EventSelectionProvider';
import { ExternalLink } from 'lucide-react';

export default function PortalEventLink() {
  const event = useEventSelection();

  return (
    <a
      href={event.website}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-white/20 hover:text-foreground"
    >
      {event.name}
      <ExternalLink className="size-3" />
    </a>
  );
}
