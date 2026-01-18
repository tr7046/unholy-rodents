import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'admin_session';
const VISIBILITY_CACHE_COOKIE = 'visibility_pages';
const VISIBILITY_CACHE_DURATION = 60 * 1000; // 1 minute cache

// Admin routes that require authentication
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

// Public pages that can be disabled via visibility settings
const VISIBILITY_CONTROLLED_PAGES: Record<string, string> = {
  '/about': 'about',
  '/contact': 'contact',
  '/shows': 'shows',
  '/music': 'music',
  '/media': 'media',
  '/store': 'store',
};

interface PageVisibility {
  home: boolean;
  about: boolean;
  contact: boolean;
  shows: boolean;
  music: boolean;
  media: boolean;
  store: boolean;
  _timestamp?: number;
}

async function getPageVisibility(request: NextRequest): Promise<PageVisibility | null> {
  // Try to get from cache cookie first
  const cachedVisibility = request.cookies.get(VISIBILITY_CACHE_COOKIE);
  if (cachedVisibility?.value) {
    try {
      const parsed = JSON.parse(cachedVisibility.value) as PageVisibility;
      // Check if cache is still valid (within 1 minute)
      if (parsed._timestamp && Date.now() - parsed._timestamp < VISIBILITY_CACHE_DURATION) {
        return parsed;
      }
    } catch {
      // Invalid cache, will refetch
    }
  }

  // Fetch fresh visibility config
  try {
    const baseUrl = request.nextUrl.origin;
    const res = await fetch(`${baseUrl}/api/visibility`, {
      headers: { 'Cache-Control': 'no-cache' },
    });

    if (res.ok) {
      const config = await res.json();
      return {
        ...config.pages,
        _timestamp: Date.now(),
      };
    }
  } catch (error) {
    console.error('Failed to fetch visibility config:', error);
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ========================================
  // 1. ADMIN ROUTE PROTECTION
  // ========================================
  const isProtectedRoute = PROTECTED_ADMIN_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isProtectedRoute) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE);

    if (!sessionCookie?.value) {
      const loginUrl = new URL('/hailsquatan', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users from login to dashboard
  if (pathname === '/hailsquatan') {
    const sessionCookie = request.cookies.get(SESSION_COOKIE);
    if (sessionCookie?.value) {
      return NextResponse.redirect(new URL('/hailsquatan/dashboard', request.url));
    }
  }

  // ========================================
  // 2. VISIBILITY-CONTROLLED PAGE PROTECTION
  // ========================================
  const pageKey = VISIBILITY_CONTROLLED_PAGES[pathname];

  if (pageKey) {
    const visibility = await getPageVisibility(request);

    if (visibility && !visibility[pageKey as keyof PageVisibility]) {
      // Page is disabled - redirect to home with message
      const response = NextResponse.redirect(new URL('/', request.url));

      // Update visibility cache cookie
      response.cookies.set(VISIBILITY_CACHE_COOKIE, JSON.stringify(visibility), {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60, // 1 minute
        path: '/',
      });

      return response;
    }

    // Update cache cookie on successful access
    if (visibility) {
      const response = NextResponse.next();
      response.cookies.set(VISIBILITY_CACHE_COOKIE, JSON.stringify(visibility), {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60,
        path: '/',
      });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Admin routes
    '/hailsquatan/:path*',
    // Public pages that can be disabled
    '/about',
    '/contact',
    '/shows',
    '/music',
    '/media',
    '/store',
  ],
};
