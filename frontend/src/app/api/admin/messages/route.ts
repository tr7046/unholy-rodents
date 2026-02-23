import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const internalHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Internal-API-Key': process.env.INTERNAL_API_KEY || '',
});

export async function GET(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const response = await fetch(`${API_URL}/admin/messages?${searchParams}`, {
      headers: internalHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      // Don't forward raw backend errors - return a clean error
      return NextResponse.json(
        { error: 'Failed to fetch messages', total: 0, unreadCount: 0, data: [] },
        { status: 200, headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    const response = await fetch(`${API_URL}/admin/messages/${id}`, {
      method: 'PATCH',
      headers: internalHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
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
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    }

    const response = await fetch(`${API_URL}/admin/messages/${id}`, {
      method: 'DELETE',
      headers: internalHeaders(),
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
