# Database Security Sample

A secure high-risk website demo using Next.js, TypeScript, and PostgreSQL to test the Copilot security rulebook.

## Setup

1. **Database**: Register for a managed PostgreSQL database (e.g., Supabase or Vercel Postgres).
   - Create a new database.
   - Get the connection string (e.g., `postgresql://user:password@host:port/database`).

2. **Environment Variables**:
   - Copy `.env` to `.env.local`.
   - Set `DATABASE_URL` to your database connection string.
   - Add NextAuth secrets: `NEXTAUTH_SECRET` and `NEXTAUTH_URL`.

3. **Migrate Database**:
   - Run `npx prisma migrate dev --name init` to apply the schema.

4. **Generate Prisma Client**:
   - Run `npx prisma generate`.

5. **Run the App**:
   - `npm run dev`

## Features

- Secure authentication with NextAuth.js
- File uploads with validation (API: /api/upload)
- Contact form with server-side validation and anti-spam (API: /api/contact)
- Security headers via middleware
- Safe content rendering component
- Admin dashboard (to be implemented)
- User-generated content (to be implemented)

## Security Notes

This project follows the Copilot security rulebook for secure development.
