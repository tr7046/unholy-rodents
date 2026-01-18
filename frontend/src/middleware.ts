import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'admin_session';

// Admin routes that require authentication (all except login page)
const PROTECTED_ADMIN_ROUTES = [
  '/hailsquatan/dashboard',
  '/hailsquatan/products',
  '/hailsquatan/shows',
  '/hailsquatan/music',
  '/hailsquatan/about',
  '/hailsquatan/media',
  '/hailsquatan/homepage',
  '/hailsquatan/orders',
  '/hailsquatan/visibility',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected admin route
  const isProtectedRoute = PROTECTED_ADMIN_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isProtectedRoute) {
    // Check for session cookie
    const sessionCookie = request.cookies.get(SESSION_COOKIE);

    if (!sessionCookie?.value) {
      // No session - redirect to login
      const loginUrl = new URL('/hailsquatan', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If user is authenticated and trying to access login page, redirect to dashboard
  if (pathname === '/hailsquatan') {
    const sessionCookie = request.cookies.get(SESSION_COOKIE);
    if (sessionCookie?.value) {
      return NextResponse.redirect(new URL('/hailsquatan/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/hailsquatan/:path*'],
};
