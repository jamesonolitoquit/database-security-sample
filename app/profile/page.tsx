"use client";
import { useEffect, useState } from "react";
import { XPBar } from "../components/ui/XPBar";
import { Inventory } from "../components/ui/Inventory";
import { QuestTracker } from "../components/ui/QuestTracker";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/user").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-blue-200">Loading profile...</div>;
  if (!user) return <div className="text-red-400">Could not load profile.</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-300 mb-4">Your Profile</h2>
      <div className="mb-4">
        <span className="text-lg font-semibold text-white">{user.name || user.email}</span>
        <span className="ml-2 px-2 py-1 bg-blue-700 text-white rounded text-xs">{user.class || "Adventurer"}</span>
      </div>
      <div className="mb-6">
        <XPBar currentXP={user.xp} nextLevelXP={user.level * 100} />
        <div className="text-blue-200 mt-1">Level {user.level} &bull; {user.xp} XP</div>
      </div>
      <Inventory items={user.inventory || []} />
      <div className="mt-8">
        <QuestTracker quests={(user.quests || []).map((q: any) => ({
          id: q.questId,
          title: q.quest?.title || "Unknown Quest",
          completed: q.completed,
        }))} />
      </div>
    </div>
  );
}
