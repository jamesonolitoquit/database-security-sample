import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { classId } = await request.json();

  if (!classId) {
    return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
  }

  const prisma = getPrisma();

  try {
    // Verify the class exists
    const characterClass = await prisma.characterClass.findUnique({
      where: { id: classId }
    });

    if (!characterClass) {
      return NextResponse.json({ error: "Character class not found" }, { status: 404 });
    }

    // Update the user's class
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { classId },
      include: { characterClass: true }
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error selecting character class:", error);
    return NextResponse.json({ error: "Failed to select character class" }, { status: 500 });
  }
}