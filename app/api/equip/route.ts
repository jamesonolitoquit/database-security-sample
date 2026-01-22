import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPrisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, action } = await request.json();

    if (!itemId || !action) {
      return NextResponse.json({ error: 'Missing itemId or action' }, { status: 400 });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { inventory: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const item = user.inventory.find(item => item.id === itemId);
    if (!item || !item.slot) {
      return NextResponse.json({ error: 'Invalid equipment item' }, { status: 400 });
    }

    if (action === 'equip') {
      // Check if slot is already occupied
      const slotField = `${item.slot}Id` as keyof typeof user;
      if (user[slotField]) {
        return NextResponse.json({ error: 'Equipment slot already occupied' }, { status: 400 });
      }

      // Equip the item
      await prisma.user.update({
        where: { id: user.id },
        data: {
          [slotField]: item.id
        }
      });

      // Mark item as equipped
      await prisma.inventoryItem.update({
        where: { id: item.id },
        data: { equipped: true }
      });

    } else if (action === 'unequip') {
      // Check if item is actually equipped
      const slotField = `${item.slot}Id` as keyof typeof user;
      if (user[slotField] !== item.id) {
        return NextResponse.json({ error: 'Item not equipped' }, { status: 400 });
      }

      // Unequip the item
      await prisma.user.update({
        where: { id: user.id },
        data: {
          [slotField]: null
        }
      });

      // Mark item as unequipped
      await prisma.inventoryItem.update({
        where: { id: item.id },
        data: { equipped: false }
      });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Equipment API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}