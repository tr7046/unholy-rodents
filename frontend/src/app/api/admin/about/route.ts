import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const CONTENT_KEY = 'about';

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

const defaultData: AboutData = {
  members: [],
  influences: [],
  philosophy: [],
  bio: [],
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Disable caching for dynamic data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getContentFromBackend(): Promise<AboutData> {
  try {
    const response = await fetch(`${API_URL}/content/${CONTENT_KEY}`, {
      cache: 'no-store',
    });
    if (!response.ok) return defaultData;
    const data = await response.json();
    // Merge with defaults to ensure all required properties exist
    return {
      members: Array.isArray(data?.members) ? data.members : defaultData.members,
      influences: Array.isArray(data?.influences) ? data.influences : defaultData.influences,
      philosophy: Array.isArray(data?.philosophy) ? data.philosophy : defaultData.philosophy,
      bio: Array.isArray(data?.bio) ? data.bio : defaultData.bio,
    };
  } catch {
    return defaultData;
  }
}

async function saveContentToBackend(data: AboutData): Promise<boolean> {
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

    // Handle member operations
    if (body.action === 'addMember') {
      const newMember: Member = {
        ...body.member,
        id: generateId(),
      };
      data.members.push(newMember);
      await saveContentToBackend(data);
      return NextResponse.json(newMember);
    }

    if (body.action === 'updateMember') {
      const index = data.members.findIndex((m) => m.id === body.member.id);
      if (index !== -1) {
        data.members[index] = body.member;
        await saveContentToBackend(data);
      }
      return NextResponse.json(body.member);
    }

    if (body.action === 'deleteMember') {
      data.members = data.members.filter((m) => m.id !== body.memberId);
      await saveContentToBackend(data);
      return NextResponse.json({ success: true });
    }

    // Handle full data update
    const updatedData: AboutData = {
      members: body.members || data.members,
      influences: body.influences || data.influences,
      philosophy: body.philosophy || data.philosophy,
      bio: body.bio || data.bio,
    };

    await saveContentToBackend(updatedData);
    return NextResponse.json(updatedData);
  } catch (error) {
    console.error('[about] PUT failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
