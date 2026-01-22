import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { withRateLimit, authRateLimit } from "@/lib/rateLimit";

async function registerHandler(req: Request) {
  try {
    console.log('Registration API called');
    const { name, email, password } = await req.json();
    console.log('Received data:', { name, email, password: password ? '[REDACTED]' : undefined });

    if (!name || !email || !password) {
      console.log('Validation failed: missing fields');
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (password.length < 8) {
      console.log('Validation failed: password too short');
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    console.log('Getting Prisma client');
    const prisma = getPrisma();
    console.log('Checking for existing user');

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('User already exists');
      return NextResponse.json({ error: "Email already registered." }, { status: 400 });
    }

    console.log('Hashing password');
    const hashed = await bcrypt.hash(password, 10);
    console.log('Creating user');

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });
    console.log('User created successfully:', { id: user.id, name: user.name, email: user.email });

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}

export const POST = withRateLimit(registerHandler, authRateLimit);
