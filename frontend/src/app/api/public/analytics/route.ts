import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// POST - Record a pageview or play event (fire-and-forget, always returns 200)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    if (type !== 'pageview' && type !== 'play') {
      return NextResponse.json({ success: false });
    }

    const endpoint = type === 'pageview' ? 'pageview' : 'play';

    const res = await fetch(`${API_URL}/analytics/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    return NextResponse.json({ success: res.ok });
  } catch {
    // Analytics should never fail the user experience
    return NextResponse.json({ success: false });
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
