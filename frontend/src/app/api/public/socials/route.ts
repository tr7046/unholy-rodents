import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const defaultLinks = {
  instagram: '',
  facebook: '',
  youtube: '',
  spotify: '',
  tiktok: '',
  twitter: '',
  bandcamp: '',
};

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/content/socials`, {
      cache: 'no-store',
    });
    if (!response.ok) return NextResponse.json(defaultLinks);
    const data = await response.json();
    return NextResponse.json({ ...defaultLinks, ...data });
  } catch {
    return NextResponse.json(defaultLinks);
  }
}
