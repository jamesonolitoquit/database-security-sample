
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getPrisma } from "../../../../src/lib/prisma";

let handler: any;

const getHandler = () => {
  if (!handler) {
    handler = NextAuth({
      adapter: PrismaAdapter(getPrisma()),
      providers: [
        require("next-auth/providers/email")({
          server: process.env.EMAIL_SERVER,
          from: process.env.EMAIL_FROM,
        }),
        require("next-auth/providers/google")({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
      ],
      session: {
        strategy: "jwt",
      },
      callbacks: {
        async jwt({ token, user }) {
          if (user && "role" in user) {
            token.role = (user as any).role;
          }
          return token;
        },
        async session({ session, token }) {
          if (token && session.user && typeof token.role === "string") {
            session.user.role = token.role;
          }
          return session;
        },
      },
    });
  }
  return handler;
};

export const GET = (...args: any[]) => getHandler()(...args);
export const POST = (...args: any[]) => getHandler()(...args);