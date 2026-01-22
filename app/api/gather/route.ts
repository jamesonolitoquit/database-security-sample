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

    const { materialId, quantity = 1 } = await request.json()

    if (!materialId) {
      return NextResponse.json({ error: 'Material ID is required' }, { status: 400 })
    }

    // Verify material exists
    const material = await prisma.craftingMaterial.findUnique({
      where: { id: materialId }
    })

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 })
    }

    // Add material to user's inventory
    await prisma.userCraftingMaterial.upsert({
      where: {
        userId_materialId: {
          userId: session.user.id,
          materialId: materialId
        }
      },
      update: {
        quantity: { increment: quantity }
      },
      create: {
        userId: session.user.id,
        materialId: materialId,
        quantity: quantity
      }
    })

    return NextResponse.json({
      success: true,
      message: `Collected ${quantity} ${material.name}!`
    })
  } catch (error) {
    console.error('Error gathering material:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}