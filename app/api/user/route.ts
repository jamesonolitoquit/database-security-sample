import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getPrisma } from "../../../src/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      inventory: true,
      quests: { include: { quest: true } },
      adventureLogs: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({ user });
}
