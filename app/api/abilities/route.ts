import { NextResponse } from "next/server";

const ABILITY_DATA: Record<string, { cost: number; effects: any[]; description: string }> = {
  // Warrior abilities
  'Power Strike': {
    cost: 20,
    effects: [{ type: 'damage', value: 1.5 }],
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
    effects: [{ type: 'damage', value: 2.0 }],
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
    effects: [{ type: 'damage', value: 1.8 }],
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
    effects: [{ type: 'damage', value: 1.4 }],
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

export async function GET() {
  return NextResponse.json({ abilities: ABILITY_DATA });
}