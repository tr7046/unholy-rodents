import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { readData, writeData, generateId } from '@/lib/data';

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

// Disable caching for dynamic data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await readData<AboutData>('about');
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
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
    const data = await readData<AboutData>('about');

    // Handle member operations
    if (body.action === 'addMember') {
      const newMember: Member = {
        ...body.member,
        id: generateId(),
      };
      data.members.push(newMember);
      await writeData('about', data);
      return NextResponse.json(newMember);
    }

    if (body.action === 'updateMember') {
      const index = data.members.findIndex((m) => m.id === body.member.id);
      if (index !== -1) {
        data.members[index] = body.member;
        await writeData('about', data);
      }
      return NextResponse.json(body.member);
    }

    if (body.action === 'deleteMember') {
      data.members = data.members.filter((m) => m.id !== body.memberId);
      await writeData('about', data);
      return NextResponse.json({ success: true });
    }

    // Handle full data update
    const updatedData: AboutData = {
      members: body.members || data.members,
      influences: body.influences || data.influences,
      philosophy: body.philosophy || data.philosophy,
      bio: body.bio || data.bio,
    };

    await writeData('about', updatedData);
    return NextResponse.json(updatedData);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
