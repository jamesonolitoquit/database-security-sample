import { NextResponse, NextRequest } from "next/server";
import { getPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { withRateLimit, authRateLimit } from "@/lib/rateLimit";
import { z } from "zod";

const RegisterRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

async function registerHandler(req: NextRequest) {
  try {
    const data = await req.json();

    const validation = RegisterRequestSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name, email, password } = validation.data;

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
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export const POST = withRateLimit(registerHandler, authRateLimit);
