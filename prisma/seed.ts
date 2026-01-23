import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: "./dev.db",
});

const prisma = new PrismaClient({
  adapter,
})

async function main() {
  console.log('Seeding database...')

  // Create admin user for crafting items
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@isekai-gate.com' },
    update: {},
    create: {
      email: 'admin@isekai-gate.com',
      name: 'Admin',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
      role: 'admin',
      gold: 10000
    }
  })

  // Delete demo account if it exists
  await prisma.user.deleteMany({ where: { email: 'demo@demo.test' } });

  // Create or update demo account for automatic login
  const demoAccount = await prisma.user.upsert({
    where: { email: 'demo@demo.test' },
    update: {
      password: '$2b$10$8Q79hgARjjqyZySkz4I9nuKCXYinG2exTiZAI0rmrrV5EDt9WspSu', // password: "demopassword"
      name: 'Demo Account',
      level: 3,
      xp: 500,
      gold: 200,
      strength: 8,
      agility: 8,
      intelligence: 8,
      vitality: 8,
    },
    create: {
      email: 'demo@demo.test',
      name: 'Demo Account',
      password: '$2b$10$8Q79hgARjjqyZySkz4I9nuKCXYinG2exTiZAI0rmrrV5EDt9WspSu', // password: "demopassword"
      level: 3,
      xp: 500,
      gold: 200,
      strength: 8,
      agility: 8,
      intelligence: 8,
      vitality: 8,
    }
  })

  // Create sample quests
  const quests = [
    {
      title: 'Slay the Goblin King',
      description: 'Defeat the Goblin King in the Dark Forest and bring back his crown as proof.',
      xpReward: 100,
      type: 'story'
    },
    {
      title: 'Collect 10 Herbs',
      description: 'Gather 10 healing herbs from the Meadow of Whispers.',
      xpReward: 25,
      type: 'daily'
    },
    {
      title: 'Train with the Master',
      description: 'Complete training sessions with the village sword master.',
      xpReward: 50,
      type: 'weekly'
    },
    {
      title: 'Explore the Ancient Ruins',
      description: 'Map out the ancient ruins and report any findings.',
      xpReward: 75,
      type: 'story'
    },
    {
      title: 'Help the Villagers',
      description: 'Assist 5 villagers with their daily tasks.',
      xpReward: 30,
      type: 'daily'
    }
  ]

  for (const quest of quests) {
    await prisma.quest.create({
      data: quest
    })
  }

  // Create sample monsters
  const monsters = [
    {
      name: 'Goblin Scout',
      hp: 50,
      attack: 8,
      defense: 3
    },
    {
      name: 'Forest Wolf',
      hp: 75,
      attack: 12,
      defense: 5
    },
    {
      name: 'Stone Golem',
      hp: 150,
      attack: 15,
      defense: 12
    },
    {
      name: 'Dark Mage',
      hp: 100,
      attack: 20,
      defense: 8
    }
  ]

  for (const monster of monsters) {
    await prisma.monster.create({
      data: monster
    })
  }

  // Create character classes
  const characterClasses = [
    {
      name: 'Warrior',
      description: 'Masters of melee combat with unmatched strength and vitality.',
      icon: '⚔️',
      strengthBonus: 3,
      agilityBonus: 1,
      intelligenceBonus: 0,
      vitalityBonus: 2,
      abilities: JSON.stringify(['Power Strike', 'Shield Wall', 'Berserker Rage'])
    },
    {
      name: 'Mage',
      description: 'Wielders of arcane magic with superior intelligence and spellcasting.',
      icon: '🔮',
      strengthBonus: 0,
      agilityBonus: 1,
      intelligenceBonus: 4,
      vitalityBonus: 0,
      abilities: JSON.stringify(['Fireball', 'Ice Shield', 'Teleport'])
    },
    {
      name: 'Rogue',
      description: 'Stealthy assassins with exceptional agility and precision.',
      icon: '🗡️',
      strengthBonus: 1,
      agilityBonus: 3,
      intelligenceBonus: 1,
      vitalityBonus: 0,
      abilities: JSON.stringify(['Backstab', 'Smoke Bomb', 'Shadow Step'])
    },
    {
      name: 'Paladin',
      description: 'Holy warriors combining martial prowess with divine magic.',
      icon: '🛡️',
      strengthBonus: 2,
      agilityBonus: 0,
      intelligenceBonus: 2,
      vitalityBonus: 2,
      abilities: JSON.stringify(['Holy Strike', 'Divine Shield', 'Healing Light'])
    },
    {
      name: 'Ranger',
      description: 'Forest guardians skilled with bows and nature magic.',
      icon: '🏹',
      strengthBonus: 1,
      agilityBonus: 2,
      intelligenceBonus: 1,
      vitalityBonus: 1,
      abilities: JSON.stringify(['Arrow Storm', 'Beast Call', 'Nature\'s Grasp'])
    }
  ]

  for (const characterClass of characterClasses) {
    await prisma.characterClass.upsert({
      where: { name: characterClass.name },
      update: characterClass,
      create: characterClass
    })
  }

  // Create sample inventory items
  const items = [
    { name: 'Health Potion', icon: '🧪', quantity: 1 },
    { name: 'Gold Coins', icon: '🪙', quantity: 100 },
    { name: 'Mana Crystal', icon: '🔮', quantity: 1 },
    { name: 'Dragon Scale', icon: '🐲', quantity: 1 },
    { name: 'Ancient Tome', icon: '📚', quantity: 1 },
    // Equipment items
    { name: 'Iron Sword', icon: '⚔️', slot: 'weapon', strength: 5, quantity: 1 },
    { name: 'Leather Armor', icon: '🛡️', slot: 'armor', vitality: 3, quantity: 1 },
    { name: 'Magic Ring', icon: '💍', slot: 'accessory', intelligence: 4, quantity: 1 },
    { name: 'Steel Blade', icon: '🗡️', slot: 'weapon', strength: 8, quantity: 1 },
    { name: 'Chain Mail', icon: '🔗', slot: 'armor', vitality: 5, agility: -1, quantity: 1 },
    { name: 'Amulet of Power', icon: '📿', slot: 'accessory', strength: 3, intelligence: 3, quantity: 1 }
  ]

  // Note: Items will be added to user inventories during gameplay
  console.log('Sample items defined for loot drops')

  // Create crafting materials
  const ironOre = await prisma.craftingMaterial.upsert({
    where: { name: 'Iron Ore' },
    update: { name: 'Iron Ore', icon: '⛰️', description: 'Common metal ore found in mines', rarity: 'common', value: 5 },
    create: { name: 'Iron Ore', icon: '⛰️', description: 'Common metal ore found in mines', rarity: 'common', value: 5 }
  })

  const copperOre = await prisma.craftingMaterial.upsert({
    where: { name: 'Copper Ore' },
    update: { name: 'Copper Ore', icon: '🏔️', description: 'Basic conductive metal', rarity: 'common', value: 3 },
    create: { name: 'Copper Ore', icon: '🏔️', description: 'Basic conductive metal', rarity: 'common', value: 3 }
  })

  const silverOre = await prisma.craftingMaterial.upsert({
    where: { name: 'Silver Ore' },
    update: { name: 'Silver Ore', icon: '⚪', description: 'Precious metal with magical properties', rarity: 'rare', value: 25 },
    create: { name: 'Silver Ore', icon: '⚪', description: 'Precious metal with magical properties', rarity: 'rare', value: 25 }
  })

  const goldOre = await prisma.craftingMaterial.upsert({
    where: { name: 'Gold Ore' },
    update: { name: 'Gold Ore', icon: '🟡', description: 'Rare and valuable metal', rarity: 'rare', value: 50 },
    create: { name: 'Gold Ore', icon: '🟡', description: 'Rare and valuable metal', rarity: 'rare', value: 50 }
  })

  const mithrilOre = await prisma.craftingMaterial.upsert({
    where: { name: 'Mithril Ore' },
    update: { name: 'Mithril Ore', icon: '💎', description: 'Legendary lightweight metal', rarity: 'epic', value: 200 },
    create: { name: 'Mithril Ore', icon: '💎', description: 'Legendary lightweight metal', rarity: 'epic', value: 200 }
  })

  const dragonScale = await prisma.craftingMaterial.upsert({
    where: { name: 'Dragon Scale' },
    update: { name: 'Dragon Scale', icon: '🐲', description: 'Scale from ancient dragons', rarity: 'legendary', value: 500 },
    create: { name: 'Dragon Scale', icon: '🐲', description: 'Scale from ancient dragons', rarity: 'legendary', value: 500 }
  })

  const phoenixFeather = await prisma.craftingMaterial.upsert({
    where: { name: 'Phoenix Feather' },
    update: { name: 'Phoenix Feather', icon: '🔥', description: 'Feather from a mythical phoenix', rarity: 'legendary', value: 750 },
    create: { name: 'Phoenix Feather', icon: '🔥', description: 'Feather from a mythical phoenix', rarity: 'legendary', value: 750 }
  })

  const leatherHide = await prisma.craftingMaterial.upsert({
    where: { name: 'Leather Hide' },
    update: { name: 'Leather Hide', icon: '🐂', description: 'Tough animal hide', rarity: 'common', value: 8 },
    create: { name: 'Leather Hide', icon: '🐂', description: 'Tough animal hide', rarity: 'common', value: 8 }
  })

  const wolfPelt = await prisma.craftingMaterial.upsert({
    where: { name: 'Wolf Pelt' },
    update: { name: 'Wolf Pelt', icon: '🐺', description: 'Warm and durable wolf fur', rarity: 'uncommon', value: 15 },
    create: { name: 'Wolf Pelt', icon: '🐺', description: 'Warm and durable wolf fur', rarity: 'uncommon', value: 15 }
  })

  const silkThread = await prisma.craftingMaterial.upsert({
    where: { name: 'Silk Thread' },
    update: { name: 'Silk Thread', icon: '🧵', description: 'Fine thread from magical spiders', rarity: 'rare', value: 30 },
    create: { name: 'Silk Thread', icon: '🧵', description: 'Fine thread from magical spiders', rarity: 'rare', value: 30 }
  })

  const manaCrystal = await prisma.craftingMaterial.upsert({
    where: { name: 'Mana Crystal' },
    update: { name: 'Mana Crystal', icon: '🔮', description: 'Crystal infused with magical energy', rarity: 'rare', value: 40 },
    create: { name: 'Mana Crystal', icon: '🔮', description: 'Crystal infused with magical energy', rarity: 'rare', value: 40 }
  })

  const ancientWood = await prisma.craftingMaterial.upsert({
    where: { name: 'Ancient Wood' },
    update: { name: 'Ancient Wood', icon: '🌳', description: 'Wood from ancient enchanted trees', rarity: 'epic', value: 150 },
    create: { name: 'Ancient Wood', icon: '🌳', description: 'Wood from ancient enchanted trees', rarity: 'epic', value: 150 }
  })

  // Create crafting items first
  const steelSword = await prisma.inventoryItem.create({
    data: {
      userId: adminUser.id,
      name: 'Steel Sword',
      icon: '⚔️',
      slot: 'weapon',
      strength: 15,
      rarity: 'rare',
      maxLevel: 20
    }
  })

  const magicRobes = await prisma.inventoryItem.create({
    data: {
      userId: adminUser.id,
      name: 'Magic Robes',
      icon: '🧙',
      slot: 'armor',
      intelligence: 12,
      vitality: 8,
      rarity: 'rare',
      maxLevel: 18
    }
  })

  const mithrilArmor = await prisma.inventoryItem.create({
    data: {
      userId: adminUser.id,
      name: 'Mithril Armor',
      icon: '🛡️',
      slot: 'armor',
      strength: 10,
      vitality: 20,
      rarity: 'epic',
      maxLevel: 25
    }
  })

  const phoenixRing = await prisma.inventoryItem.create({
    data: {
      userId: adminUser.id,
      name: 'Phoenix Ring',
      icon: '💍',
      slot: 'accessory',
      strength: 8,
      intelligence: 8,
      vitality: 10,
      rarity: 'legendary',
      maxLevel: 30
    }
  })

  // Create crafting recipes
  const steelSwordRecipe = await prisma.craftingRecipe.upsert({
    where: { name: 'Steel Sword Recipe' },
    update: {
      resultItemId: steelSword.id,
      resultRarity: 'rare',
      requiredLevel: 5,
      goldCost: 100,
      description: 'A sturdy steel sword with enhanced durability'
    },
    create: {
      name: 'Steel Sword Recipe',
      resultItemId: steelSword.id,
      resultRarity: 'rare',
      requiredLevel: 5,
      goldCost: 100,
      description: 'A sturdy steel sword with enhanced durability'
    }
  })

  const magicRobesRecipe = await prisma.craftingRecipe.upsert({
    where: { name: 'Magic Robes Recipe' },
    update: {
      resultItemId: magicRobes.id,
      resultRarity: 'rare',
      requiredLevel: 5,
      goldCost: 150,
      description: 'Robes infused with magical energy'
    },
    create: {
      name: 'Magic Robes Recipe',
      resultItemId: magicRobes.id,
      resultRarity: 'rare',
      requiredLevel: 5,
      goldCost: 150,
      description: 'Robes infused with magical energy'
    }
  })

  const mithrilArmorRecipe = await prisma.craftingRecipe.upsert({
    where: { name: 'Mithril Armor Recipe' },
    update: {
      resultItemId: mithrilArmor.id,
      resultRarity: 'epic',
      requiredLevel: 10,
      goldCost: 500,
      description: 'Lightweight armor made from legendary mithril'
    },
    create: {
      name: 'Mithril Armor Recipe',
      resultItemId: mithrilArmor.id,
      resultRarity: 'epic',
      requiredLevel: 10,
      goldCost: 500,
      description: 'Lightweight armor made from legendary mithril'
    }
  })

  const phoenixRingRecipe = await prisma.craftingRecipe.upsert({
    where: { name: 'Phoenix Ring Recipe' },
    update: {
      resultItemId: phoenixRing.id,
      resultRarity: 'legendary',
      requiredLevel: 15,
      goldCost: 1000,
      description: 'A ring that grants rebirth and healing powers'
    },
    create: {
      name: 'Phoenix Ring Recipe',
      resultItemId: phoenixRing.id,
      resultRarity: 'legendary',
      requiredLevel: 15,
      goldCost: 1000,
      description: 'A ring that grants rebirth and healing powers'
    }
  })

  // Create recipe materials
  const recipeMaterials = [
    // Steel Sword materials
    { recipeId: steelSwordRecipe.id, materialId: ironOre.id, quantity: 3 },
    { recipeId: steelSwordRecipe.id, materialId: leatherHide.id, quantity: 1 },
    // Magic Robes materials
    { recipeId: magicRobesRecipe.id, materialId: silkThread.id, quantity: 2 },
    { recipeId: magicRobesRecipe.id, materialId: manaCrystal.id, quantity: 1 },
    // Mithril Armor materials
    { recipeId: mithrilArmorRecipe.id, materialId: mithrilOre.id, quantity: 5 },
    { recipeId: mithrilArmorRecipe.id, materialId: ancientWood.id, quantity: 2 },
    { recipeId: mithrilArmorRecipe.id, materialId: dragonScale.id, quantity: 1 },
    // Phoenix Ring materials
    { recipeId: phoenixRingRecipe.id, materialId: goldOre.id, quantity: 3 },
    { recipeId: phoenixRingRecipe.id, materialId: phoenixFeather.id, quantity: 1 },
    { recipeId: phoenixRingRecipe.id, materialId: manaCrystal.id, quantity: 2 }
  ]

  for (const material of recipeMaterials) {
    await prisma.recipeMaterial.upsert({
      where: {
        recipeId_materialId: {
          recipeId: material.recipeId,
          materialId: material.materialId
        }
      },
      update: material,
      create: material
    })
  }

  // Create sample parties
  console.log('Seeding complete - parties will be created by users')

  // Create demo users for testing social features
  const demoUser1 = await prisma.user.upsert({
    where: { email: 'warrior@isekai-gate.com' },
    update: {},
    create: {
      email: 'warrior@isekai-gate.com',
      name: 'IronFist',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
      level: 5,
      xp: 1250,
      gold: 500,
      strength: 15,
      agility: 8,
      intelligence: 5,
      vitality: 12,
    }
  })

  const demoUser2 = await prisma.user.upsert({
    where: { email: 'mage@isekai-gate.com' },
    update: {},
    create: {
      email: 'mage@isekai-gate.com',
      name: 'ArcaneMaster',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
      level: 7,
      xp: 2100,
      gold: 750,
      strength: 4,
      agility: 6,
      intelligence: 18,
      vitality: 7,
    }
  })

  const demoUser3 = await prisma.user.upsert({
    where: { email: 'rogue@isekai-gate.com' },
    update: {},
    create: {
      email: 'rogue@isekai-gate.com',
      name: 'ShadowBlade',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
      level: 4,
      xp: 950,
      gold: 300,
      strength: 7,
      agility: 16,
      intelligence: 8,
      vitality: 5,
    }
  })

  // Create some demo posts
  await prisma.post.create({
    data: {
      content: "Just defeated a Stone Golem! That was an epic battle! 🗿⚔️",
      authorId: demoUser1.id,
    }
  })

  await prisma.post.create({
    data: {
      content: "Anyone up for a dungeon crawl? Looking for a tank and healer! 🏰",
      authorId: demoUser2.id,
    }
  })

  await prisma.post.create({
    data: {
      content: "Found some rare crafting materials in the Dark Forest. Happy hunting! 🌲🔮",
      authorId: demoUser3.id,
    }
  })

  // Create demo friendships
  await prisma.friendship.createMany({
    data: [
      { userId: adminUser.id, friendId: demoUser1.id },
      { userId: demoUser1.id, friendId: adminUser.id },
      { userId: adminUser.id, friendId: demoUser2.id },
      { userId: demoUser2.id, friendId: adminUser.id },
    ],
  })

  // Create demo follows
  await prisma.follow.createMany({
    data: [
      { followerId: demoUser3.id, followingId: adminUser.id },
      { followerId: demoUser3.id, followingId: demoUser1.id },
      { followerId: demoUser1.id, followingId: demoUser2.id },
    ],
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })