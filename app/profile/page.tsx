"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { XPBar } from "../components/ui/XPBar";
import { Inventory } from "../components/ui/Inventory";
import { QuestTracker } from "../components/ui/QuestTracker";
import { Equipment } from "../components/ui/Equipment";

interface CharacterClass {
  id: string;
  name: string;
  description: string;
  icon: string;
  strengthBonus: number;
  agilityBonus: number;
  intelligenceBonus: number;
  vitalityBonus: number;
  abilities: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [characterClasses, setCharacterClasses] = useState<CharacterClass[]>([]);
  const [showClassSelection, setShowClassSelection] = useState(false);
  const [selectingClass, setSelectingClass] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth");
      return;
    }

    fetchUser();
    fetchCharacterClasses();
  }, [session, status, router]);

  const fetchUser = () => {
    fetch("/api/user").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else if (res.status === 401) {
        router.push("/auth");
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  const fetchCharacterClasses = () => {
    fetch("/api/classes").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setCharacterClasses(data.characterClasses);
      }
    }).catch(() => {
      console.error("Failed to fetch character classes");
    });
  };

  const handleSelectClass = async (classId: string) => {
    setSelectingClass(true);
    try {
      const res = await fetch("/api/user/select-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setShowClassSelection(false);
      } else {
        console.error("Failed to select class");
      }
    } catch (error) {
      console.error("Error selecting class:", error);
    } finally {
      setSelectingClass(false);
    }
  };

  const handleEquip = (itemId: string, action: 'equip' | 'unequip') => {
    fetchUser();
  };

  if (loading) return <div className="text-blue-200">Loading profile...</div>;
  if (!user) return <div className="text-red-400">Could not load profile.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-blue-300 mb-4">Your Profile</h2>
        <div className="mb-4 flex items-center gap-4">
          <span className="text-lg font-semibold text-white">{user.name || user.email}</span>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-700 text-white rounded-full text-sm font-medium">
              {user.characterClass ? `${user.characterClass.icon} ${user.characterClass.name}` : "No Class Selected"}
            </span>
            {!user.characterClass && (
              <button
                onClick={() => setShowClassSelection(true)}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
              >
                Choose Class
              </button>
            )}
          </div>
        </div>

        {user.characterClass && (
          <div className="mb-4 p-4 bg-slate-800 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">Class Information</h3>
            <p className="text-gray-300 mb-2">{user.characterClass.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-green-400">+{user.characterClass.strengthBonus} Strength</div>
              <div className="text-yellow-400">+{user.characterClass.agilityBonus} Agility</div>
              <div className="text-purple-400">+{user.characterClass.intelligenceBonus} Intelligence</div>
              <div className="text-red-400">+{user.characterClass.vitalityBonus} Vitality</div>
            </div>
            <div className="mt-2">
              <span className="text-blue-300 font-medium">Abilities: </span>
              <span className="text-gray-300">{JSON.parse(user.characterClass.abilities).join(", ")}</span>
            </div>
          </div>
        )}

        <div className="mb-6">
          <XPBar currentXP={user.xp} nextLevelXP={user.level * 100} />
          <div className="text-blue-200 mt-1">Level {user.level} &bull; {user.xp} XP</div>
        </div>

        <Equipment
          weapon={user.weapon}
          armor={user.armor}
          accessory={user.accessory}
          inventory={user.inventory || []}
          onEquip={handleEquip}
        />

        <Inventory items={user.inventory || []} />
        <div className="mt-8">
          <QuestTracker quests={(user.quests || []).map((q: any) => ({
            id: q.questId,
            title: q.quest?.title || "Unknown Quest",
            completed: q.completed,
          }))} />
        </div>

        {showClassSelection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-blue-300 mb-4">Choose Your Character Class</h3>
              <p className="text-gray-300 mb-6">Select a class that fits your playstyle. Each class provides unique bonuses and abilities.</p>

              <div className="grid gap-4">
                {characterClasses.map((characterClass) => (
                  <div key={characterClass.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{characterClass.icon}</span>
                        <h4 className="text-lg font-semibold text-white">{characterClass.name}</h4>
                      </div>
                      <button
                        onClick={() => handleSelectClass(characterClass.id)}
                        disabled={selectingClass}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
                      >
                        {selectingClass ? "Selecting..." : "Choose"}
                      </button>
                    </div>
                    <p className="text-gray-300 mb-3">{characterClass.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-2">
                      <div className="text-green-400">+{characterClass.strengthBonus} Strength</div>
                      <div className="text-yellow-400">+{characterClass.agilityBonus} Agility</div>
                      <div className="text-purple-400">+{characterClass.intelligenceBonus} Intelligence</div>
                      <div className="text-red-400">+{characterClass.vitalityBonus} Vitality</div>
                    </div>
                    <div className="text-blue-300 text-sm">
                      <span className="font-medium">Abilities: </span>
                      {JSON.parse(characterClass.abilities).join(", ")}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowClassSelection(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
