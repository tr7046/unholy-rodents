import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

const router = Router();

// Allowed file types and max size
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FOLDERS = ['media', 'members', 'releases', 'flyers'];

// POST /api/v1/admin/upload - Upload a file
router.post('/', async (req: Request, res: Response) => {
  try {
    // Check content type
    const contentType = req.headers['content-type'];
    if (!contentType?.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Content-Type must be multipart/form-data' });
    }

    // Parse multipart form data manually (simple implementation)
    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => resolve());
      req.on('error', reject);
    });

    const body = Buffer.concat(chunks);
    const boundary = contentType.split('boundary=')[1];

    if (!boundary) {
      return res.status(400).json({ error: 'Missing boundary in content-type' });
    }

    // Parse the multipart data
    const parts = parseMultipart(body, boundary);

    const filePart = parts.find(p => p.name === 'file');
    const folderPart = parts.find(p => p.name === 'folder');

    if (!filePart || !filePart.data) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const folder = folderPart?.value || 'media';

    if (!ALLOWED_FOLDERS.includes(folder)) {
      return res.status(400).json({ error: `Invalid folder. Allowed: ${ALLOWED_FOLDERS.join(', ')}` });
    }

    // Validate file type
    if (!filePart.contentType || !ALLOWED_TYPES.includes(filePart.contentType)) {
      return res.status(415).json({ error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` });
    }

    // Validate file size
    if (filePart.data.length > MAX_SIZE) {
      return res.status(413).json({ error: `File too large. Max ${MAX_SIZE / 1024 / 1024}MB` });
    }

    // Generate unique filename
    const ext = path.extname(filePart.filename || '.jpg').toLowerCase();
    const randomId = crypto.randomBytes(8).toString('hex');
    const filename = `${Date.now()}-${randomId}${ext}`;

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await fs.mkdir(uploadDir, { recursive: true });

    // Write file
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, filePart.data);

    // Return the URL (relative path that can be served)
    const url = `/uploads/${folder}/${filename}`;

    console.log('[upload] Success:', url);
    res.json({ url });
  } catch (error) {
    console.error('[upload] Failed:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

interface MultipartPart {
  name: string;
  filename?: string;
  contentType?: string;
  data?: Buffer;
  value?: string;
}

function parseMultipart(body: Buffer, boundary: string): MultipartPart[] {
  const parts: MultipartPart[] = [];
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const endBoundary = Buffer.from(`--${boundary}--`);

  let start = body.indexOf(boundaryBuffer) + boundaryBuffer.length + 2; // +2 for CRLF

  while (start < body.length) {
    const end = body.indexOf(boundaryBuffer, start);
    if (end === -1) break;

    const part = body.slice(start, end - 2); // -2 for CRLF before boundary
    const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));

    if (headerEnd === -1) {
      start = end + boundaryBuffer.length + 2;
      continue;
    }

    const headers = part.slice(0, headerEnd).toString();
    const data = part.slice(headerEnd + 4);

    // Parse headers
    const nameMatch = headers.match(/name="([^"]+)"/);
    const filenameMatch = headers.match(/filename="([^"]+)"/);
    const contentTypeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/i);

    if (nameMatch) {
      const parsedPart: MultipartPart = {
        name: nameMatch[1],
      };

      if (filenameMatch) {
        parsedPart.filename = filenameMatch[1];
        parsedPart.contentType = contentTypeMatch?.[1];
        parsedPart.data = data;
      } else {
        parsedPart.value = data.toString();
      }

      parts.push(parsedPart);
    }

    start = end + boundaryBuffer.length + 2;

    // Check if this is the end boundary
    if (body.slice(end, end + endBoundary.length).equals(endBoundary)) {
      break;
    }
  }

  return parts;
}

export default router;
