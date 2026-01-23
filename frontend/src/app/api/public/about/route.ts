import { NextResponse } from 'next/server';
import { readData } from '@/lib/data';

// Disable caching for dynamic data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Member {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

interface AboutData {
  members: Member[];
  influences: string[];
  philosophy: { title: string; description: string }[];
  bio: string[];
}

export async function GET() {
  try {
    const data = await readData<AboutData>('about');
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load about data' }, { status: 500 });
  }
}
