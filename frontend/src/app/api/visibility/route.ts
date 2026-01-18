import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/data';
import { isAuthenticated } from '@/lib/auth';
import { VisibilityConfig, defaultVisibilityConfig } from '@/lib/visibility-config';

interface VisibilityData {
  config: VisibilityConfig;
  updatedAt: string;
}

// GET - Fetch current visibility config (public)
export async function GET() {
  try {
    const data = await readData<VisibilityData>('visibility');
    return NextResponse.json(data?.config || defaultVisibilityConfig);
  } catch {
    // Return default config if file doesn't exist
    return NextResponse.json(defaultVisibilityConfig);
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

    const data: VisibilityData = {
      config: body as VisibilityConfig,
      updatedAt: new Date().toISOString(),
    };

    await writeData('visibility', data);

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
    let data: VisibilityData;
    try {
      data = await readData<VisibilityData>('visibility');
    } catch {
      data = { config: defaultVisibilityConfig, updatedAt: new Date().toISOString() };
    }

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

    await writeData('visibility', data);

    return NextResponse.json({ success: true, path, value });
  } catch (error) {
    console.error('Error updating visibility setting:', error);
    return NextResponse.json({ error: 'Failed to update visibility setting' }, { status: 500 });
  }
}
