import { NextResponse } from 'next/server';
import { readData } from '@/lib/data';

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

export async function GET() {
  try {
    const data = await readData<ShowsDataRaw>('shows');
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
