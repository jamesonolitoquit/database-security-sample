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

---

# Isekai Gate — Secure Fantasy Social Media Platform

## Branding & Theme
- **Name:** Isekai Gate
- **Visuals:** Portals, magic, adventure, fantasy landscapes
- **Colors:** Deep purples (#6C3FC5), blues (#3B82F6), gold (#FFD700), whites (#FFFFFF)
- **Logo:** Portal/gate with magical effects (to be added)
- **Typography:** Modern with fantasy accent fonts (Geist, Geist_Mono)
- **Icons:** Fantasy-themed (crystals, scrolls, guild crests, etc.)

## Tech Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Next.js API routes, Prisma ORM, PostgreSQL
- **Auth:** NextAuth.js (email/password, Google)

## MVP Features
- Authentication (register, login, password reset)
- Profile (avatar, bio, class/role)
- Social feed (posts, comments, likes)
- Friend/follow system
- Notifications
- Direct messaging (stub)
- Media uploads (avatar, post images)
- Settings & privacy
- Legal: Privacy Policy, Terms of Service

## Security
- Input validation, secure headers, file upload restrictions, rate limiting, HTTPS, secure cookies

## Demo Data
- Seed script for users, posts, comments, likes, messages

## Open Source
- Contribution guide, code of conduct, license

---

See [tailwind.config.js](tailwind.config.js) for theme colors and fonts.

---

*This README will be expanded as features are implemented.*
