import React from "react";

interface Quest {
  id: string;
  title: string;
  completed: boolean;
}

interface QuestTrackerProps {
  quests: Quest[];
}

export const QuestTracker: React.FC<QuestTrackerProps> = ({ quests }) => (
  <div className="bg-white/80 dark:bg-gray-900/80 rounded-lg p-4 shadow-md border border-purple-300">
    <h3 className="text-lg font-bold text-purple-700 mb-2">Active Quests</h3>
    <ul className="space-y-1">
      {quests.map((quest) => (
        <li key={quest.id} className={quest.completed ? "line-through text-gray-400" : "text-gray-900 dark:text-white"}>
          {quest.title}
        </li>
      ))}
    </ul>
  </div>
);
