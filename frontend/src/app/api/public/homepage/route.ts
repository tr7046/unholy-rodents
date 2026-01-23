import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const CONTENT_KEY = 'homepage';

// Disable caching for dynamic data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HomepageData {
  hero: {
    title: string;
    tagline: string[];
    marqueeText: string;
  };
  featuredShow: {
    enabled: boolean;
    showId: string | null;
  };
  featuredRelease: {
    enabled: boolean;
    releaseId: string | null;
    placeholderText: string;
  };
}

const defaultData: HomepageData = {
  hero: {
    title: 'UNIVERSAL RHYTHM',
    tagline: ['CHAOS', 'NOISE', 'FURY'],
    marqueeText: 'UNIVERSAL RHYTHM',
  },
  featuredShow: {
    enabled: false,
    showId: null,
  },
  featuredRelease: {
    enabled: false,
    releaseId: null,
    placeholderText: 'NEW MUSIC COMING SOON',
  },
};

async function getContentFromBackend(): Promise<HomepageData> {
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
    return NextResponse.json({ error: 'Failed to load homepage data' }, { status: 500 });
  }
}
