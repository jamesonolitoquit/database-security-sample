import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();
  const leaderboard = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      level: true,
      xp: true,
      characterClass: true
    },
    orderBy: [
      { level: 'desc' },
      { xp: 'desc' }
    ],
    take: 50
  });

  return NextResponse.json({ leaderboard });
}