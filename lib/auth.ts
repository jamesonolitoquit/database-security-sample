import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getPrisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { User as NextAuthUser } from "next-auth";

interface CustomToken {
  role?: string;
  email?: string;
  sub?: string;
}

interface CustomSessionUser {
  role?: string;
  id?: string;
  email?: string;
}

export const authOptions = {
  adapter: PrismaAdapter(getPrisma()),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const prisma = getPrisma();
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as NextAuthUser & { role?: string };
      },
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER!,
      from: process.env.EMAIL_FROM!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: CustomToken; user?: NextAuthUser & { role?: string } }) {
      if (user) {
        token.role = user.role || undefined;
        token.email = user.email || undefined;
      }
      return token;
    },
    async session({ session, token }: { session: { user: CustomSessionUser }; token: CustomToken }) {
      if (token && session.user) {
        session.user.role = token.role;
        session.user.id = token.sub;
        session.user.email = token.email;
      }
      return session;
    },
  },
};