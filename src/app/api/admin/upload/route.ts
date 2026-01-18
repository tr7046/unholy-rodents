import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'media';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = path.extname(file.name);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    const relativePath = `/uploads/${folder}/${filename}`;
    const absolutePath = path.join(process.cwd(), 'public', relativePath);

    await writeFile(absolutePath, buffer);

    return NextResponse.json({ url: relativePath });
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
