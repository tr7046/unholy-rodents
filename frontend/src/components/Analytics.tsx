'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('analytics_sid');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('analytics_sid', id);
  }
  return id;
}

export function trackPageView(path: string) {
  const sessionId = getSessionId();
  fetch('/api/public/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'pageview',
      path,
      referrer: document.referrer || null,
      sessionId,
    }),
  }).catch(() => {});
}

export function trackPlay(track: {
  trackId: string;
  trackName: string;
  releaseId?: string;
  releaseName?: string;
}) {
  const sessionId = getSessionId();
  fetch('/api/public/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'play',
      ...track,
      sessionId,
    }),
  }).catch(() => {});
}

// Component that auto-tracks page views on route changes
export default function Analytics() {
  const pathname = usePathname();
  const lastPath = useRef('');

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith('/hailsquatan')) return;
    // Don't double-track
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    trackPageView(pathname);
  }, [pathname]);

  return null;
}
