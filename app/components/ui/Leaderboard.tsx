import React from "react";

interface LeaderboardEntry {
  id: string;
  username: string;
  level: number;
  xp: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries }) => (
  <div className="bg-white/80 dark:bg-gray-900/80 rounded-lg p-4 shadow-md border border-yellow-400 mt-4">
    <h3 className="text-lg font-bold text-yellow-700 mb-2">Leaderboard</h3>
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className="text-left">Rank</th>
          <th className="text-left">User</th>
          <th className="text-left">Level</th>
          <th className="text-left">XP</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, idx) => (
          <tr key={entry.id} className={idx === 0 ? "font-bold text-yellow-700" : ""}>
            <td>{idx + 1}</td>
            <td>{entry.username}</td>
            <td>{entry.level}</td>
            <td>{entry.xp}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
