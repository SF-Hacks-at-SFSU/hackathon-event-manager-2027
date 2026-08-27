'use client';

import { Button } from '@/components/ui/button';

export default function ClosedPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-3xl flex-col items-center justify-center px-5 py-12 text-center">
      <div className="portal-surface flex flex-col items-center p-8 sm:p-12">
        <p className="portal-eyebrow">Applications closed</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Applications are currently closed.
        </h1>

        <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
          Thanks for your interest in SF Hacks. Decisions and future application updates will be
          shared soon.
        </p>

        <Button asChild className="mt-6 bg-[#5865F2] text-white hover:bg-[#4752C4]">
          <a href="https://discord.gg/YOUR_INVITE" target="_blank" rel="noopener noreferrer">
            Join our Discord for Updates!
          </a>
        </Button>
        <Button asChild className="mt-3" variant={'outline'}>
          <a href="/my-dashboard">Check Application Status Here</a>
        </Button>
      </div>
    </main>
  );
}
