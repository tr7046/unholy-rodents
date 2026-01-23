import { NextResponse } from 'next/server';
import { readData } from '@/lib/data';

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

export async function GET() {
  try {
    const data = await readData<HomepageData>('homepage');
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load homepage data' }, { status: 500 });
  }
}
