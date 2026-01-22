import NextAuth, { Account, Profile, User, SessionStrategy } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getPrisma } from "./prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: PrismaAdapter(getPrisma()),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const prisma = getPrisma();
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
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
        };
      }
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  callbacks: {
    async signIn({ user, account, profile }: { user: User; account: Account | null; profile?: Profile }) {
      return true;
    },
    async jwt({ token, user }: { token: any; user?: User }) {
      if (user) {
        token.role = (user as any).role;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.role = token.role;
        session.user.id = token.sub;
        if (token.email) {
          session.user.email = token.email;
        }
      }
      return session;
    },
  },
};