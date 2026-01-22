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

    // Get system statistics
    const [
      totalUsers,
      activeUsers, // Users active in last 30 days (simplified)
      totalPosts,
      totalReports, // Placeholder - would need reports table
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          // This would need a lastActive field in the schema
          // For now, just count all users
        },
      }),
      prisma.post.count(), // Total posts
      Promise.resolve(0), // Total reports
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      totalPosts,
      totalReports,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}