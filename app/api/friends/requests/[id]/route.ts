import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';
import { createFriendAcceptedNotification } from '@/lib/notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: requestId } = await params;
    const body = await request.json();
    const { action } = body; // 'accept' or 'reject'

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Find the friend request
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: true,
        receiver: true,
      },
    });

    if (!friendRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    // Check if user is the receiver
    if (friendRequest.receiverId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if request is still pending
    if (friendRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 });
    }

    if (action === 'accept') {
      // Update request status
      await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'accepted' },
      });

      // Create friendship (bidirectional)
      await prisma.friendship.createMany({
        data: [
          {
            userId: friendRequest.senderId,
            friendId: friendRequest.receiverId,
          },
          {
            userId: friendRequest.receiverId,
            friendId: friendRequest.senderId,
          },
        ],
      });

      // Create notification for the sender
      await createFriendAcceptedNotification(friendRequest.senderId, user.id);

      return NextResponse.json({ message: 'Friend request accepted' });
    } else {
      // Update request status to rejected
      await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'rejected' },
      });

      return NextResponse.json({ message: 'Friend request rejected' });
    }
  } catch (error) {
    console.error('Error processing friend request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}