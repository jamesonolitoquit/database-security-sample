"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function BattlePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [monsters, setMonsters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fighting, setFighting] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [abilities, setAbilities] = useState<string[]>([]);
  const [abilityData, setAbilityData] = useState<any>({});
  const [selectedMonster, setSelectedMonster] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/auth");
      return;
    }

    fetchMonsters();
    fetchUserData();
  }, [session, status, router]);

  const fetchMonsters = () => {
    fetch("/api/battle").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setMonsters(data.monsters);
      } else if (res.status === 401) {
        // Token expired or invalid, redirect to login
        router.push("/auth");
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  const fetchUserData = () => {
    fetch("/api/user").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user.characterClass) {
          setAbilities(JSON.parse(data.user.characterClass.abilities));
        }
      }
    }).catch(() => {
      console.error("Failed to fetch user data");
    });

    // Fetch ability data
    fetch("/api/abilities").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setAbilityData(data.abilities);
      }
    }).catch(() => {
      console.error("Failed to fetch ability data");
    });
  };

  const fightMonster = async (monsterId: string) => {
    setFighting(monsterId);
    setBattleResult(null);
    setSelectedMonster(monsterId);
    try {
      const res = await fetch("/api/battle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monsterId })
      });

      if (res.ok) {
        const data = await res.json();
        setBattleResult(data);
        alert(`${data.battleResult === 'victory' ? 'Victory!' : 'Victory (with injuries)!'} You gained ${data.xpGained} XP!${data.lootDropped ? ` You found: ${data.lootDropped.name}!` : ''}`);
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert("Failed to fight monster");
    } finally {
      setFighting(null);
      setSelectedMonster(null);
    }
  };

  const useAbility = async (abilityName: string, monsterId: string) => {
    setFighting(monsterId);
    setBattleResult(null);
    try {
      const res = await fetch("/api/battle/ability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abilityName, monsterId })
      });

      if (res.ok) {
        const data = await res.json();
        setBattleResult({
          success: true,
          battleResult: 'ability_used',
          ability: abilityName,
          damageDealt: data.damageDealt,
          healingDone: data.healingDone,
          buffsApplied: data.buffsApplied,
          debuffsApplied: data.debuffsApplied,
          monster: { name: 'Unknown Monster' } // We'll need to get this from the monster
        });
        alert(`Used ${abilityName}!${data.damageDealt > 0 ? ` Dealt ${data.damageDealt} damage!` : ''}${data.healingDone > 0 ? ` Healed ${data.healingDone} HP!` : ''}`);
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert("Failed to use ability");
    } finally {
      setFighting(null);
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-red-300 mb-4">Monster Battle</h2>
        <p className="text-white/80 mb-6">Face off against monsters to earn XP, loot, and glory!</p>
        <div className="text-red-200">Loading monsters...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-red-300 mb-4">Monster Battle</h2>
      <p className="text-white/80 mb-6">Face off against monsters to earn XP, loot, and glory!</p>

      {/* Character Status */}
      {user && (
        <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-500 mb-6">
          <h3 className="text-blue-300 font-bold mb-2">Character Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-green-400">
              <span className="font-semibold">Level:</span> {user.level}
            </div>
            <div className="text-blue-400">
              <span className="font-semibold">XP:</span> {user.xp}
            </div>
            <div className="text-purple-400">
              <span className="font-semibold">Mana:</span> {(user.intelligence || 10) * 2}
            </div>
            {user.characterClass && (
              <div className="text-yellow-400">
                <span className="font-semibold">Class:</span> {user.characterClass.icon} {user.characterClass.name}
              </div>
            )}
          </div>
        </div>
      )}

      {battleResult && (
        <div className="bg-green-900/60 rounded-lg p-4 border border-green-500 mb-6">
          <h3 className="text-green-300 font-bold mb-2">Battle Result</h3>
          <p className="text-green-100">
            {battleResult.battleResult === 'ability_used' ? (
              <>
                Used {battleResult.ability}! (Cost: {battleResult.manaCost}💎 mana)
                {battleResult.damageDealt > 0 && <><br />Damage dealt: {battleResult.damageDealt}</>}
                {battleResult.healingDone > 0 && <><br />Healing: {battleResult.healingDone} HP</>}
                {battleResult.buffsApplied?.length > 0 && (
                  <>
                    <br />Buffs applied: {battleResult.buffsApplied.map((buff: any) => `${buff.stat} +${buff.value}`).join(', ')}
                  </>
                )}
                {battleResult.debuffsApplied?.length > 0 && (
                  <>
                    <br />Debuffs applied: {battleResult.debuffsApplied.map((debuff: any) => `${debuff.stat} ${debuff.value}`).join(', ')}
                  </>
                )}
              </>
            ) : (
              <>
                You defeated {battleResult.monster.name}!
                <br />
                Damage dealt: {battleResult.damageDealt}
                {battleResult.damageTaken > 0 && <><br />Damage taken: {battleResult.damageTaken}</>}
                <br />
                XP gained: {battleResult.xpGained}
                {battleResult.lootDropped && (
                  <>
                    <br />
                    <span className="text-yellow-300 font-semibold">
                      Loot found: {battleResult.lootDropped.icon} {battleResult.lootDropped.name}
                    </span>
                  </>
                )}
              </>
            )}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {monsters.map((monster) => (
          <div key={monster.id} className="bg-red-900/60 rounded-lg p-4 border border-red-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-red-200">{monster.name}</span>
              <span className="bg-red-700 text-white rounded px-2 py-1 text-xs">Lv. {Math.floor(monster.hp / 25)}</span>
            </div>
            <div className="text-red-100 text-sm mb-3">
              <div>HP: {monster.hp}</div>
              <div>Attack: {monster.attack}</div>
              <div>Defense: {monster.defense}</div>
            </div>

            {/* Basic Attack Button */}
            <button
              onClick={() => fightMonster(monster.id)}
              disabled={fighting === monster.id}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-2 rounded text-sm font-semibold mb-2"
            >
              {fighting === monster.id ? "Fighting..." : "⚔️ Attack"}
            </button>

            {/* Ability Buttons */}
            {abilities.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-purple-300 font-semibold mb-1">Abilities:</div>
                <div className="grid grid-cols-2 gap-1">
                  {abilities.map((ability) => {
                    const abilityInfo = abilityData[ability];
                    const manaCost = abilityInfo?.cost || 0;
                    const currentMana = (user?.intelligence || 10) * 2;
                    const canUse = currentMana >= manaCost;

                    return (
                      <button
                        key={ability}
                        onClick={() => useAbility(ability, monster.id)}
                        disabled={fighting === monster.id || !canUse}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
                          canUse
                            ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400'
                            : 'bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed'
                        }`}
                        title={`${ability} (${manaCost} mana)${!canUse ? ' - Not enough mana' : ''}`}
                      >
                        🔮 {ability.length > 10 ? ability.substring(0, 8) + '...' : ability}
                        <div className="text-xs opacity-75">{manaCost}💎</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {monsters.length === 0 && (
        <div className="bg-red-800/40 rounded-lg p-6 border border-red-400 text-center">
          <span className="text-red-100">No monsters available. Seek out a quest to find some!</span>
        </div>
      )}
    </div>
  );
}
