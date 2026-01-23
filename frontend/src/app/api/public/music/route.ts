import { NextResponse } from 'next/server';
import { readData } from '@/lib/data';

// Disable caching for dynamic data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    const data = await readData<MusicData>('music');
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load music data' }, { status: 500 });
  }
}
