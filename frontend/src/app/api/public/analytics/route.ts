import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// POST - Record a pageview or play event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    if (type !== 'pageview' && type !== 'play') {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    const endpoint = type === 'pageview' ? 'pageview' : 'play';

    const res = await fetch(`${API_URL}/analytics/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to record event' }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
  }
}

// GET - Fetch public play counts
export async function GET() {
  try {
    const res = await fetch(`${API_URL}/analytics/plays`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!res.ok) {
      return NextResponse.json({ tracks: {}, releases: {} });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ tracks: {}, releases: {} });
  }
}
