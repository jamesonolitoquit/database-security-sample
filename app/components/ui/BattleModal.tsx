import React from "react";

interface Monster {
  name: string;
  hp: number;
  maxHp: number;
  image: string;
}

interface BattleModalProps {
  monster: Monster;
  playerHP: number;
  playerMaxHP: number;
  onAttack: () => void;
  onClose: () => void;
}

export const BattleModal: React.FC<BattleModalProps> = ({ monster, playerHP, playerMaxHP, onAttack, onClose }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-gradient-to-br from-purple-900 to-blue-800 rounded-xl p-6 shadow-2xl border-4 border-yellow-400 w-96 relative">
      <button onClick={onClose} className="absolute top-2 right-2 text-yellow-300 hover:text-yellow-500">✕</button>
      <img src={monster.image} alt={monster.name} className="w-24 h-24 mx-auto mb-2 rounded-full border-2 border-purple-400 bg-white" />
      <h2 className="text-2xl font-bold text-yellow-200 text-center mb-2">{monster.name}</h2>
      <div className="mb-4">
        <div className="text-xs text-white">Monster HP: {monster.hp} / {monster.maxHp}</div>
        <div className="w-full bg-gray-700 rounded h-2 mb-2">
          <div className="bg-red-500 h-2 rounded" style={{ width: `${(monster.hp / monster.maxHp) * 100}%` }} />
        </div>
        <div className="text-xs text-white">Your HP: {playerHP} / {playerMaxHP}</div>
        <div className="w-full bg-gray-700 rounded h-2">
          <div className="bg-green-400 h-2 rounded" style={{ width: `${(playerHP / playerMaxHP) * 100}%` }} />
        </div>
      </div>
      <button onClick={onAttack} className="w-full py-2 mt-2 bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold rounded shadow">Attack!</button>
    </div>
  </div>
);
