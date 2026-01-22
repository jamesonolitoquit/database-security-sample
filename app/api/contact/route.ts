import { NextResponse } from 'next/server';
import { withRateLimit, contactRateLimit } from '@/lib/rateLimit';

async function contactHandler(request: Request) {
  const data = await request.json();
  // Honeypot field (should be empty)
  if (data.hiddenField) return NextResponse.json({ error: 'Spam detected' }, { status: 400 });

  // Server-side validation
  if (typeof data.email !== 'string' || !data.email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  if (typeof data.message !== 'string' || data.message.length < 10) {
    return NextResponse.json({ error: 'Message too short' }, { status: 400 });
  }

  // Process message...
  return NextResponse.json({ success: true });
}

export const POST = withRateLimit(contactHandler, contactRateLimit);