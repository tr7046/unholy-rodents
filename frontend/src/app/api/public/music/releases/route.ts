import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 });
    }

    const response = await fetch(`${API_URL}/content/${CONTENT_KEY}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const data: MusicData = await response.json();
    const releases = Array.isArray(data?.releases) ? data.releases : [];
    const release = releases.find((r) => r.slug === slug);

    if (!release) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 });
    }

    // If private, don't send audio/lyrics until password verified
    if (release.visibility === 'private') {
      const password = searchParams.get('password');
      if (password !== release.password) {
        // Return metadata only (no audio URLs, no lyrics)
        return NextResponse.json({
          release: {
            ...release,
            tracks: release.tracks.map((t) => ({ title: t.title, duration: t.duration })),
            password: undefined,
            requiresPassword: true,
          },
          streamingPlatforms: data.streamingPlatforms || [],
        });
      }
    }

    // Strip password from response
    return NextResponse.json({
      release: { ...release, password: undefined },
      streamingPlatforms: data.streamingPlatforms || [],
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
