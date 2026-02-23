import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const CONTENT_KEY = 'socials';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SocialLinks {
  instagram: string;
  facebook: string;
  youtube: string;
  spotify: string;
  tiktok: string;
  twitter: string;
  bandcamp: string;
}

const defaultLinks: SocialLinks = {
  instagram: '',
  facebook: '',
  youtube: '',
  spotify: '',
  tiktok: '',
  twitter: '',
  bandcamp: '',
};

async function getFromBackend(): Promise<SocialLinks> {
  try {
    const response = await fetch(`${API_URL}/content/${CONTENT_KEY}`, {
      cache: 'no-store',
    });
    if (!response.ok) return defaultLinks;
    const data = await response.json();
    return { ...defaultLinks, ...data };
  } catch {
    return defaultLinks;
  }
}

async function saveToBackend(data: SocialLinks): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/admin/content/${CONTENT_KEY}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-API-Key': process.env.INTERNAL_API_KEY || '',
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
    const data = await getFromBackend();
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
    const data: SocialLinks = {
      instagram: body.instagram || '',
      facebook: body.facebook || '',
      youtube: body.youtube || '',
      spotify: body.spotify || '',
      tiktok: body.tiktok || '',
      twitter: body.twitter || '',
      bandcamp: body.bandcamp || '',
    };
    const saved = await saveToBackend(data);
    if (!saved) {
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
