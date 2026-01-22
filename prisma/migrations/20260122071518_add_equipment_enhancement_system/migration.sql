-- CreateTable
CREATE TABLE "CraftingMaterial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "value" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CraftingRecipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "resultItem" TEXT NOT NULL,
    "resultRarity" TEXT NOT NULL DEFAULT 'common',
    "requiredLevel" INTEGER NOT NULL DEFAULT 1,
    "materials" TEXT NOT NULL,
    "goldCost" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "slot" TEXT,
    "strength" INTEGER NOT NULL DEFAULT 0,
    "agility" INTEGER NOT NULL DEFAULT 0,
    "intelligence" INTEGER NOT NULL DEFAULT 0,
    "vitality" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "maxLevel" INTEGER NOT NULL DEFAULT 10,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItem" ("agility", "createdAt", "equipped", "icon", "id", "intelligence", "name", "quantity", "slot", "strength", "userId", "vitality") SELECT "agility", "createdAt", "equipped", "icon", "id", "intelligence", "name", "quantity", "slot", "strength", "userId", "vitality" FROM "InventoryItem";
DROP TABLE "InventoryItem";
ALTER TABLE "new_InventoryItem" RENAME TO "InventoryItem";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "gold" INTEGER NOT NULL DEFAULT 100,
    "classId" TEXT,
    "strength" INTEGER NOT NULL DEFAULT 10,
    "agility" INTEGER NOT NULL DEFAULT 10,
    "intelligence" INTEGER NOT NULL DEFAULT 10,
    "vitality" INTEGER NOT NULL DEFAULT 10,
    "weaponId" TEXT,
    "armorId" TEXT,
    "accessoryId" TEXT,
    "partyId" TEXT,
    CONSTRAINT "User_classId_fkey" FOREIGN KEY ("classId") REFERENCES "CharacterClass" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_weaponId_fkey" FOREIGN KEY ("weaponId") REFERENCES "InventoryItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_armorId_fkey" FOREIGN KEY ("armorId") REFERENCES "InventoryItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "InventoryItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("accessoryId", "agility", "armorId", "classId", "email", "emailVerified", "id", "image", "intelligence", "level", "name", "partyId", "password", "role", "strength", "vitality", "weaponId", "xp") SELECT "accessoryId", "agility", "armorId", "classId", "email", "emailVerified", "id", "image", "intelligence", "level", "name", "partyId", "password", "role", "strength", "vitality", "weaponId", "xp" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_weaponId_key" ON "User"("weaponId");
CREATE UNIQUE INDEX "User_armorId_key" ON "User"("armorId");
CREATE UNIQUE INDEX "User_accessoryId_key" ON "User"("accessoryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CraftingMaterial_name_key" ON "CraftingMaterial"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CraftingRecipe_name_key" ON "CraftingRecipe"("name");
