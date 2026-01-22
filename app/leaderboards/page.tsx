"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LeaderboardsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/auth");
      return;
    }

    fetchLeaderboard();
  }, [session, status, router]);

  const fetchLeaderboard = () => {
    fetch("/api/leaderboards").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard);
      } else if (res.status === 401) {
        // Token expired or invalid, redirect to login
        router.push("/auth");
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-yellow-300 mb-4">Leaderboards</h2>
        <p className="text-white/80 mb-6">See who reigns supreme in the world of Isekai Gate!</p>
        <div className="text-yellow-200">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-yellow-300 mb-4">Leaderboards</h2>
      <p className="text-white/80 mb-6">See who reigns supreme in the world of Isekai Gate!</p>

      <div className="bg-yellow-900/40 rounded-lg border border-yellow-500 overflow-hidden">
        <div className="bg-yellow-800/60 px-4 py-3 border-b border-yellow-500">
          <div className="grid grid-cols-4 gap-4 text-yellow-200 font-semibold">
            <span>Rank</span>
            <span>Adventurer</span>
            <span>Level</span>
            <span>XP</span>
          </div>
        </div>

        <div className="divide-y divide-yellow-500/30">
          {leaderboard.map((user, index) => (
            <div key={user.id} className="px-4 py-3 hover:bg-yellow-800/20">
              <div className="grid grid-cols-4 gap-4 items-center">
                <span className="text-yellow-300 font-bold">#{index + 1}</span>
                <div>
                  <span className="text-white font-medium">{user.name || user.email}</span>
                  {user.class && (
                    <span className="text-yellow-400 text-sm ml-2">({user.class})</span>
                  )}
                </div>
                <span className="text-blue-300">{user.level}</span>
                <span className="text-green-300">{user.xp}</span>
              </div>
            </div>
          ))}
        </div>

        {leaderboard.length === 0 && (
          <div className="px-4 py-8 text-center text-yellow-200">
            No adventurers yet. Be the first to join the ranks!
          </div>
        )}
      </div>
    </div>
  );
}
