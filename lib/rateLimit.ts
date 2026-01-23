import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter for Next.js
class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();

  constructor(
    private windowMs: number = 15 * 60 * 1000, // 15 minutes
    private maxRequests: number = 100,
    public message: string = 'Too many requests, please try again later.'
  ) {}

  check(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record || now > record.resetTime) {
      // First request or window expired
      this.requests.set(key, { count: 1, resetTime: now + this.windowMs });
      return { allowed: true, remaining: this.maxRequests - 1, resetTime: now + this.windowMs };
    }

    if (record.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }

    record.count++;
    return { allowed: true, remaining: this.maxRequests - record.count, resetTime: record.resetTime };
  }

  // Clean up old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Create rate limiter instances
export const authRateLimit = new RateLimiter(15 * 60 * 1000, 5, 'Too many authentication attempts, please try again later.');
export const apiRateLimit = new RateLimiter(15 * 60 * 1000, 100, 'Too many requests, please try again later.');
export const uploadRateLimit = new RateLimiter(60 * 60 * 1000, 10, 'Too many uploads, please try again later.');
export const contactRateLimit = new RateLimiter(60 * 60 * 1000, 3, 'Too many contact form submissions, please try again later.');

// Helper function to apply rate limiting to Next.js API routes
export function withRateLimit(handler: Function, limiter: RateLimiter) {
  return async (request: NextRequest, context?: any) => {
    // Get client IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               request.headers.get('cf-connecting-ip') ||
               'unknown';

    // Check rate limit
    const result = limiter.check(ip);

    if (!result.allowed) {
      return NextResponse.json(
        { error: limiter.message },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful response
    const response = await handler(request, context);

    if (response instanceof NextResponse) {
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
    }

    return response;
  };
}

// Periodic cleanup (run this in a cron job or similar)
setInterval(() => {
  authRateLimit.cleanup();
  apiRateLimit.cleanup();
  uploadRateLimit.cleanup();
  contactRateLimit.cleanup();
}, 60 * 1000); // Clean up every minute