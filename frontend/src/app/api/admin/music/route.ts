import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { readData, writeData, generateId } from '@/lib/data';

interface Release {
  id: string;
  title: string;
  type: 'album' | 'ep' | 'single';
  releaseDate: string;
  coverArt: string;
  tracks: { title: string; duration: string }[];
  streamingLinks: { platform: string; url: string }[];
}

interface MusicData {
  releases: Release[];
  streamingPlatforms: { name: string; url: string; color: string }[];
}

export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await readData<MusicData>('music');
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

    const release = await request.json();
    const data = await readData<MusicData>('music');

    const newRelease: Release = {
      ...release,
      id: generateId(),
    };

    data.releases.push(newRelease);
    await writeData('music', data);

    return NextResponse.json(newRelease, { status: 201 });
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

    // Handle streaming platforms update
    if (body.streamingPlatforms) {
      const data = await readData<MusicData>('music');
      data.streamingPlatforms = body.streamingPlatforms;
      await writeData('music', data);
      return NextResponse.json(data);
    }

    // Handle release update
    const release = body;
    const data = await readData<MusicData>('music');

    const index = data.releases.findIndex((r) => r.id === release.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 });
    }

    data.releases[index] = release;
    await writeData('music', data);

    return NextResponse.json(release);
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
      return NextResponse.json({ error: 'Release ID required' }, { status: 400 });
    }

    const data = await readData<MusicData>('music');
    data.releases = data.releases.filter((r) => r.id !== id);
    await writeData('music', data);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
