'use client'

import { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"

interface InventoryItem {
  id: string
  level: number
  rarity: string
  item: {
    id: string
    name: string
    description: string
    type: string
    maxLevel: number
  }
}

export default function InventoryPage() {
  const { data: session } = useSession()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [userGold, setUserGold] = useState(0)
  const [loading, setLoading] = useState(true)
  const [enhancing, setEnhancing] = useState<string | null>(null)
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/user')
      if (response.ok) {
        const userData = await response.json()
        setInventory(userData.inventory || [])
        setUserGold(userData.gold || 0)
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const enhanceItem = async (inventoryItemId: string) => {
    setEnhancing(inventoryItemId)
    setMessage('')

    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventoryItemId })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        fetchInventory() // Refresh inventory
      } else {
        setMessage(data.error)
      }
    } catch (error) {
      setMessage('Failed to enhance item')
    } finally {
      setEnhancing(null)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400'
      case 'epic': return 'text-purple-400'
      case 'rare': return 'text-blue-400'
      case 'uncommon': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getEnhancementCost = (level: number) => level * 100

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading inventory...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Equipment Inventory</h1>
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Gold: {userGold}</h2>
            <div className="text-gray-400">
              Total Items: {inventory.length}
            </div>
          </div>
        </div>
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-center ${
            message.includes('enhanced') ? 'bg-green-600' : 'bg-red-600'
          } text-white`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-12">
              No equipment in inventory. Craft some items first!
            </div>
          ) : (
            inventory.map((item) => (
              <div key={item.id} className="bg-black/30 backdrop-blur-sm rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white">{item.item.name}</h3>
                  <p className="text-gray-300 text-sm mb-2">{item.item.description}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-medium ${getRarityColor(item.rarity)}`}>
                      {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                    </span>
                    <span className="text-white">Level {item.level}/{item.item.maxLevel}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(item.level / item.item.maxLevel) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {item.level < item.item.maxLevel && (
                  <div className="border-t border-gray-600 pt-4">
                    <div className="text-sm text-gray-400 mb-2">
                      Enhancement Cost: {getEnhancementCost(item.level)} gold
                    </div>
                    <button
                      onClick={() => enhanceItem(item.id)}
                      disabled={enhancing === item.id || userGold < getEnhancementCost(item.level)}
                      className={`w-full py-2 px-4 rounded font-medium ${
                        userGold >= getEnhancementCost(item.level) && enhancing !== item.id
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {enhancing === item.id ? 'Enhancing...' : 'Enhance'}
                    </button>
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      Success Rate: {Math.max(10, 100 - (item.level * 10))}%
                    </div>
                  </div>
                )}

                {item.level >= item.item.maxLevel && (
                  <div className="border-t border-gray-600 pt-4">
                    <div className="text-green-400 text-center font-medium">
                      Max Level Reached!
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}