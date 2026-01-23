import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { VisibilityConfig, defaultVisibilityConfig } from '@/lib/visibility-config';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const CONTENT_KEY = 'visibility';

interface VisibilityData {
  config: VisibilityConfig;
  updatedAt: string;
}

const defaultData: VisibilityData = {
  config: defaultVisibilityConfig,
  updatedAt: new Date().toISOString(),
};

// Disable caching for dynamic data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getContentFromBackend(): Promise<VisibilityData> {
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

async function saveContentToBackend(data: VisibilityData, token: string): Promise<boolean> {
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

// GET - Fetch current visibility config (public)
export async function GET() {
  try {
    const data = await getContentFromBackend();
    return NextResponse.json(data?.config || defaultVisibilityConfig, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch {
    // Return default config if fetch fails
    return NextResponse.json(defaultVisibilityConfig, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  }
}

// PUT - Update visibility config (admin only)
export async function PUT(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate the config structure (basic check)
    if (!body.pages || !body.navigation || !body.sections || !body.elements) {
      return NextResponse.json({ error: 'Invalid visibility config structure' }, { status: 400 });
    }

    const token = request.cookies.get('admin_token')?.value || '';

    const data: VisibilityData = {
      config: body as VisibilityConfig,
      updatedAt: new Date().toISOString(),
    };

    await saveContentToBackend(data, token);

    return NextResponse.json({ success: true, config: data.config });
  } catch (error) {
    console.error('Error saving visibility config:', error);
    return NextResponse.json({ error: 'Failed to save visibility config' }, { status: 500 });
  }
}

// PATCH - Update a single visibility setting (admin only)
export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { path, value } = body;

    if (typeof path !== 'string' || typeof value !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request: path (string) and value (boolean) required' }, { status: 400 });
    }

    // Get current config
    const data = await getContentFromBackend();
    const token = request.cookies.get('admin_token')?.value || '';

    // Update the specific path
    const parts = path.split('.');
    let current: Record<string, unknown> = data.config as unknown as Record<string, unknown>;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        return NextResponse.json({ error: `Invalid path: ${path}` }, { status: 400 });
      }
      current = current[parts[i]] as Record<string, unknown>;
    }

    const lastKey = parts[parts.length - 1];
    if (!(lastKey in current)) {
      return NextResponse.json({ error: `Invalid path: ${path}` }, { status: 400 });
    }

    current[lastKey] = value;
    data.updatedAt = new Date().toISOString();

    await saveContentToBackend(data, token);

    return NextResponse.json({ success: true, path, value });
  } catch (error) {
    console.error('Error updating visibility setting:', error);
    return NextResponse.json({ error: 'Failed to update visibility setting' }, { status: 500 });
  }
}
