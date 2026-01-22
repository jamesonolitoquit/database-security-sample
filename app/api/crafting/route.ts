import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'

const prisma = getPrisma()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's crafting materials
    const userMaterials = await prisma.userCraftingMaterial.findMany({
      where: { userId: session.user.id },
      include: { material: true }
    })

    // Get available recipes
    const recipes = await prisma.craftingRecipe.findMany({
      include: {
        materials: {
          include: { material: true }
        },
        resultItem: true
      }
    })

    return NextResponse.json({
      materials: userMaterials,
      recipes: recipes
    })
  } catch (error) {
    console.error('Error fetching crafting data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { recipeId } = await request.json()

    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 })
    }

    // Get the recipe with materials
    const recipe = await prisma.craftingRecipe.findUnique({
      where: { id: recipeId },
      include: {
        materials: {
          include: { material: true }
        },
        resultItem: true
      }
    })

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    // Check if user has enough materials and gold
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { gold: true }
    })

    if (!user || user.gold < recipe.goldCost) {
      return NextResponse.json({ error: 'Not enough gold' }, { status: 400 })
    }

    // Check material requirements
    for (const requirement of recipe.materials) {
      const userMaterial = await prisma.userCraftingMaterial.findUnique({
        where: {
          userId_materialId: {
            userId: session.user.id,
            materialId: requirement.materialId
          }
        }
      })

      if (!userMaterial || userMaterial.quantity < requirement.quantity) {
        return NextResponse.json({
          error: `Not enough ${requirement.material.name}. Required: ${requirement.quantity}, Have: ${userMaterial?.quantity || 0}`
        }, { status: 400 })
      }
    }

    // Perform crafting in a transaction
    await prisma.$transaction(async (tx) => {
      // Deduct gold
      await tx.user.update({
        where: { id: session.user.id },
        data: { gold: { decrement: recipe.goldCost } }
      })

      // Deduct materials
      for (const requirement of recipe.materials) {
        await tx.userCraftingMaterial.update({
          where: {
            userId_materialId: {
              userId: session.user.id,
              materialId: requirement.materialId
            }
          },
          data: { quantity: { decrement: requirement.quantity } }
        })
      }

      // Add crafted item to inventory
      await tx.inventoryItem.create({
        data: {
          userId: session.user.id,
          name: recipe.resultItem.name,
          icon: recipe.resultItem.icon,
          slot: recipe.resultItem.slot,
          strength: recipe.resultItem.strength,
          agility: recipe.resultItem.agility,
          intelligence: recipe.resultItem.intelligence,
          vitality: recipe.resultItem.vitality,
          rarity: recipe.resultItem.rarity,
          maxLevel: recipe.resultItem.maxLevel,
          level: 1
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: `Successfully crafted ${recipe.resultItem.name}!`
    })
  } catch (error) {
    console.error('Error crafting item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}