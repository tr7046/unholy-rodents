import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const defaultConfig = {
  ogImage: '',
};

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/content/site-config`, {
      cache: 'no-store',
    });
    if (!response.ok) return NextResponse.json(defaultConfig);
    const data = await response.json();
    return NextResponse.json({ ...defaultConfig, ...data });
  } catch {
    return NextResponse.json(defaultConfig);
  }
}
