
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { withRateLimit, authRateLimit } from "@/lib/rateLimit";

const handler = NextAuth(authOptions);

const rateLimitedHandler = withRateLimit(handler, authRateLimit);

export { authOptions };
export const GET = rateLimitedHandler;
export const POST = rateLimitedHandler;