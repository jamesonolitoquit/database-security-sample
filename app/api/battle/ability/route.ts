import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Session } from "next-auth";

interface AbilityEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff';
  stat?: 'strength' | 'agility' | 'intelligence' | 'vitality';
  value: number;
  duration?: number; // for buffs/debuffs
}

const ABILITY_DATA: Record<string, { cost: number; effects: AbilityEffect[]; description: string }> = {
  // Warrior abilities
  'Power Strike': {
    cost: 20,
    effects: [{ type: 'damage', value: 1.5 }], // 50% bonus damage
    description: 'A powerful strike dealing 50% extra damage'
  },
  'Shield Wall': {
    cost: 15,
    effects: [{ type: 'buff', stat: 'vitality', value: 5, duration: 3 }],
    description: 'Increase defense for 3 turns'
  },
  'Berserker Rage': {
    cost: 30,
    effects: [
      { type: 'buff', stat: 'strength', value: 8, duration: 2 },
      { type: 'debuff', stat: 'vitality', value: -3, duration: 2 }
    ],
    description: 'Greatly increase strength but reduce defense for 2 turns'
  },

  // Mage abilities
  'Fireball': {
    cost: 25,
    effects: [{ type: 'damage', value: 2.0 }], // 100% bonus damage
    description: 'Launch a fireball dealing double damage'
  },
  'Ice Shield': {
    cost: 20,
    effects: [{ type: 'buff', stat: 'vitality', value: 4, duration: 2 }],
    description: 'Create an ice shield increasing defense for 2 turns'
  },
  'Teleport': {
    cost: 35,
    effects: [{ type: 'heal', value: 30 }],
    description: 'Teleport away and recover 30 HP'
  },

  // Rogue abilities
  'Backstab': {
    cost: 18,
    effects: [{ type: 'damage', value: 1.8 }], // 80% bonus damage
    description: 'Strike from behind dealing 80% extra damage'
  },
  'Smoke Bomb': {
    cost: 12,
    effects: [{ type: 'buff', stat: 'agility', value: 6, duration: 2 }],
    description: 'Create smoke to increase evasion for 2 turns'
  },
  'Shadow Step': {
    cost: 28,
    effects: [
      { type: 'damage', value: 1.2 },
      { type: 'heal', value: 15 }
    ],
    description: 'Step through shadows dealing damage and healing yourself'
  },

  // Paladin abilities
  'Holy Strike': {
    cost: 22,
    effects: [
      { type: 'damage', value: 1.3 },
      { type: 'heal', value: 10 }
    ],
    description: 'A holy strike that damages and heals you'
  },
  'Divine Shield': {
    cost: 25,
    effects: [{ type: 'buff', stat: 'vitality', value: 6, duration: 3 }],
    description: 'Divine protection greatly increasing defense for 3 turns'
  },
  'Healing Light': {
    cost: 30,
    effects: [{ type: 'heal', value: 50 }],
    description: 'Call upon healing light to restore 50 HP'
  },

  // Ranger abilities
  'Arrow Storm': {
    cost: 20,
    effects: [{ type: 'damage', value: 1.4 }], // 40% bonus damage
    description: 'Fire a storm of arrows dealing 40% extra damage'
  },
  'Beast Call': {
    cost: 15,
    effects: [{ type: 'buff', stat: 'strength', value: 4, duration: 2 }],
    description: 'Call upon beast strength for 2 turns'
  },
  'Nature\'s Grasp': {
    cost: 32,
    effects: [
      { type: 'damage', value: 1.1 },
      { type: 'debuff', stat: 'agility', value: -4, duration: 2 }
    ],
    description: 'Entangle the enemy reducing their agility for 2 turns'
  }
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions as any) as Session | null;
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { abilityName, monsterId } = await request.json();

  if (!abilityName || !monsterId) {
    return NextResponse.json({ error: "Ability name and monster ID required" }, { status: 400 });
  }

  const prisma = getPrisma();

  // Get user with character class
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { characterClass: true }
  });

  if (!user?.characterClass) {
    return NextResponse.json({ error: "No character class selected" }, { status: 400 });
  }

  // Check if user has this ability
  const userAbilities = JSON.parse(user.characterClass.abilities);
  if (!userAbilities.includes(abilityName)) {
    return NextResponse.json({ error: "Ability not available for your class" }, { status: 400 });
  }

  const ability = ABILITY_DATA[abilityName];
  if (!ability) {
    return NextResponse.json({ error: "Ability not found" }, { status: 400 });
  }

  // Check if user has enough mana (we'll use intelligence as mana pool for now)
  const manaCost = ability.cost;
  const currentMana = user.intelligence * 2; // Simple mana calculation
  if (currentMana < manaCost) {
    return NextResponse.json({ error: "Not enough mana" }, { status: 400 });
  }

  const monster = await prisma.monster.findUnique({
    where: { id: monsterId }
  });

  if (!monster) {
    return NextResponse.json({ error: "Monster not found" }, { status: 404 });
  }

  // Calculate ability effects
  let damageDealt = 0;
  let healingDone = 0;
  let buffsApplied: any[] = [];
  let debuffsApplied: any[] = [];

  for (const effect of ability.effects) {
    switch (effect.type) {
      case 'damage':
        // Base damage calculation similar to normal attack but with ability multiplier
        const baseDamage = Math.floor(Math.random() * 10) + Math.floor((user.strength || 10) / 2) + user.level * 2;
        damageDealt = Math.max(1, Math.floor(baseDamage * effect.value) - monster.defense);
        break;

      case 'heal':
        healingDone = effect.value;
        break;

      case 'buff':
        if (effect.stat) {
          buffsApplied.push({
            stat: effect.stat,
            value: effect.value,
            duration: effect.duration
          });
        }
        break;

      case 'debuff':
        if (effect.stat) {
          debuffsApplied.push({
            stat: effect.stat,
            value: effect.value,
            duration: effect.duration
          });
        }
        break;
    }
  }

  // Apply healing if any
  const newHp = Math.min(100, (user.vitality || 10) * 10 + healingDone); // Simple HP calculation

  // Update user (reduce mana, apply healing)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      // For now, we'll just log the ability use. In a full implementation,
      // you'd want to track mana, buffs/debuffs, etc.
    }
  });

  // Log the ability use
  await prisma.adventureLog.create({
    data: {
      userId: user.id,
      type: "ability",
      details: `Used ${abilityName} on ${monster.name}${damageDealt > 0 ? `, dealing ${damageDealt} damage` : ''}${healingDone > 0 ? `, healing ${healingDone} HP` : ''}`
    }
  });

  return NextResponse.json({
    success: true,
    ability: abilityName,
    damageDealt,
    healingDone,
    buffsApplied,
    debuffsApplied,
    manaCost,
    description: ability.description
  });
}