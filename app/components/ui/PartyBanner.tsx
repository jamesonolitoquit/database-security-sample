import React from "react";

interface PartyBannerProps {
  partyName: string;
  members: string[];
}

export const PartyBanner: React.FC<PartyBannerProps> = ({ partyName, members }) => (
  <div className="flex items-center bg-gradient-to-r from-blue-900 via-purple-700 to-pink-600 rounded-lg p-3 shadow-lg border-2 border-yellow-300 mb-4">
    <span className="text-xl font-bold text-yellow-200 mr-4">{partyName}</span>
    <div className="flex -space-x-2">
      {members.map((member, idx) => (
        <span key={member.id || member.name || idx} className="bg-white text-purple-700 rounded-full px-2 py-1 text-xs font-semibold border border-purple-300 shadow">
          {member}
        </span>
      ))}
    </div>
  </div>
);
