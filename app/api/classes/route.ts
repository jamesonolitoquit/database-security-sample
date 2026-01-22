import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const prisma = getPrisma();

  try {
    const characterClasses = await prisma.characterClass.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ characterClasses });
  } catch (error) {
    console.error("Error fetching character classes:", error);
    return NextResponse.json({ error: "Failed to fetch character classes" }, { status: 500 });
  }
}