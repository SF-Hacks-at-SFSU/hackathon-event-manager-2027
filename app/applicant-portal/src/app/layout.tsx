import GlobalProgressBar from '@/components/GlobalProgressBar';
import { Toaster } from '@/components/shadcn/ui/sonner';
import '@/styles/globals.css';
import { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import Providers from '../providers';
import { cookies } from 'next/headers';
import { EVENT_COOKIE_NAME, resolveEventSelection } from '@/lib/event-selection';
import PortalEventLink from '@/components/PortalEventLink';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export const metadata: Metadata = {
  title: 'SF Hacks 2027 Application Signup',
  description:
    'Sign up to participate in SF Hacks 2027, the premier student hackathon in San Francisco. Submit your application to join the event and showcase your skills!',
  icons: `${baseUrl}/logo_pink.png`,
  keywords: [
    'SF Hacks 2027',
    'hackathon',
    'student hackathon',
    'signup',
    'application',
    'sf hacks'
  ],
  authors: [{ name: 'SFHacks Team', url: 'https://sfhacks.io' }],
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: 'SF Hacks 2027 Application Signup',
    description:
      'Apply to SF Hacks, San Francisco’s top student hackathon. Submit your application now!',
    siteName: 'Apply to SF Hacks 2027',
    images: [
      {
        url: `${baseUrl}/banner1.png`,
        width: 1200,
        height: 630,
        alt: 'SFHacks Hackathon'
      }
    ],
    locale: 'en_US',
    type: 'website',
    url: baseUrl
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const event = resolveEventSelection(
    cookieStore.get(EVENT_COOKIE_NAME)?.value,
    process.env.NEXT_PUBLIC_EVENT_ID
  );

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col`}
      >
        <GlobalProgressBar />
        <Providers event={event}>
          <header className="sticky top-0 z-40 border-b border-white/8 bg-background/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
              <Link href="/" className="flex items-center gap-3" aria-label="SF Hacks home">
                <Image src="/logo_pink.png" alt="SF Hacks" width={36} height={36} />
                <div className="leading-tight">
                  <p className="text-sm font-semibold">SF Hacks</p>
                  <p className="text-xs text-muted-foreground">Application portal</p>
                </div>
              </Link>
              <PortalEventLink />
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/8 py-6 text-sm text-muted-foreground">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 sm:flex-row sm:px-8">
              <span>
                Built by{' '}
                <Link
                  href="https://sfhacks.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  SF Hacks
                </Link>
              </span>
              <Link
                href="https://sfsu-acm.notion.site/2a898c2605148063975ad95c0cf933a8?pvs=105"
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Report a problem
              </Link>
            </div>
          </footer>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
