import { NextResponse } from 'next/server';
import { classifyShows, parseShowsPayload } from '@/lib/shows';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const CONTENT_KEY = 'shows';

// Disable caching for dynamic data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/content/${CONTENT_KEY}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ upcoming: [], past: [] }, {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      });
    }

    const data = await response.json();
    const shows = parseShowsPayload(data);
    const { upcoming, past } = classifyShows(shows);

    return NextResponse.json({ upcoming, past }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load shows data' }, { status: 500 });
  }
}
