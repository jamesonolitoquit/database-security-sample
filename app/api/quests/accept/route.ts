import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Accept a quest (mark as in-progress, not completed)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { questId } = await request.json();
  if (!questId) {
    return NextResponse.json({ error: "Quest ID required" }, { status: 400 });
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const quest = await prisma.quest.findUnique({ where: { id: questId } });
  if (!user || !quest) {
    return NextResponse.json({ error: "User or quest not found" }, { status: 404 });
  }

  // Check if already accepted
  const existing = await prisma.questProgress.findUnique({
    where: { userId_questId: { userId: user.id, questId: quest.id } }
  });
  if (existing) {
    return NextResponse.json({ error: "Quest already accepted or completed" }, { status: 400 });
  }

  await prisma.questProgress.create({
    data: { userId: user.id, questId: quest.id, completed: false }
  });
  return NextResponse.json({ success: true });
}
