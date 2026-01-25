import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const CONTENT_KEY = 'music';

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

const defaultData: MusicData = {
  releases: [],
  streamingPlatforms: [],
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Disable caching for dynamic data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getContentFromBackend(): Promise<MusicData> {
  try {
    const response = await fetch(`${API_URL}/content/${CONTENT_KEY}`, {
      cache: 'no-store',
    });
    if (!response.ok) return defaultData;
    const data = await response.json();
    return {
      releases: Array.isArray(data?.releases) ? data.releases : defaultData.releases,
      streamingPlatforms: Array.isArray(data?.streamingPlatforms) ? data.streamingPlatforms : defaultData.streamingPlatforms,
    };
  } catch {
    return defaultData;
  }
}

async function saveContentToBackend(data: MusicData, token: string): Promise<boolean> {
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

    const release = await request.json();
    const data = await getContentFromBackend();
    const token = request.cookies.get('admin_token')?.value || '';

    const newRelease: Release = {
      ...release,
      id: generateId(),
    };

    data.releases.push(newRelease);
    await saveContentToBackend(data, token);

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
    const data = await getContentFromBackend();
    const token = request.cookies.get('admin_token')?.value || '';

    // Handle streaming platforms update
    if (body.streamingPlatforms) {
      data.streamingPlatforms = body.streamingPlatforms;
      await saveContentToBackend(data, token);
      return NextResponse.json(data);
    }

    // Handle release update
    const release = body;
    const index = data.releases.findIndex((r) => r.id === release.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 });
    }

    data.releases[index] = release;
    await saveContentToBackend(data, token);

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

    const data = await getContentFromBackend();
    const token = request.cookies.get('admin_token')?.value || '';
    data.releases = data.releases.filter((r) => r.id !== id);
    await saveContentToBackend(data, token);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
