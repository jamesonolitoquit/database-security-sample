import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';
import { createFollowNotification } from '@/lib/notifications';

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

    const url = new URL(request.url);
    const type = url.searchParams.get('type'); // 'following' or 'followers'

    if (type === 'following') {
      // Get users this user is following
      const following = await prisma.follow.findMany({
        where: { followerId: user.id },
        include: {
          following: {
            select: {
              id: true,
              name: true,
              email: true,
              level: true,
              xp: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ following: following.map(f => f.following) });
    } else if (type === 'followers') {
      // Get users following this user
      const followers = await prisma.follow.findMany({
        where: { followingId: user.id },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              email: true,
              level: true,
              xp: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ followers: followers.map(f => f.follower) });
    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching follows:', error);
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
    const { followingId } = body;

    if (!followingId) {
      return NextResponse.json({ error: 'Following ID required' }, { status: 400 });
    }

    if (followingId === user.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: followingId,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json({ error: 'Already following this user' }, { status: 400 });
    }

    // Create follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId: user.id,
        followingId: followingId,
      },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create notification for the followed user
    await createFollowNotification(followingId, user.id);

    return NextResponse.json({ follow });
  } catch (error) {
    console.error('Error following user:', error);
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
    const { followingId } = body;

    if (!followingId) {
      return NextResponse.json({ error: 'Following ID required' }, { status: 400 });
    }

    // Remove follow relationship
    const deletedFollow = await prisma.follow.deleteMany({
      where: {
        followerId: user.id,
        followingId: followingId,
      },
    });

    if (deletedFollow.count === 0) {
      return NextResponse.json({ error: 'Not following this user' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}