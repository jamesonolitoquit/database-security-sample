"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Party {
  id: string;
  name: string;
  description?: string;
  leaderId?: string;
  members: Array<{
    id: string;
    name?: string;
    email: string;
    level: number;
    class?: string;
  }>;
  _count?: {
    members: number;
  };
}

export default function PartyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userParty, setUserParty] = useState<Party | null>(null);
  const [availableParties, setAvailableParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [partyName, setPartyName] = useState("");
  const [partyDescription, setPartyDescription] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/auth");
      return;
    }

    loadPartyData();
  }, [session, status, router]);

  const loadPartyData = async () => {
    try {
      const res = await fetch("/api/party");
      if (res.ok) {
        const data = await res.json();
        setUserParty(data.userParty);
        setAvailableParties(data.availableParties);
      } else if (res.status === 401) {
        // Token expired or invalid, redirect to login
        router.push("/auth");
      }
    } catch (error) {
      console.error("Failed to load party data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createParty = async () => {
    if (!partyName.trim()) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          partyName: partyName.trim(),
          partyDescription: partyDescription.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        setUserParty(data.party);
        setShowCreateForm(false);
        setPartyName("");
        setPartyDescription("");
        alert("Party created successfully!");
        loadPartyData(); // Refresh available parties
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert("Failed to create party");
    } finally {
      setActionLoading(false);
    }
  };

  const joinParty = async (partyId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          partyId
        })
      });

      if (res.ok) {
        const data = await res.json();
        setUserParty(data.party);
        alert("Joined party successfully!");
        loadPartyData(); // Refresh available parties
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert("Failed to join party");
    } finally {
      setActionLoading(false);
    }
  };

  const leaveParty = async () => {
    if (!confirm("Are you sure you want to leave this party?")) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "leave"
        })
      });

      if (res.ok) {
        setUserParty(null);
        alert("Left party successfully!");
        loadPartyData(); // Refresh available parties
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert("Failed to leave party");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-pink-200 mb-4">Your Party</h2>
        <p className="text-white/80 mb-6">Form or join a party to adventure together!</p>
        <div className="text-pink-200">Loading party information...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-pink-200 mb-4">Your Party</h2>
      <p className="text-white/80 mb-6">Form or join a party to adventure together and complete group quests!</p>

      {/* Current Party */}
      {userParty ? (
        <div className="bg-pink-900/60 rounded-lg p-6 border border-pink-500 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-pink-300">🏰 {userParty.name}</h3>
            <button
              onClick={leaveParty}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-2 rounded text-sm font-semibold"
            >
              {actionLoading ? "Leaving..." : "Leave Party"}
            </button>
          </div>

          {userParty.description && (
            <p className="text-pink-200 mb-4">{userParty.description}</p>
          )}

          <div className="mb-4">
            <span className="text-pink-300 font-semibold">Leader:</span>{" "}
            <span className="text-pink-100">
              {userParty.members.find(m => m.id === userParty.leaderId)?.name ||
               userParty.members.find(m => m.id === userParty.leaderId)?.email ||
               "Unknown"}
            </span>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-pink-300 mb-3">👥 Party Members ({userParty.members.length}/4)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {userParty.members.map((member) => (
                <div key={member.id} className="bg-pink-800/60 rounded-lg p-3 border border-pink-400">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-pink-200">
                      {member.name || member.email}
                      {member.id === userParty.leaderId && <span className="text-yellow-400 ml-2">👑</span>}
                    </span>
                    <span className="text-pink-300 text-sm">Lv. {member.level}</span>
                  </div>
                  {member.class && (
                    <span className="text-pink-400 text-sm">{member.class}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-pink-900/60 rounded-lg p-6 border border-pink-500 mb-8">
          <h3 className="text-xl font-bold text-pink-300 mb-4">No Party Yet</h3>
          <p className="text-pink-200 mb-4">Create your own party or join an existing one to start adventuring together!</p>

          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded font-semibold mr-4"
            >
              🏰 Create Party
            </button>
          ) : (
            <div className="bg-pink-800/60 rounded-lg p-4 border border-pink-400 mb-4">
              <h4 className="text-lg font-semibold text-pink-300 mb-3">Create New Party</h4>
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  placeholder="Party Name"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  className="w-full px-3 py-2 bg-pink-900/60 border border-pink-400 rounded text-white placeholder-pink-300"
                  maxLength={50}
                />
                <textarea
                  placeholder="Party Description (optional)"
                  value={partyDescription}
                  onChange={(e) => setPartyDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-pink-900/60 border border-pink-400 rounded text-white placeholder-pink-300 resize-none"
                  rows={3}
                  maxLength={200}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={createParty}
                  disabled={actionLoading || !partyName.trim()}
                  className="bg-pink-600 hover:bg-pink-700 disabled:bg-pink-800 text-white px-4 py-2 rounded font-semibold"
                >
                  {actionLoading ? "Creating..." : "Create Party"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setPartyName("");
                    setPartyDescription("");
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Available Parties */}
      <div>
        <h3 className="text-xl font-bold text-pink-300 mb-4">🎯 Available Parties</h3>
        {availableParties.length === 0 ? (
          <div className="bg-pink-800/40 rounded-lg p-6 border border-pink-400 text-center">
            <span className="text-pink-100">No parties available. Be the first to create one!</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableParties.map((party) => (
              <div key={party.id} className="bg-pink-900/60 rounded-lg p-4 border border-pink-400">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold text-pink-200">{party.name}</h4>
                  <span className="text-pink-300 text-sm">
                    {party._count?.members || party.members.length}/4 members
                  </span>
                </div>

                {party.description && (
                  <p className="text-pink-100 text-sm mb-3">{party.description}</p>
                )}

                <div className="mb-3">

                  <span className="text-pink-300 text-sm">Members:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {party.members.map((member) => (
                      <span key={member.id} className="bg-pink-800/60 text-pink-200 text-xs px-2 py-1 rounded">
                        {member.name || member.email} (Lv.{member.level})
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => joinParty(party.id)}
                  disabled={actionLoading || (party._count?.members || party.members.length) >= 4}
                  className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-pink-800 text-white px-4 py-2 rounded text-sm font-semibold"
                >
                  {actionLoading ? "Joining..." : (party._count?.members || party.members.length) >= 4 ? "Party Full" : "Join Party"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
