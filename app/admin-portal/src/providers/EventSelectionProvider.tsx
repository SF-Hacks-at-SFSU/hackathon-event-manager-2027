'use client';

import type { AdminEventSelection } from '@/lib/event-selection';
import { createContext, useContext } from 'react';

const EventSelectionContext = createContext<AdminEventSelection | null>(null);

export function EventSelectionProvider({
  event,
  children
}: {
  event: AdminEventSelection;
  children: React.ReactNode;
}) {
  return (
    <EventSelectionContext.Provider value={event}>
      {children}
    </EventSelectionContext.Provider>
  );
}

export function useEventSelection() {
  const event = useContext(EventSelectionContext);

  if (!event) {
    throw new Error('useEventSelection must be used within EventSelectionProvider');
  }

  return event;
}
