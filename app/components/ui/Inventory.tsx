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
  <div className="bg-white/80 dark:bg-gray-900/80 rounded-lg p-4 shadow-md border border-blue-300 mt-4">
    <h3 className="text-lg font-bold text-blue-700 mb-2">Inventory</h3>
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => (
        <div key={item.id} className="flex flex-col items-center bg-blue-100 dark:bg-blue-900 rounded p-2 border border-blue-400">
          <img src={item.icon} alt={item.name} className="w-8 h-8 mb-1" />
          <span className="text-xs font-semibold text-blue-800 dark:text-blue-200">{item.name}</span>
          <span className="text-xs text-gray-600 dark:text-gray-300">x{item.quantity}</span>
        </div>
      ))}
    </div>
  </div>
);
