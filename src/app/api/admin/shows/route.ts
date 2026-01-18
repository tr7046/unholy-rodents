import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { readData, writeData, generateId } from '@/lib/data';

interface Show {
  id: string;
  date: string;
  venue: {
    name: string;
    city: string;
    state: string;
  };
  doorsTime?: string;
  ticketUrl?: string | null;
  bands?: { name: string; isHeadliner: boolean }[];
}

interface ShowsData {
  upcomingShows: Show[];
  pastShows: Show[];
}

export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await readData<ShowsData>('shows');
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { show, type } = await request.json();
    const data = await readData<ShowsData>('shows');

    const newShow: Show = {
      ...show,
      id: generateId(),
    };

    if (type === 'upcoming') {
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

    const { show, type } = await request.json();
    const data = await readData<ShowsData>('shows');

    const list = type === 'upcoming' ? data.upcomingShows : data.pastShows;
    const index = list.findIndex((s) => s.id === show.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    list[index] = show;
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
