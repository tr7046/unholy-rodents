import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const CONTENT_KEY = 'shows';

// Disable caching for dynamic data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ShowBand {
  name: string;
  isHeadliner: boolean;
}

interface Venue {
  name: string;
  city: string;
  state: string;
}

interface Show {
  id: string;
  date: string;
  venue: Venue;
  doorsTime?: string;
  ticketUrl?: string;
  bands?: ShowBand[];
}

interface ShowsDataRaw {
  upcomingShows: Show[];
  pastShows: Show[];
}

const defaultData: ShowsDataRaw = {
  upcomingShows: [],
  pastShows: [],
};

async function getContentFromBackend(): Promise<ShowsDataRaw> {
  try {
    const response = await fetch(`${API_URL}/content/${CONTENT_KEY}`, {
      cache: 'no-store',
    });
    if (!response.ok) return defaultData;
    const data = await response.json();
    return {
      upcomingShows: Array.isArray(data?.upcomingShows) ? data.upcomingShows : defaultData.upcomingShows,
      pastShows: Array.isArray(data?.pastShows) ? data.pastShows : defaultData.pastShows,
    };
  } catch {
    return defaultData;
  }
}

export async function GET() {
  try {
    const data = await getContentFromBackend();
    // Transform to consistent API response
    return NextResponse.json({
      upcoming: data.upcomingShows || [],
      past: data.pastShows || [],
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load shows data' }, { status: 500 });
  }
}
