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
    title: 'UNHOLY RODENTS',
    tagline: ['SQUIRRELCORE FROM THE DEPTHS OF THE SQUNDERWORLD', 'HAIL SQUĀTAN'],
    marqueeText: 'HAIL SQUATAN /// FUCK ANIMAL CONTROL /// STAY NUTS /// SQUIRRELCORE',
  },
  featuredShow: {
    enabled: true,
    showId: null,
  },
  featuredRelease: {
    enabled: true,
    releaseId: null,
    placeholderText: 'New music is in the works. Stay tuned for announcements about our upcoming releases.',
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
    const data = await response.json();
    return {
      hero: {
        title: data?.hero?.title || defaultData.hero.title,
        tagline: Array.isArray(data?.hero?.tagline) ? data.hero.tagline : defaultData.hero.tagline,
        marqueeText: data?.hero?.marqueeText || defaultData.hero.marqueeText,
      },
      featuredShow: {
        enabled: data?.featuredShow?.enabled ?? defaultData.featuredShow.enabled,
        showId: data?.featuredShow?.showId || null,
      },
      featuredRelease: {
        enabled: data?.featuredRelease?.enabled ?? defaultData.featuredRelease.enabled,
        releaseId: data?.featuredRelease?.releaseId || null,
        placeholderText: data?.featuredRelease?.placeholderText || defaultData.featuredRelease.placeholderText,
      },
    };
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
