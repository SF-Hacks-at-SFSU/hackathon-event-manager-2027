'use client';

import { Button } from '@/components/shadcn/ui/button';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { useUser } from '@/hooks/auth';
import { useEventSelection } from '@/providers/EventSelectionProvider';
import { trpc } from '@/utils/trpc';
import { CheckCircle2, LogIn, QrCode, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export function SelfCheckIn({ token }: { token: string }) {
  const { user, isLoading: userLoading } = useUser();
  const event = useEventSelection();
  const checkIn = trpc.checkIn.self.useMutation();
  const returnTo = `/check-in?token=${encodeURIComponent(token)}`;
  const signInUrl = `/authenticate?returnTo=${encodeURIComponent(returnTo)}`;

  if (userLoading) {
    return (
      <main className="portal-page flex min-h-[calc(100vh-8rem)] items-center justify-center px-5 py-12">
        <Spinner className="size-7" />
      </main>
    );
  }

  return (
    <main className="portal-page flex min-h-[calc(100vh-8rem)] items-center justify-center px-5 py-12 sm:px-8">
      <section className="portal-surface w-full max-w-xl overflow-hidden text-center">
        <div className="border-b border-white/8 px-6 py-8 sm:px-10">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            {checkIn.data ? <CheckCircle2 className="size-7" /> : <QrCode className="size-7" />}
          </div>
          <p className="portal-eyebrow mt-6">Event check-in</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {checkIn.data ? 'You’re checked in!' : event.name}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            {checkIn.data
              ? checkIn.data.mode === 'test'
                ? 'The QR and your application were validated. Test mode did not change attendance.'
                : checkIn.data.alreadyCheckedIn
                  ? 'You were already checked in. No further action is needed.'
                  : 'Your attendance has been recorded. Welcome to the event!'
              : 'Confirm your identity using the same account as your accepted application.'}
          </p>
        </div>

        <div className="space-y-5 px-6 py-8 sm:px-10">
          {!token ? (
            <div className="rounded-2xl border border-destructive/25 bg-destructive/8 p-4 text-sm text-destructive">
              This check-in link is missing its secure event code. Scan the QR displayed by an
              organizer again.
            </div>
          ) : checkIn.data ? (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-left">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-300" />
                <div>
                  <p className="font-semibold text-emerald-200">{checkIn.data.participant.name}</p>
                  <p className="mt-1 text-sm text-emerald-100/70">
                    {checkIn.data.mode === 'test'
                      ? 'Validated in test mode'
                      : 'Attendance confirmed'}
                  </p>
                </div>
              </div>
            </div>
          ) : !user ? (
            <>
              <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4 text-left text-sm leading-6 text-muted-foreground">
                Sign in with the email used for your application. Only accepted participants can
                check themselves in.
              </div>
              <Button asChild size="lg" className="w-full">
                <Link href={signInUrl}>
                  <LogIn className="size-4" />
                  Sign in to check in
                </Link>
              </Button>
            </>
          ) : (
            <>
              <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4 text-left text-sm leading-6 text-muted-foreground">
                Signed in as <span className="font-medium text-foreground">{user.email}</span>. Your
                account must have an accepted application for this event.
              </div>
              <Button
                size="lg"
                className="w-full"
                disabled={checkIn.isPending}
                onClick={() => checkIn.mutate({ token })}
              >
                {checkIn.isPending ? (
                  <>
                    <Spinner className="size-4" />
                    Checking you in…
                  </>
                ) : (
                  'Check me in'
                )}
              </Button>
            </>
          )}

          {checkIn.isError && (
            <div
              className="rounded-2xl border border-destructive/25 bg-destructive/8 p-4 text-sm text-destructive"
              role="alert"
            >
              {checkIn.error.message}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
