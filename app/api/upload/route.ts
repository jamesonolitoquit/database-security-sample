import { NextResponse, NextRequest } from 'next/server';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { withRateLimit, uploadRateLimit } from '@/lib/rateLimit';

async function uploadHandler(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

  // Validate file type and size
  const allowedTypes = ['image/png', 'image/jpeg'];
  const maxFileSize = 2 * 1024 * 1024; // 2MB

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
  }

  if (file.size > maxFileSize) {
    return NextResponse.json({ error: 'File size exceeds limit' }, { status: 400 });
  }

  // Rename file to prevent collisions and sanitize name
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.]/g, '');
  const uniqueFilename = `${Date.now()}-${sanitizedFilename}`;

  // Store file outside web root
  const uploadDir = path.join(process.cwd(), 'uploads');
  const filePath = path.join(uploadDir, uniqueFilename);

  await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ success: true, filename: uniqueFilename });
}

export const POST = withRateLimit(uploadHandler, uploadRateLimit);