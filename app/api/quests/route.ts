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
  const quests = await prisma.quest.findMany({});
  return NextResponse.json({ quests });
}
