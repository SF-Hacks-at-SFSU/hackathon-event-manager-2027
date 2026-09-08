import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_EVENT_COOKIE_NAME,
  ADMIN_EVENT_SELECTIONS,
  isAdminEventSlug
} from './lib/event-selection';

export function middleware(request: NextRequest) {
  const eventSlug = request.nextUrl.pathname.split('/')[2];
  const destination = request.nextUrl.clone();
  destination.pathname = '/dashboard/applications';
  destination.search = '';

  if (!isAdminEventSlug(eventSlug)) {
    destination.searchParams.set('event-error', 'not-found');
    return NextResponse.redirect(destination);
  }

  const response = NextResponse.redirect(destination);
  response.cookies.set(
    ADMIN_EVENT_COOKIE_NAME,
    ADMIN_EVENT_SELECTIONS[eventSlug].slug,
    {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
      path: '/'
    }
  );

  return response;
}

export const config = {
  matcher: ['/events/:path*']
};
