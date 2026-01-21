import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

  // Validate file type and size
  const allowedTypes = ['image/png', 'image/jpeg'];
  if (!allowedTypes.includes(file.type) || file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
  }

  // Rename and store file outside web root
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(process.cwd(), 'uploads', filename), buffer);

  return NextResponse.json({ success: true, filename });
}