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
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { party: { include: { members: true } } }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get available parties to join
  const availableParties = await prisma.party.findMany({
    where: {
      members: {
        none: {
          id: user.id
        }
      }
    },
    include: {
      members: true,
      _count: {
        select: { members: true }
      }
    },
    take: 10
  });

  return NextResponse.json({
    userParty: user.party,
    availableParties
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, partyName, partyDescription, partyId } = await request.json();

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (action === "create") {
    if (!partyName) {
      return NextResponse.json({ error: "Party name required" }, { status: 400 });
    }

    // Check if user is already in a party
    if (user.partyId) {
      return NextResponse.json({ error: "Already in a party" }, { status: 400 });
    }

    const party = await prisma.party.create({
      data: {
        name: partyName,
        description: partyDescription || "",
        leaderId: user.id,
        members: {
          connect: { id: user.id }
        }
      },
      include: {
        members: true
      }
    });

    return NextResponse.json({ success: true, party });

  } else if (action === "join") {
    if (!partyId) {
      return NextResponse.json({ error: "Party ID required" }, { status: 400 });
    }

    // Check if user is already in a party
    if (user.partyId) {
      return NextResponse.json({ error: "Already in a party" }, { status: 400 });
    }

    const party = await prisma.party.findUnique({
      where: { id: partyId },
      include: { members: true }
    });

    if (!party) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }

    if (party.members.length >= 4) {
      return NextResponse.json({ error: "Party is full" }, { status: 400 });
    }

    await prisma.party.update({
      where: { id: partyId },
      data: {
        members: {
          connect: { id: user.id }
        }
      }
    });

    const updatedParty = await prisma.party.findUnique({
      where: { id: partyId },
      include: {
        members: true
      }
    });

    return NextResponse.json({ success: true, party: updatedParty });

  } else if (action === "leave") {
    if (!user.partyId) {
      return NextResponse.json({ error: "Not in a party" }, { status: 400 });
    }

    const party = await prisma.party.findUnique({
      where: { id: user.partyId },
      include: { members: true }
    });

    if (!party) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }

    // If user is the leader and there are other members, can't leave
    if (party.leaderId === user.id && party.members.length > 1) {
      return NextResponse.json({ error: "Leader cannot leave party with members. Transfer leadership first." }, { status: 400 });
    }

    // If user is the last member, delete the party
    if (party.members.length === 1) {
      await prisma.party.delete({
        where: { id: user.partyId }
      });
    } else {
      await prisma.party.update({
        where: { id: user.partyId },
        data: {
          members: {
            disconnect: { id: user.id }
          }
        }
      });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}