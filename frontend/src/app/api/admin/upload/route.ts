import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET - Generate signed upload params for direct browser-to-Cloudinary upload
export async function GET(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const folder = request.nextUrl.searchParams.get('folder') || 'general';
    const resourceType = request.nextUrl.searchParams.get('resource_type') || 'auto';
    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign: Record<string, string | number> = {
      timestamp,
      folder: `unholy-rodents/${folder}`,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!,
    );

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: `unholy-rodents/${folder}`,
      resourceType,
    });
  } catch (error) {
    console.error('[upload] Signature generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate upload signature' }, { status: 500 });
  }
}

// POST - Kept as fallback, uses base64 data URL approach instead of upload_stream
export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Determine resource type and size limit based on file type
    const isAudio = file.type.startsWith('audio/');
    const maxSize = isAudio ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 50MB audio, 5MB images

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max ${isAudio ? '50MB' : '5MB'}` },
        { status: 400 }
      );
    }

    // Convert to base64 data URL (works on Vercel unlike upload_stream)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: `unholy-rodents/${folder}`,
      resource_type: isAudio ? 'video' : 'auto', // Cloudinary uses 'video' for audio
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error('[upload] Failed:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
