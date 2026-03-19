import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { ShowSchema, validateRequest } from '@/lib/schemas';
import { classifyShows, parseShowsPayload, type ShowData } from '@/lib/shows';
import { z } from 'zod';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const CONTENT_KEY = 'shows';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Disable caching for dynamic data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/** Reads flat shows array from backend, migrating legacy split format if needed */
async function getShowsFromBackend(): Promise<ShowData[]> {
  try {
    const response = await fetch(`${API_URL}/content/${CONTENT_KEY}`, {
      cache: 'no-store',
    });
    if (!response.ok) return [];
    const data = await response.json();
    const shows = parseShowsPayload(data);

    // Auto-migrate legacy format to flat array on first read
    if (!Array.isArray(data?.shows) && shows.length > 0) {
      await saveShowsToBackend(shows);
    }

    return shows;
  } catch {
    return [];
  }
}

async function saveShowsToBackend(shows: ShowData[]): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/admin/content/${CONTENT_KEY}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-API-Key': process.env.INTERNAL_API_KEY || '',
      },
      body: JSON.stringify({ value: { shows } }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

function sanitizeShowInput(raw: Record<string, unknown>) {
  const show = { ...raw };
  if (show.ticketUrl === '') show.ticketUrl = null;
  if (show.posterUrl === '') show.posterUrl = null;
  if (show.doorsTime === '') delete show.doorsTime;
  return show;
}

export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const shows = await getShowsFromBackend();
    const { upcoming, past } = classifyShows(shows);
    return NextResponse.json({ upcomingShows: upcoming, pastShows: past }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const showInput = sanitizeShowInput(body.show);
    const showValidation = validateRequest(ShowSchema, showInput);

    if (!showValidation.success) {
      return NextResponse.json({ error: showValidation.error }, { status: 400 });
    }

    const shows = await getShowsFromBackend();
    const newShow: ShowData = { ...showValidation.data, id: generateId() } as ShowData;
    shows.push(newShow);

    await saveShowsToBackend(shows);
    return NextResponse.json(newShow, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const showInput = sanitizeShowInput(body.show);
    const showValidation = validateRequest(ShowSchema.extend({ id: z.string() }), showInput);

    if (!showValidation.success) {
      return NextResponse.json({ error: showValidation.error }, { status: 400 });
    }

    const show = showValidation.data;
    const shows = await getShowsFromBackend();
    const index = shows.findIndex((s) => s.id === show.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    shows[index] = show as ShowData;
    await saveShowsToBackend(shows);

    return NextResponse.json(show);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Show ID required' }, { status: 400 });
    }

    const shows = await getShowsFromBackend();
    const filtered = shows.filter((s) => s.id !== id);

    await saveShowsToBackend(filtered);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
