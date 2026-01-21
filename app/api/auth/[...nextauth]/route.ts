import NextAuth from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prisma: PrismaClient | undefined

if (process.env.DATABASE_URL) {
  prisma = globalForPrisma.prisma ?? new PrismaClient()
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
}

const handler = NextAuth({
  adapter: prisma ? PrismaAdapter(prisma) : undefined,
  providers: [
    // Add providers here, e.g., Credentials, Google, etc.
    // For demo, use Credentials for simplicity, but securely
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && 'role' in user) {
        token.role = (user as any).role;
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user && typeof token.role === 'string') {
        session.user.role = token.role;
      }
      return session;
    },
  },
})

export { handler as GET, handler as POST }