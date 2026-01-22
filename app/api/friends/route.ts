import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get friends
    const friendships = await prisma.friendship.findMany({
      where: { userId: user.id },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            level: true,
            xp: true,
            gold: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const friends = friendships.map(f => f.friend);

    return NextResponse.json({ friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { friendId } = body;

    if (!friendId) {
      return NextResponse.json({ error: 'Friend ID required' }, { status: 400 });
    }

    // Remove both directions of friendship
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId: user.id, friendId: friendId },
          { userId: friendId, friendId: user.id },
        ],
      },
    });

    return NextResponse.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}