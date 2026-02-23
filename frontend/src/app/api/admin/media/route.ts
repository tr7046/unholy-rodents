import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const CONTENT_KEY = 'media';

interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  createdAt: string;
}

interface MediaData {
  photos: MediaItem[];
  videos: MediaItem[];
  flyers: MediaItem[];
}

const defaultData: MediaData = {
  photos: [],
  videos: [],
  flyers: [],
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Disable caching for dynamic data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getContentFromBackend(): Promise<MediaData> {
  try {
    const response = await fetch(`${API_URL}/content/${CONTENT_KEY}`, {
      cache: 'no-store',
    });
    if (!response.ok) return defaultData;
    const data = await response.json();
    return {
      photos: Array.isArray(data?.photos) ? data.photos : defaultData.photos,
      videos: Array.isArray(data?.videos) ? data.videos : defaultData.videos,
      flyers: Array.isArray(data?.flyers) ? data.flyers : defaultData.flyers,
    };
  } catch {
    return defaultData;
  }
}

async function saveContentToBackend(data: MediaData): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/admin/content/${CONTENT_KEY}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-API-Key': process.env.INTERNAL_API_KEY || '',
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

    const { item, type } = await request.json();
    const data = await getContentFromBackend();

    const newItem: MediaItem = {
      ...item,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    if (type === 'photos') {
      data.photos.push(newItem);
    } else if (type === 'videos') {
      data.videos.push(newItem);
    } else if (type === 'flyers') {
      data.flyers.push(newItem);
    }

    await saveContentToBackend(data);
    return NextResponse.json(newItem, { status: 201 });
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
    const type = searchParams.get('type') as 'photos' | 'videos' | 'flyers';

    if (!id || !type) {
      return NextResponse.json({ error: 'ID and type required' }, { status: 400 });
    }

    const data = await getContentFromBackend();
    data[type] = data[type].filter((item) => item.id !== id);
    await saveContentToBackend(data);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
