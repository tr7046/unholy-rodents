import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { readData, writeData, generateId } from '@/lib/data';
import { ShowSchema, validateRequest } from '@/lib/schemas';
import { z } from 'zod';

type Show = z.infer<typeof ShowSchema> & { id: string };

interface ShowsData {
  upcomingShows: Show[];
  pastShows: Show[];
}

const ShowTypeSchema = z.enum(['upcoming', 'past']);

// Disable caching for dynamic data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await readData<ShowsData>('shows');
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
      return NextResponse.json({ error: 'Invalid show type ya cunt' }, { status: 400 });
    }

    const data = await readData<ShowsData>('shows');

    const newShow: Show = {
      ...showValidation.data,
      id: generateId(),
    };

    if (typeValidation.data === 'upcoming') {
      data.upcomingShows.push(newShow);
    } else {
      data.pastShows.push(newShow);
    }

    await writeData('shows', data);
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
      return NextResponse.json({ error: 'Invalid show type ya cunt' }, { status: 400 });
    }

    const show = showValidation.data;
    const data = await readData<ShowsData>('shows');

    const list = typeValidation.data === 'upcoming' ? data.upcomingShows : data.pastShows;
    const index = list.findIndex((s) => s.id === show.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    list[index] = show as Show;
    await writeData('shows', data);

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

    const data = await readData<ShowsData>('shows');

    if (type === 'upcoming') {
      data.upcomingShows = data.upcomingShows.filter((s) => s.id !== id);
    } else {
      data.pastShows = data.pastShows.filter((s) => s.id !== id);
    }

    await writeData('shows', data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
