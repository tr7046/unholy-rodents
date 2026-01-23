import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const CONTENT_KEY = 'media';

// Disable caching for dynamic data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  type: 'photo' | 'video' | 'flyer';
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

async function getContentFromBackend(): Promise<MediaData> {
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

export async function GET() {
  try {
    const data = await getContentFromBackend();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load media data' }, { status: 500 });
  }
}
