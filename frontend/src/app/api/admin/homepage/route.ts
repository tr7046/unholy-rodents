import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { readData, writeData } from '@/lib/data';

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

// Disable caching for dynamic data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await readData<HomepageData>('homepage');
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
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
    const data = await readData<HomepageData>('homepage');

    const updatedData: HomepageData = {
      hero: body.hero || data.hero,
      featuredShow: body.featuredShow || data.featuredShow,
      featuredRelease: body.featuredRelease || data.featuredRelease,
    };

    await writeData('homepage', updatedData);
    return NextResponse.json(updatedData);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
