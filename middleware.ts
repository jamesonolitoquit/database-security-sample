import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  // For local development, comment out the CSP header to allow inline scripts
  // response.headers.set('Content-Security-Policy', "default-src 'self'; img-src *; script-src 'self'; style-src 'self' 'unsafe-inline'");
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=()');
  return response;
}