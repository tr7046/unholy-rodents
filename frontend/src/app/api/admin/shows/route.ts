import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { ShowSchema, validateRequest } from '@/lib/schemas';
import { z } from 'zod';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const CONTENT_KEY = 'shows';

type Show = z.infer<typeof ShowSchema> & { id: string };

interface ShowsData {
  upcomingShows: Show[];
  pastShows: Show[];
}

const defaultData: ShowsData = {
  upcomingShows: [],
  pastShows: [],
};

const ShowTypeSchema = z.enum(['upcoming', 'past']);

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Disable caching for dynamic data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getContentFromBackend(): Promise<ShowsData> {
  try {
    const response = await fetch(`${API_URL}/content/${CONTENT_KEY}`, {
      cache: 'no-store',
    });
    if (!response.ok) return defaultData;
    return await response.json();
  } catch {
    return defaultData;
  }
}

async function saveContentToBackend(data: ShowsData, token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/admin/content/${CONTENT_KEY}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ value: data }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getContentFromBackend();
    return NextResponse.json(data, {
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
    const showValidation = validateRequest(ShowSchema, body.show);
    const typeValidation = validateRequest(ShowTypeSchema, body.type);

    if (!showValidation.success) {
      return NextResponse.json({ error: showValidation.error }, { status: 400 });
    }
    if (!typeValidation.success) {
      return NextResponse.json({ error: 'Invalid show type' }, { status: 400 });
    }

    const data = await getContentFromBackend();
    const token = request.cookies.get('admin_token')?.value || '';

    const newShow: Show = {
      ...showValidation.data,
      id: generateId(),
    };

    if (typeValidation.data === 'upcoming') {
      data.upcomingShows.push(newShow);
    } else {
      data.pastShows.push(newShow);
    }

    await saveContentToBackend(data, token);
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
    const showValidation = validateRequest(ShowSchema.extend({ id: z.string() }), body.show);
    const typeValidation = validateRequest(ShowTypeSchema, body.type);

    if (!showValidation.success) {
      return NextResponse.json({ error: showValidation.error }, { status: 400 });
    }
    if (!typeValidation.success) {
      return NextResponse.json({ error: 'Invalid show type' }, { status: 400 });
    }

    const show = showValidation.data;
    const data = await getContentFromBackend();
    const token = request.cookies.get('admin_token')?.value || '';

    const list = typeValidation.data === 'upcoming' ? data.upcomingShows : data.pastShows;
    const index = list.findIndex((s) => s.id === show.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    list[index] = show as Show;
    await saveContentToBackend(data, token);

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
    const type = searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json({ error: 'Show ID and type required' }, { status: 400 });
    }

    const data = await getContentFromBackend();
    const token = request.cookies.get('admin_token')?.value || '';

    if (type === 'upcoming') {
      data.upcomingShows = data.upcomingShows.filter((s) => s.id !== id);
    } else {
      data.pastShows = data.pastShows.filter((s) => s.id !== id);
    }

    await saveContentToBackend(data, token);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
