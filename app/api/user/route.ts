import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email: token.email },
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
