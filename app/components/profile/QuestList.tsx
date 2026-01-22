"use client";
import { useEffect, useState } from "react";

export default function QuestList() {
  const [quests, setQuests] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/quests").then((res) => res.json()),
      fetch("/api/quests/progress").then((res) => res.json()),
    ])
      .then(([q, p]) => {
        setQuests(q.quests || []);
        setProgress(p.progress || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load quests.");
        setLoading(false);
      });
  }, []);

  const getStatus = (questId: string) => {
    const prog = progress.find((p) => p.questId === questId);
    if (!prog) return "not accepted";
    return prog.completed ? "completed" : "in progress";
  };

  const handleAccept = async (questId: string) => {
    setError("");
    const res = await fetch("/api/quests/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questId }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to accept quest.");
      return;
    }
    setProgress((prev) => [...prev, { questId, completed: false }]);
  };

  if (loading) return <div>Loading quests...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4 bg-gray-900 rounded shadow max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Available Quests</h2>
      <ul>
        {quests.map((q) => (
          <li key={q.id} className="mb-4 p-4 bg-gray-800 rounded">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-white">{q.title}</span>
              <span className="text-xs text-gray-400">XP: {q.xpReward}</span>
            </div>
            <div className="text-gray-300 mb-2">{q.description}</div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-blue-400">Status: {getStatus(q.id)}</span>
              {getStatus(q.id) === "not accepted" && (
                <button
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-1 px-4 rounded"
                  onClick={() => handleAccept(q.id)}
                >
                  Accept Quest
                </button>
              )}
              {getStatus(q.id) === "in progress" && (
                <span className="text-yellow-400">In Progress</span>
              )}
              {getStatus(q.id) === "completed" && (
                <span className="text-green-400">Completed</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
