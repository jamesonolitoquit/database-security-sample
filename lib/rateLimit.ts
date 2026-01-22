import rateLimit from 'express-rate-limit';
import { NextRequest } from 'next/server';

// Rate limiting configurations
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: { error: 'Too many uploads, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const contactRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 contact form submissions per hour
  message: { error: 'Too many contact form submissions, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper function to apply rate limiting to Next.js API routes
export function withRateLimit(handler: Function, limiter: any) {
  return async (request: NextRequest, context?: any) => {
    // Convert NextRequest to Express-like request for rate limiting
    const req = {
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      headers: Object.fromEntries(request.headers.entries()),
      method: request.method,
      url: request.url,
    };

    // Check rate limit
    const result = await new Promise((resolve, reject) => {
      limiter(req as any, {} as any, (result: any) => {
        if (result && result.error) {
          resolve(result);
        } else {
          resolve(null);
        }
      });
    });

    if (result) {
      return new Response(JSON.stringify(result), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Proceed with the handler
    return handler(request, context);
  };
}