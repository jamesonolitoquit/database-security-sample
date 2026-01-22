import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const prisma = getPrisma();

    // Get all users with basic info
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        level: true,
        xp: true,
        gold: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const prisma = getPrisma();
    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'User ID and action required' }, { status: 400 });
    }

    // Prevent admin from modifying themselves
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot modify your own account' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    switch (action) {
      case 'promote':
        await prisma.user.update({
          where: { id: userId },
          data: { role: 'moderator' },
        });
        break;

      case 'suspend':
        // Add suspension logic (e.g., set a suspended flag)
        await prisma.user.update({
          where: { id: userId },
          data: { role: 'suspended' },
        });
        break;

      case 'ban':
        // Add ban logic (e.g., set banned flag and clear session)
        await prisma.user.update({
          where: { id: userId },
          data: { role: 'banned' },
        });
        break;

      case 'unban':
        await prisma.user.update({
          where: { id: userId },
          data: { role: 'user' },
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `User ${action} successful` });
  } catch (error) {
    console.error('Error in admin user action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}