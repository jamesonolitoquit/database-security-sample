'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface CraftingMaterial {
  id: string
  name: string
  description: string
  rarity: string
}

interface UserCraftingMaterial {
  id: string
  material: CraftingMaterial
  quantity: number
}

interface RecipeMaterial {
  material: CraftingMaterial
  quantity: number
}

interface Recipe {
  id: string
  name: string
  description: string
  goldCost: number
  materials: RecipeMaterial[]
  resultItem: {
    id: string
    name: string
    description: string
  }
}

export default function CraftingPage() {
  const { data: session } = useSession()
  const [materials, setMaterials] = useState<UserCraftingMaterial[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [crafting, setCrafting] = useState<string | null>(null)
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    fetchCraftingData()
  }, [])

  const fetchCraftingData = async () => {
    try {
      const response = await fetch('/api/crafting')
      if (response.ok) {
        const data = await response.json()
        setMaterials(data.materials)
        setRecipes(data.recipes)
      }
    } catch (error) {
      console.error('Error fetching crafting data:', error)
    } finally {
      setLoading(false)
    }
  }

  const craftItem = async (recipeId: string) => {
    setCrafting(recipeId)
    setMessage('')

    try {
      const response = await fetch('/api/crafting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        fetchCraftingData() // Refresh data
      } else {
        setMessage(data.error)
      }
    } catch (error) {
      setMessage('Failed to craft item')
    } finally {
      setCrafting(null)
    }
  }

  const gatherMaterial = async (materialId: string) => {
    try {
      const response = await fetch('/api/gather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId, quantity: 1 })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        fetchCraftingData() // Refresh data
      } else {
        setMessage(data.error)
      }
    } catch (error) {
      setMessage('Failed to gather material')
    }
  }

  const canCraftRecipe = (recipe: Recipe) => {
    return recipe.materials.every(req => {
      const userMaterial = materials.find(m => m.material.id === req.material.id)
      return userMaterial && userMaterial.quantity >= req.quantity
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading crafting station...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Crafting Station</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-center ${
            message.includes('Successfully') ? 'bg-green-600' : 'bg-red-600'
          } text-white`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Materials Section */}
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Materials</h2>
            <div className="space-y-3">
              {materials.length === 0 ? (
                <p className="text-gray-400">No materials collected yet.</p>
              ) : (
                materials.map((userMaterial) => (
                  <div key={userMaterial.id} className="flex justify-between items-center bg-black/20 rounded p-3">
                    <div>
                      <span className="text-white font-medium">{userMaterial.material.name}</span>
                      <span className="text-gray-400 text-sm ml-2">({userMaterial.material.rarity})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">x{userMaterial.quantity}</span>
                      <button
                        onClick={() => gatherMaterial(userMaterial.material.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Gather
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recipes Section */}
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Recipes</h2>
            <div className="space-y-4">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="bg-black/20 rounded p-4">
                  <h3 className="text-white font-bold text-lg">{recipe.name}</h3>
                  <p className="text-gray-300 text-sm mb-3">{recipe.description}</p>

                  <div className="mb-3">
                    <h4 className="text-yellow-400 font-medium mb-2">Requirements:</h4>
                    <div className="space-y-1">
                      {recipe.materials.map((req, index) => {
                        const userMaterial = materials.find(m => m.material.id === req.material.id)
                        const hasEnough = userMaterial && userMaterial.quantity >= req.quantity
                        return (
                          <div key={index} className={`text-sm ${hasEnough ? 'text-green-400' : 'text-red-400'}`}>
                            {req.material.name}: {req.quantity} (Have: {userMaterial?.quantity || 0})
                          </div>
                        )
                      })}
                      <div className="text-yellow-400 text-sm">Gold: {recipe.goldCost}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="text-blue-400 font-medium">Creates: </span>
                    <span className="text-white">{recipe.resultItem.name}</span>
                  </div>

                  <button
                    onClick={() => craftItem(recipe.id)}
                    disabled={!canCraftRecipe(recipe) || crafting === recipe.id}
                    className={`w-full py-2 px-4 rounded font-medium ${
                      canCraftRecipe(recipe) && crafting !== recipe.id
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {crafting === recipe.id ? 'Crafting...' : 'Craft'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}