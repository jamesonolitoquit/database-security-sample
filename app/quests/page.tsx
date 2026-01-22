"use client";
import QuestList from "../components/profile/QuestList";

export default function QuestsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-purple-300 mb-4">Quest Board</h2>
      <p className="text-white/80 mb-6">Complete daily, weekly, and story quests to earn XP and rewards!</p>
      <QuestList />
    </div>
  );
}
