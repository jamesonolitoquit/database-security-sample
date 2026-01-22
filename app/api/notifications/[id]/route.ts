import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';

export async function PATCH(
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

    const { id: notificationId } = await params;

    // Verify the notification belongs to the user
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: user.id,
      },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Mark as read
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    // Transform the notification
    const transformedNotification = {
      id: updatedNotification.id,
      type: updatedNotification.type,
      title: updatedNotification.title,
      message: updatedNotification.message,
      read: updatedNotification.read,
      createdAt: updatedNotification.createdAt.toISOString(),
      data: updatedNotification.data ? JSON.parse(updatedNotification.data) : null,
    };

    return NextResponse.json(transformedNotification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}