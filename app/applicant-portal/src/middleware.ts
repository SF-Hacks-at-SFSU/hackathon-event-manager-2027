import { NextRequest, NextResponse } from 'next/server';
import { EVENT_COOKIE_NAME, EVENT_SELECTIONS, isEventSlug } from './lib/event-selection';

export function middleware(request: NextRequest) {
  const eventSlug = request.nextUrl.pathname.split('/')[2];
  const destination = request.nextUrl.clone();
  destination.pathname = '/';

  if (!isEventSlug(eventSlug)) {
    destination.searchParams.set('event-error', 'not-found');
    return NextResponse.redirect(destination);
  }

  const response = NextResponse.redirect(destination);
  response.cookies.set(EVENT_COOKIE_NAME, EVENT_SELECTIONS[eventSlug].slug, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
    path: '/'
  });

  return response;
}

export const config = {
  matcher: ['/events/:path*']
};
