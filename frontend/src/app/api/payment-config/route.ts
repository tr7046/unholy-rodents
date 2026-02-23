import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const dynamic = 'force-dynamic';

// Public endpoint — returns only whether payments are configured and the active provider
export async function GET() {
  try {
    const response = await fetch(`${API_URL}/payment-config/public`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ configured: false, activeProvider: null });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ configured: false, activeProvider: null });
  }
}
