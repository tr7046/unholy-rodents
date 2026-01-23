import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES, ALLOWED_FOLDERS } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'media';

    if (!file) {
      return NextResponse.json({ error: 'No file provided ya drongo' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too big ya greedy cunt. Max ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 413 }
      );
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type ya muppet. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}` },
        { status: 415 }
      );
    }

    // Validate folder
    if (!ALLOWED_FOLDERS.includes(folder as typeof ALLOWED_FOLDERS[number])) {
      return NextResponse.json(
        { error: `Invalid folder. Allowed: ${ALLOWED_FOLDERS.join(', ')}` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = path.extname(file.name).toLowerCase();
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    const relativePath = `/uploads/${folder}/${filename}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    const absolutePath = path.join(uploadDir, filename);

    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });
    await writeFile(absolutePath, buffer);

    return NextResponse.json({ url: relativePath });
  } catch (error) {
    console.error('[upload] Failed:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
