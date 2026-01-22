"use client";
import { useState } from 'react';

interface EquipmentItem {
  id: string;
  name: string;
  icon: string;
  slot: string;
  strength: number;
  agility: number;
  intelligence: number;
  vitality: number;
  equipped: boolean;
}

interface EquipmentProps {
  weapon?: EquipmentItem | null;
  armor?: EquipmentItem | null;
  accessory?: EquipmentItem | null;
  inventory: EquipmentItem[];
  onEquip: (itemId: string, action: 'equip' | 'unequip') => void;
}

export function Equipment({ weapon, armor, accessory, inventory, onEquip }: EquipmentProps) {
  const [showInventory, setShowInventory] = useState(false);

  const equipmentSlots = [
    { key: 'weapon', label: 'Weapon', item: weapon },
    { key: 'armor', label: 'Armor', item: armor },
    { key: 'accessory', label: 'Accessory', item: accessory }
  ];

  const availableItems = inventory.filter(item => item.slot && !item.equipped);

  const handleEquip = async (itemId: string, action: 'equip' | 'unequip') => {
    try {
      const response = await fetch('/api/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, action })
      });

      if (response.ok) {
        onEquip(itemId, action);
        setShowInventory(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to equip item');
      }
    } catch (error) {
      console.error('Equipment error:', error);
      alert('Failed to equip item');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <h3 className="text-xl font-bold text-blue-300 mb-4">Equipment</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {equipmentSlots.map(({ key, label, item }) => (
          <div key={key} className="bg-gray-700 rounded p-3">
            <div className="text-sm text-gray-300 mb-2">{label}</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-2">{item?.icon || '❓'}</span>
                <div>
                  <div className="text-white font-medium">{item?.name || 'Empty'}</div>
                  {item && (
                    <div className="text-xs text-gray-400">
                      {item.strength > 0 && `STR +${item.strength} `}
                      {item.agility > 0 && `AGI +${item.agility} `}
                      {item.intelligence > 0 && `INT +${item.intelligence} `}
                      {item.vitality > 0 && `VIT +${item.vitality} `}
                    </div>
                  )}
                </div>
              </div>
              {item && (
                <button
                  onClick={() => handleEquip(item.id, 'unequip')}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                >
                  Unequip
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowInventory(!showInventory)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        {showInventory ? 'Hide Inventory' : 'Equip Items'}
      </button>

      {showInventory && (
        <div className="mt-4 bg-gray-700 rounded p-4">
          <h4 className="text-lg font-semibold text-blue-300 mb-3">Available Equipment</h4>
          {availableItems.length === 0 ? (
            <p className="text-gray-400">No equipment available to equip</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableItems.map((item) => (
                <div key={item.id} className="bg-gray-600 rounded p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{item.icon}</span>
                    <div>
                      <div className="text-white font-medium">{item.name}</div>
                      <div className="text-xs text-gray-400">
                        {item.slot} •
                        {item.strength > 0 && ` STR +${item.strength}`}
                        {item.agility > 0 && ` AGI +${item.agility}`}
                        {item.intelligence > 0 && ` INT +${item.intelligence}`}
                        {item.vitality > 0 && ` VIT +${item.vitality}`}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEquip(item.id, 'equip')}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
                  >
                    Equip
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}