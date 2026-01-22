import React from "react";

interface Item {
  id: string;
  name: string;
  icon: string;
  quantity: number;
}

interface InventoryProps {
  items: Item[];
}

export const Inventory: React.FC<InventoryProps> = ({ items }) => (
  <div className="bg-purple-900/60 rounded-lg p-4 border border-purple-500 mt-4">
    <h3 className="text-lg font-bold text-purple-300 mb-4">🎒 Inventory</h3>
    {items.length === 0 ? (
      <p className="text-purple-200 text-center py-4">No items yet. Fight monsters to find loot!</p>
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col items-center bg-purple-800/60 rounded-lg p-3 border border-purple-400 hover:bg-purple-700/60 transition-colors">
            <div className="text-3xl mb-2">{item.icon}</div>
            <span className="text-sm font-semibold text-purple-200 text-center mb-1">{item.name}</span>
            <span className="text-xs text-purple-300 bg-purple-900/80 px-2 py-1 rounded">x{item.quantity}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);
