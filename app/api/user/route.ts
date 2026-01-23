import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { z } from "zod";

const UserRequestSchema = z.object({
  email: z.string().email(),
});

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const validation = UserRequestSchema.safeParse({ email: token.email });
  if (!validation.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email: validation.data.email },
    include: {
      inventory: true,
      quests: { include: { quest: true } },
      adventureLogs: true,
      weapon: true,
      armor: true,
      accessory: true,
      characterClass: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({ user });
}
