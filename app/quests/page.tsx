"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function QuestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quests, setQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/auth");
      return;
    }

    fetchQuests();
  }, [session, status, router]);

  const fetchQuests = () => {
    fetch("/api/quests").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setQuests(data.quests);
      } else if (res.status === 401) {
        // Token expired or invalid, redirect to login
        router.push("/auth");
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  const completeQuest = async (questId: string) => {
    setCompleting(questId);
    try {
      const res = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questId })
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Quest completed! You gained ${data.xpGained} XP!`);
        // Refresh quests to update the list
        window.location.reload();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert("Failed to complete quest");
    } finally {
      setCompleting(null);
    }
  };

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
            <button
              onClick={() => completeQuest(quest.id)}
              disabled={completing === quest.id}
              className="mt-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-4 py-2 rounded text-sm font-semibold"
            >
              {completing === quest.id ? "Completing..." : "Complete Quest"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
