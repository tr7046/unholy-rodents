import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the raw body as ArrayBuffer
    const formData = await request.formData();

    // Get auth token from cookies
    const token = request.cookies.get('admin_token')?.value || '';

    // Create a new FormData to send to backend
    const backendFormData = new FormData();

    const file = formData.get('file');
    const folder = formData.get('folder');

    if (file) {
      backendFormData.append('file', file);
    }
    if (folder) {
      backendFormData.append('folder', folder);
    }

    // Forward to Railway backend
    const response = await fetch(`${API_URL}/admin/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: backendFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // The URL from backend is relative to Railway, need to make it absolute
    // e.g., /uploads/members/123.jpg -> https://railway-backend.com/uploads/members/123.jpg
    const backendUrl = API_URL.replace('/api/v1', '');
    const absoluteUrl = `${backendUrl}${data.url}`;

    return NextResponse.json({ url: absoluteUrl });
  } catch (error) {
    console.error('[upload] Failed:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
