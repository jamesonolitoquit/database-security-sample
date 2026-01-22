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
  const quests = await prisma.quest.findMany({});
  return NextResponse.json({ quests });
}

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

  // Get the user and quest
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  const quest = await prisma.quest.findUnique({
    where: { id: questId }
  });

  if (!user || !quest) {
    return NextResponse.json({ error: "User or quest not found" }, { status: 404 });
  }

  // Check if quest is already completed
  const existingProgress = await prisma.questProgress.findUnique({
    where: {
      userId_questId: {
        userId: user.id,
        questId: quest.id
      }
    }
  });

  if (existingProgress?.completed) {
    return NextResponse.json({ error: "Quest already completed" }, { status: 400 });
  }

  // Complete the quest in a transaction
  await prisma.$transaction(async (tx) => {
    // Create or update quest progress
    await tx.questProgress.upsert({
      where: {
        userId_questId: {
          userId: user.id,
          questId: quest.id
        }
      },
      update: { completed: true },
      create: {
        userId: user.id,
        questId: quest.id,
        completed: true
      }
    });

    // Award XP to user
    await tx.user.update({
      where: { id: user.id },
      data: {
        xp: { increment: quest.xpReward },
        level: {
          set: Math.floor((user.xp + quest.xpReward) / 100) + 1
        }
      }
    });
  });

  return NextResponse.json({ success: true, xpGained: quest.xpReward });
}
