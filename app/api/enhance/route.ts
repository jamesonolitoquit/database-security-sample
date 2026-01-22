import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'

const prisma = getPrisma()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { inventoryItemId } = await request.json()

    if (!inventoryItemId) {
      return NextResponse.json({ error: 'Inventory item ID is required' }, { status: 400 })
    }

    // Get the inventory item with item details
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId, userId: session.user.id }
    })

    if (!inventoryItem) {
      return NextResponse.json({ error: 'Item not found in inventory' }, { status: 404 })
    }

    // Check if item can be enhanced (not at max level)
    if (inventoryItem.level >= inventoryItem.maxLevel) {
      return NextResponse.json({ error: 'Item is already at maximum level' }, { status: 400 })
    }

    // Calculate enhancement cost (increases with level)
    const enhancementCost = inventoryItem.level * 100 // Base cost of 100 gold per level

    // Check if user has enough gold
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { gold: true }
    })

    if (!user || user.gold < enhancementCost) {
      return NextResponse.json({ error: 'Not enough gold for enhancement' }, { status: 400 })
    }

    // Calculate success rate (decreases with higher levels)
    const successRate = Math.max(0.1, 1 - (inventoryItem.level * 0.1)) // Min 10% success rate
    const roll = Math.random()

    const success = roll <= successRate

    if (success) {
      // Enhancement successful - increase level
      await prisma.inventoryItem.update({
        where: { id: inventoryItemId },
        data: { level: { increment: 1 } }
      })

      // Deduct gold
      await prisma.user.update({
        where: { id: session.user.id },
        data: { gold: { decrement: enhancementCost } }
      })

      return NextResponse.json({
        success: true,
        message: `${inventoryItem.name} enhanced to level ${inventoryItem.level + 1}!`,
        newLevel: inventoryItem.level + 1
      })
    } else {
      // Enhancement failed - deduct gold but no level increase
      await prisma.user.update({
        where: { id: session.user.id },
        data: { gold: { decrement: enhancementCost } }
      })

      return NextResponse.json({
        success: false,
        message: `Enhancement failed! ${inventoryItem.name} remains at level ${inventoryItem.level}.`
      })
    }
  } catch (error) {
    console.error('Error enhancing equipment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}