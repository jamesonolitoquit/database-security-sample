import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getPrisma } from "../../../lib/prisma";
import { authOptions } from "../../../lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();
  const monsters = await prisma.monster.findMany({});
  return NextResponse.json({ monsters });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { monsterId } = await request.json();
  if (!monsterId) {
    return NextResponse.json({ error: "Monster ID required" }, { status: 400 });
  }

  const prisma = getPrisma();

  // Get the user with equipped items
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      weapon: true,
      armor: true,
      accessory: true,
      characterClass: true
    }
  });

  const monster = await prisma.monster.findUnique({
    where: { id: monsterId }
  });

  if (!user || !monster) {
    return NextResponse.json({ error: "User or monster not found" }, { status: 404 });
  }

  // Calculate user stats with equipment bonuses
  const baseStats = {
    strength: user.strength || 10,
    agility: user.agility || 10,
    intelligence: user.intelligence || 10,
    vitality: user.vitality || 10
  };

  const equipmentBonuses = {
    strength: (user.weapon?.strength || 0) + (user.armor?.strength || 0) + (user.accessory?.strength || 0),
    agility: (user.weapon?.agility || 0) + (user.armor?.agility || 0) + (user.accessory?.agility || 0),
    intelligence: (user.weapon?.intelligence || 0) + (user.armor?.intelligence || 0) + (user.accessory?.intelligence || 0),
    vitality: (user.weapon?.vitality || 0) + (user.armor?.vitality || 0) + (user.accessory?.vitality || 0)
  };

  const classBonuses = {
    strength: user.characterClass?.strengthBonus || 0,
    agility: user.characterClass?.agilityBonus || 0,
    intelligence: user.characterClass?.intelligenceBonus || 0,
    vitality: user.characterClass?.vitalityBonus || 0
  };

  const totalStats = {
    strength: baseStats.strength + equipmentBonuses.strength + classBonuses.strength,
    agility: baseStats.agility + equipmentBonuses.agility + classBonuses.agility,
    intelligence: baseStats.intelligence + equipmentBonuses.intelligence + classBonuses.intelligence,
    vitality: baseStats.vitality + equipmentBonuses.vitality + classBonuses.vitality
  };

  // Battle calculations using equipment-enhanced stats
  const userAttack = Math.floor(Math.random() * 10) + Math.floor(totalStats.strength / 2) + user.level * 2;
  const monsterDefense = monster.defense;
  const damageToMonster = Math.max(1, userAttack - monsterDefense);

  const monsterAttack = Math.floor(Math.random() * monster.attack) + 5;
  const userDefense = Math.floor(totalStats.vitality / 3) + Math.floor(totalStats.agility / 4) + user.level * 3;
  const damageToUser = Math.max(0, monsterAttack - userDefense);

  let battleResult = "victory";
  let xpGained = monster.hp / 10; // XP based on monster HP

  // If user takes damage, reduce XP gain
  if (damageToUser > 0) {
    xpGained = Math.floor(xpGained * 0.7);
    battleResult = "victory_with_damage";
  }

  // Random loot drop (40% chance - can be adjusted)
  let lootDropped = null;
  const dropRoll = Math.random();
  console.log(`Loot drop roll: ${dropRoll} (need < 0.4 for drop)`);
  if (dropRoll < 0.4) {
    const possibleLoot = [
      { name: 'Health Potion', icon: '🧪' },
      { name: 'Gold Coins', icon: '🪙' },
      { name: 'Mana Crystal', icon: '🔮' },
      { name: 'Dragon Scale', icon: '🐲' },
      { name: 'Ancient Tome', icon: '📚' },
      // Equipment drops
      { name: 'Iron Sword', icon: '⚔️', slot: 'weapon', strength: 5 },
      { name: 'Leather Armor', icon: '🛡️', slot: 'armor', vitality: 3 },
      { name: 'Magic Ring', icon: '💍', slot: 'accessory', intelligence: 4 },
      { name: 'Steel Blade', icon: '🗡️', slot: 'weapon', strength: 8 },
      { name: 'Chain Mail', icon: '🔗', slot: 'armor', vitality: 5, agility: -1 },
      { name: 'Amulet of Power', icon: '📿', slot: 'accessory', strength: 3, intelligence: 3 }
    ];
    lootDropped = possibleLoot[Math.floor(Math.random() * possibleLoot.length)];
    console.log(`Loot dropped: ${lootDropped.name}`);
  }

  // Update user XP and level
  const newXP = user.xp + Math.floor(xpGained);
  const newLevel = Math.floor(newXP / 100) + 1;

  await prisma.$transaction(async (tx) => {
    // Update user stats
    await tx.user.update({
      where: { id: user.id },
      data: {
        xp: newXP,
        level: newLevel
      }
    });

    // Add loot to inventory if dropped
    if (lootDropped) {
      const existingItem = await tx.inventoryItem.findFirst({
        where: {
          userId: user.id,
          name: lootDropped.name
        }
      });

      if (existingItem) {
        // Only stack non-equipment items
        if (!lootDropped.slot) {
          await tx.inventoryItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + 1 }
          });
        }
        // Equipment items don't stack - each is unique
      } else {
        await tx.inventoryItem.create({
          data: {
            userId: user.id,
            name: lootDropped.name,
            icon: lootDropped.icon,
            quantity: 1,
            slot: lootDropped.slot || null,
            strength: lootDropped.strength || 0,
            agility: lootDropped.agility || 0,
            intelligence: lootDropped.intelligence || 0,
            vitality: lootDropped.vitality || 0
          }
        });
      }
    }

    // Log the battle
    await tx.adventureLog.create({
      data: {
        userId: user.id,
        type: "battle",
        details: `Defeated ${monster.name} and gained ${Math.floor(xpGained)} XP${damageToUser > 0 ? ` (took ${damageToUser} damage)` : ''}${lootDropped ? `, found ${lootDropped.name}!` : ''}`
      }
    });
  });

  return NextResponse.json({
    success: true,
    battleResult,
    xpGained: Math.floor(xpGained),
    damageDealt: damageToMonster,
    damageTaken: damageToUser,
    lootDropped,
    monster: {
      name: monster.name,
      hp: monster.hp
    }
  });
}