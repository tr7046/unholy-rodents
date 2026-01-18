import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { readData, writeData, generateId } from '@/lib/data';

interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  createdAt: string;
}

interface MediaData {
  photos: MediaItem[];
  videos: MediaItem[];
  flyers: MediaItem[];
}

export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await readData<MediaData>('media');
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { item, type } = await request.json();
    const data = await readData<MediaData>('media');

    const newItem: MediaItem = {
      ...item,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    if (type === 'photos') {
      data.photos.push(newItem);
    } else if (type === 'videos') {
      data.videos.push(newItem);
    } else if (type === 'flyers') {
      data.flyers.push(newItem);
    }

    await writeData('media', data);
    return NextResponse.json(newItem, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type') as 'photos' | 'videos' | 'flyers';

    if (!id || !type) {
      return NextResponse.json({ error: 'ID and type required' }, { status: 400 });
    }

    const data = await readData<MediaData>('media');
    data[type] = data[type].filter((item) => item.id !== id);
    await writeData('media', data);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
