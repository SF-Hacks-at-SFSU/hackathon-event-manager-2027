'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SupabaseAuthProvider } from './SupabaseAuthProvider';
import { TRPCProvider } from './trpcProvider';
import { EventSelectionProvider } from './EventSelectionProvider';
import type { EventSelection } from '@/lib/event-selection';

const queryClient = new QueryClient();

export default function Providers({
  children,
  event
}: {
  children: React.ReactNode;
  event: EventSelection;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <EventSelectionProvider event={event}>
        <SupabaseAuthProvider>
          <TRPCProvider queryClient={queryClient} eventId={event.id}>
            {children}
          </TRPCProvider>
        </SupabaseAuthProvider>
      </EventSelectionProvider>
    </QueryClientProvider>
  );
}
