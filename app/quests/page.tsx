"use client";
import { useEffect, useState } from "react";

export default function QuestsPage() {
  const [quests, setQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/quests").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setQuests(data.quests);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-purple-300 mb-4">Quest Board</h2>
        <p className="text-white/80 mb-6">Complete daily, weekly, and story quests to earn XP and rewards!</p>
        <div className="text-purple-200">Loading quests...</div>
      </div>
    );
  }
  if (quests.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-purple-300 mb-4">Quest Board</h2>
        <p className="text-white/80 mb-6">Complete daily, weekly, and story quests to earn XP and rewards!</p>
        <div className="bg-purple-800/40 rounded-lg p-6 border border-purple-400 text-center">
          <span className="text-purple-200">No quests available yet. Check back soon!</span>
        </div>
      </div>
    );
  }
  return (
    <div>
      <h2 className="text-2xl font-bold text-purple-300 mb-4">Quest Board</h2>
      <p className="text-white/80 mb-6">Complete daily, weekly, and story quests to earn XP and rewards!</p>
      <ul className="space-y-4">
        {quests.map((quest) => (
          <li key={quest.id} className="bg-purple-900/60 rounded-lg p-4 border border-purple-500">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-yellow-200">{quest.title}</span>
              <span className="bg-yellow-400 text-purple-900 rounded px-2 py-1 text-xs font-semibold ml-2">{quest.xpReward} XP</span>
            </div>
            <div className="text-purple-100 mt-2">{quest.description}</div>
            <div className="text-xs text-purple-300 mt-1">Type: {quest.type}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
