/*
  Warnings:

  - You are about to drop the column `class` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "CharacterClass" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "strengthBonus" INTEGER NOT NULL DEFAULT 0,
    "agilityBonus" INTEGER NOT NULL DEFAULT 0,
    "intelligenceBonus" INTEGER NOT NULL DEFAULT 0,
    "vitalityBonus" INTEGER NOT NULL DEFAULT 0,
    "abilities" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
INSERT INTO "new_User" ("accessoryId", "agility", "armorId", "email", "emailVerified", "id", "image", "intelligence", "level", "name", "partyId", "password", "role", "strength", "vitality", "weaponId", "xp") SELECT "accessoryId", "agility", "armorId", "email", "emailVerified", "id", "image", "intelligence", "level", "name", "partyId", "password", "role", "strength", "vitality", "weaponId", "xp" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_weaponId_key" ON "User"("weaponId");
CREATE UNIQUE INDEX "User_armorId_key" ON "User"("armorId");
CREATE UNIQUE INDEX "User_accessoryId_key" ON "User"("accessoryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CharacterClass_name_key" ON "CharacterClass"("name");
