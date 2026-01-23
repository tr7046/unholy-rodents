import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const CONTENT_KEY = 'homepage';

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

// Disable caching for dynamic data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

async function saveContentToBackend(data: HomepageData, token: string): Promise<boolean> {
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

export async function PUT(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = await getContentFromBackend();
    const token = request.cookies.get('admin_token')?.value || '';

    const updatedData: HomepageData = {
      hero: body.hero || data.hero,
      featuredShow: body.featuredShow || data.featuredShow,
      featuredRelease: body.featuredRelease || data.featuredRelease,
    };

    await saveContentToBackend(updatedData, token);
    return NextResponse.json(updatedData);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
