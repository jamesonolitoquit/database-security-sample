'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface MarketplaceListing {
  id: string;
  price: number;
  quantity: number;
  listedAt: string;
  seller: {
    name: string;
    level: number;
  };
  item: {
    id: string;
    name: string;
    icon: string;
    slot: string;
    strength: number;
    agility: number;
    intelligence: number;
    vitality: number;
    level: number;
    rarity: string;
    maxLevel: number;
  };
}

interface UserInventoryItem {
  id: string;
  name: string;
  icon: string;
  slot: string;
  strength: number;
  agility: number;
  intelligence: number;
  vitality: number;
  level: number;
  rarity: string;
  equipped: boolean;
}

export default function MarketplacePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [userItems, setUserItems] = useState<UserInventoryItem[]>([]);
  const [userGold, setUserGold] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showListItem, setShowListItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UserInventoryItem | null>(null);
  const [listPrice, setListPrice] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      fetchListings();
      fetchUserData();
    }
  }, [status, router]);

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/marketplace');
      if (response.ok) {
        const data = await response.json();
        setListings(data.listings);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const data = await response.json();
        setUserItems(data.user.inventory.filter((item: UserInventoryItem) => !item.equipped));
        setUserGold(data.user.gold);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (itemId: string, price: number) => {
    if (userGold < price) {
      alert('Insufficient gold!');
      return;
    }

    setActionLoading(itemId);
    try {
      const response = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'purchase', itemId }),
      });

      if (response.ok) {
        alert('Purchase successful!');
        fetchListings();
        fetchUserData();
      } else {
        const error = await response.json();
        alert(error.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Error purchasing item:', error);
      alert('Purchase failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleListItem = async () => {
    if (!selectedItem || !listPrice) return;

    const price = parseInt(listPrice);
    if (price <= 0) {
      alert('Price must be greater than 0');
      return;
    }

    setActionLoading(selectedItem.id);
    try {
      const response = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list', itemId: selectedItem.id, price }),
      });

      if (response.ok) {
        alert('Item listed successfully!');
        setShowListItem(false);
        setSelectedItem(null);
        setListPrice('');
        fetchListings();
        fetchUserData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to list item');
      }
    } catch (error) {
      console.error('Error listing item:', error);
      alert('Failed to list item');
    } finally {
      setActionLoading(null);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400';
      case 'epic': return 'text-purple-400';
      case 'rare': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading marketplace...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            Marketplace
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-yellow-400 font-semibold">
              Gold: {userGold.toLocaleString()}
            </div>
            <button
              onClick={() => setShowListItem(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
            >
              List Item
            </button>
          </div>
        </div>

        {/* Marketplace Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                  {listing.item.icon ? (
                    <Image
                      src={listing.item.icon}
                      alt={listing.item.name}
                      width={32}
                      height={32}
                      className="rounded"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-slate-600 rounded"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${getRarityColor(listing.item.rarity)}`}>
                    {listing.item.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Level {listing.item.level}/{listing.item.maxLevel} • {listing.item.slot}
                  </p>
                  <p className="text-xs text-gray-500">
                    Seller: {listing.seller.name} (Lv.{listing.seller.level})
                  </p>
                </div>
              </div>

              {/* Item Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                {listing.item.strength > 0 && (
                  <div className="text-red-400">STR: +{listing.item.strength}</div>
                )}
                {listing.item.agility > 0 && (
                  <div className="text-green-400">AGI: +{listing.item.agility}</div>
                )}
                {listing.item.intelligence > 0 && (
                  <div className="text-blue-400">INT: +{listing.item.intelligence}</div>
                )}
                {listing.item.vitality > 0 && (
                  <div className="text-yellow-400">VIT: +{listing.item.vitality}</div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="text-yellow-400 font-bold text-lg">
                  {listing.price.toLocaleString()} Gold
                </div>
                <button
                  onClick={() => handlePurchase(listing.item.id, listing.price)}
                  disabled={actionLoading === listing.item.id || userGold < listing.price}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                >
                  {actionLoading === listing.item.id ? 'Buying...' : 'Buy'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {listings.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            No items currently listed for sale.
          </div>
        )}

        {/* List Item Modal */}
        {showListItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">List Item for Sale</h2>

              {!selectedItem ? (
                <div>
                  <h3 className="font-semibold mb-2">Select an item to list:</h3>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {userItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="w-full text-left p-2 bg-slate-700 hover:bg-slate-600 rounded flex items-center gap-3"
                      >
                        <div className="w-8 h-8 bg-slate-600 rounded"></div>
                        <div>
                          <div className={`font-semibold ${getRarityColor(item.rarity)}`}>
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            Level {item.level} • {item.slot}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-4 p-3 bg-slate-700 rounded">
                    <div className="w-10 h-10 bg-slate-600 rounded"></div>
                    <div>
                      <div className={`font-semibold ${getRarityColor(selectedItem.rarity)}`}>
                        {selectedItem.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        Level {selectedItem.level} • {selectedItem.slot}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Price (Gold):</label>
                    <input
                      type="number"
                      value={listPrice}
                      onChange={(e) => setListPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-blue-500"
                      placeholder="Enter price..."
                      min="1"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleListItem}
                      disabled={actionLoading === selectedItem.id || !listPrice}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-semibold"
                    >
                      {actionLoading === selectedItem.id ? 'Listing...' : 'List Item'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(null);
                        setListPrice('');
                      }}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded font-semibold"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setShowListItem(false);
                  setSelectedItem(null);
                  setListPrice('');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}