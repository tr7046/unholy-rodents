import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || process.env.JWT_SECRET || '';

// GET - Fetch analytics data for admin dashboard
export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section') || 'overview';
  const days = searchParams.get('days') || '30';

  try {
    const res = await fetch(`${API_URL}/admin/analytics/${section}?days=${days}`, {
      headers: {
        'X-Internal-API-Key': INTERNAL_API_KEY,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
