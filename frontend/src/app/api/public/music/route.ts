import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const CONTENT_KEY = 'music';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Track {
  title: string;
  duration: string;
  audioUrl?: string;
  lyrics?: string;
}

interface Release {
  id: string;
  title: string;
  type: 'album' | 'ep' | 'single';
  releaseDate: string;
  coverArt: string;
  tracks: Track[];
  streamingLinks: { platform: string; url: string }[];
  slug?: string;
  visibility?: 'public' | 'unlisted' | 'private';
  password?: string;
}

interface MusicData {
  releases: Release[];
  streamingPlatforms: { name: string; url: string; color: string }[];
}

const defaultData: MusicData = {
  releases: [],
  streamingPlatforms: [],
};

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

export async function GET() {
  try {
    const data = await getContentFromBackend();

    // Only return public releases (strip passwords)
    const publicReleases = data.releases
      .filter((r) => !r.visibility || r.visibility === 'public')
      .map(({ password, ...rest }) => rest);

    return NextResponse.json(
      {
        releases: publicReleases,
        streamingPlatforms: data.streamingPlatforms,
      },
      {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to load music data' }, { status: 500 });
  }
}
