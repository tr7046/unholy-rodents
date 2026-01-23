import { NextResponse } from 'next/server';
import { readData } from '@/lib/data';

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

export async function GET() {
  try {
    const data = await readData<MediaData>('media');
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load media data' }, { status: 500 });
  }
}
