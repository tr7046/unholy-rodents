import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const CONTENT_KEY = 'about';

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

const defaultData: AboutData = {
  members: [],
  influences: [
    'Black Sabbath',
    'Slayer',
    'Municipal Waste',
    'Power Trip',
    'Suicidal Tendencies',
    'D.R.I.',
  ],
  philosophy: [
    { title: 'CHAOS', description: 'Embrace the madness. Let the riffs consume you.' },
    { title: 'COMMUNITY', description: 'The pit is family. We protect our own.' },
    { title: 'AUTHENTICITY', description: 'No posers. No bullshit. Just pure squirrelcore fury.' },
  ],
  bio: [
    'Unholy Rodents emerged from the depths of Central Florida with one mission: to unleash squirrelcore upon the world.',
    'What started as a joke about squirrels worshipping Satan quickly evolved into something more - a full-blown musical movement blending thrash, punk, and pure chaos.',
    'Hail Squatan. Fuck Animal Control. Stay Nuts.',
  ],
};

async function getContentFromBackend(): Promise<AboutData> {
  try {
    const response = await fetch(`${API_URL}/content/${CONTENT_KEY}`, {
      cache: 'no-store',
    });
    if (!response.ok) return defaultData;
    const data = await response.json();
    // Merge with defaults to ensure all required arrays exist
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

export async function GET() {
  try {
    const data = await getContentFromBackend();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load about data' }, { status: 500 });
  }
}
