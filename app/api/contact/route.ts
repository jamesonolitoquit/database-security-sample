import { NextResponse } from 'next/server';
import { withRateLimit, contactRateLimit } from '@/lib/rateLimit';
import { z } from "zod";
import { verifyCaptcha } from "@/lib/captcha";

const ContactRequestSchema = z.object({
  email: z.string().email(),
  message: z.string().min(10),
  hiddenField: z.string().optional(),
  captchaToken: z.string().optional(),
});

async function contactHandler(request: Request) {
  const data = await request.json();

  const validation = ContactRequestSchema.safeParse(data);
  if (!validation.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Honeypot field (should be empty)
  if (validation.data.hiddenField) {
    return NextResponse.json({ error: "Spam detected" }, { status: 400 });
  }

  // CAPTCHA verification
  const captchaValid = await verifyCaptcha(validation.data.captchaToken);
  if (!captchaValid) {
    return NextResponse.json({ error: "CAPTCHA verification failed" }, { status: 400 });
  }

  // Process message...
  return NextResponse.json({ success: true });
}

export const POST = withRateLimit(contactHandler, contactRateLimit);