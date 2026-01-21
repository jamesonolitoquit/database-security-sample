import React from "react";

interface XPBarProps {
  currentXP: number;
  nextLevelXP: number;
}

export const XPBar: React.FC<XPBarProps> = ({ currentXP, nextLevelXP }) => {
  const percent = Math.min(100, (currentXP / nextLevelXP) * 100);
  return (
    <div className="w-full bg-gray-800 rounded-full h-4 border-2 border-purple-500 shadow-inner">
      <div
        className="h-4 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
      <span className="absolute left-1/2 -translate-x-1/2 text-xs text-white font-bold">
        {currentXP} / {nextLevelXP} XP
      </span>
    </div>
  );
};
