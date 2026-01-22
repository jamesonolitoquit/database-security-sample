import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';
import { withRateLimit, apiRateLimit } from '@/lib/rateLimit';

async function marketplaceHandler(request: NextRequest) {
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

    // Get all active marketplace listings with seller and item details
    const listings = await prisma.marketplaceListing.findMany({
      where: { status: 'active' },
      include: {
        seller: {
          select: { name: true, level: true },
        },
        item: {
          select: {
            id: true,
            name: true,
            icon: true,
            slot: true,
            strength: true,
            agility: true,
            intelligence: true,
            vitality: true,
            level: true,
            rarity: true,
            maxLevel: true,
          },
        },
      },
      orderBy: { listedAt: 'desc' },
    });

    return NextResponse.json({ listings });
  } catch (error) {
    console.error('Error fetching marketplace listings:', error);
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
    const { action, itemId, price } = body;

    if (action === 'list') {
      // List an item for sale
      if (!itemId || !price || price <= 0) {
        return NextResponse.json({ error: 'Invalid item or price' }, { status: 400 });
      }

      // Check if item exists and belongs to user
      const item = await prisma.inventoryItem.findFirst({
        where: {
          id: itemId,
          userId: user.id,
          equipped: false, // Can't sell equipped items
        },
      });

      if (!item) {
        return NextResponse.json({ error: 'Item not found or cannot be sold' }, { status: 404 });
      }

      // Check if item is already listed
      const existingListing = await prisma.marketplaceListing.findFirst({
        where: { itemId: itemId, status: 'active' },
      });

      if (existingListing) {
        return NextResponse.json({ error: 'Item is already listed' }, { status: 400 });
      }

      // Create marketplace listing
      const listing = await prisma.marketplaceListing.create({
        data: {
          sellerId: user.id,
          itemId: itemId,
          price: price,
        },
        include: {
          item: {
            select: {
              name: true,
              icon: true,
              slot: true,
              rarity: true,
            },
          },
        },
      });

      return NextResponse.json({ listing });
    }

    if (action === 'purchase') {
      // Purchase an item
      if (!itemId) {
        return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
      }

      // Find the active listing
      const listing = await prisma.marketplaceListing.findFirst({
        where: {
          itemId: itemId,
          status: 'active',
        },
        include: {
          seller: true,
          item: true,
        },
      });

      if (!listing) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }

      if (listing.sellerId === user.id) {
        return NextResponse.json({ error: 'Cannot purchase your own item' }, { status: 400 });
      }

      if (user.gold < listing.price) {
        return NextResponse.json({ error: 'Insufficient gold' }, { status: 400 });
      }

      // Perform the transaction
      await prisma.$transaction(async (tx) => {
        // Update listing status
        await tx.marketplaceListing.update({
          where: { id: listing.id },
          data: {
            status: 'sold',
            buyerId: user.id,
            soldAt: new Date(),
          },
        });

        // Transfer gold from buyer to seller
        await tx.user.update({
          where: { id: user.id },
          data: { gold: { decrement: listing.price } },
        });

        await tx.user.update({
          where: { id: listing.sellerId },
          data: { gold: { increment: listing.price } },
        });

        // Transfer item ownership
        await tx.inventoryItem.update({
          where: { id: itemId },
          data: { userId: user.id },
        });
      });

      return NextResponse.json({ success: true, message: 'Purchase completed' });
    }

    if (action === 'cancel') {
      // Cancel a listing
      if (!itemId) {
        return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
      }

      const listing = await prisma.marketplaceListing.findFirst({
        where: {
          itemId: itemId,
          sellerId: user.id,
          status: 'active',
        },
      });

      if (!listing) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }

      await prisma.marketplaceListing.update({
        where: { id: listing.id },
        data: { status: 'cancelled' },
      });

      return NextResponse.json({ success: true, message: 'Listing cancelled' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in marketplace operation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withRateLimit(marketplaceHandler, apiRateLimit);