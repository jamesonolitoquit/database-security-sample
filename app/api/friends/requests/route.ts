import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';
import { createFriendRequestNotification } from '@/lib/notifications';

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

    // Get pending friend requests sent to this user
    const friendRequests = await prisma.friendRequest.findMany({
      where: {
        receiverId: user.id,
        status: 'pending',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            level: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ friendRequests });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const { receiverId } = body;

    if (!receiverId) {
      return NextResponse.json({ error: 'Receiver ID required' }, { status: 400 });
    }

    if (receiverId === user.id) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 });
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: user.id, friendId: receiverId },
          { userId: receiverId, friendId: user.id },
        ],
      },
    });

    if (existingFriendship) {
      return NextResponse.json({ error: 'Already friends' }, { status: 400 });
    }

    // Check if request already exists
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId: receiverId },
          { senderId: receiverId, receiverId: user.id },
        ],
      },
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return NextResponse.json({ error: 'Friend request already exists' }, { status: 400 });
      }
      if (existingRequest.status === 'accepted') {
        return NextResponse.json({ error: 'Already friends' }, { status: 400 });
      }
    }

    // Create friend request
    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId: user.id,
        receiverId: receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create notification for the receiver
    await createFriendRequestNotification(receiverId, user.id);

    return NextResponse.json({ friendRequest });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}