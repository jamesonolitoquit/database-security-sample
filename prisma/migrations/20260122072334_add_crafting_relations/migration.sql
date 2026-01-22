/*
  Warnings:

  - You are about to drop the column `materials` on the `CraftingRecipe` table. All the data in the column will be lost.
  - You are about to drop the column `resultItem` on the `CraftingRecipe` table. All the data in the column will be lost.
  - Added the required column `resultItemId` to the `CraftingRecipe` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "RecipeMaterial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "RecipeMaterial_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "CraftingRecipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecipeMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "CraftingMaterial" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserCraftingMaterial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "UserCraftingMaterial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserCraftingMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "CraftingMaterial" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CraftingRecipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "resultItemId" TEXT NOT NULL,
    "resultRarity" TEXT NOT NULL DEFAULT 'common',
    "requiredLevel" INTEGER NOT NULL DEFAULT 1,
    "goldCost" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CraftingRecipe_resultItemId_fkey" FOREIGN KEY ("resultItemId") REFERENCES "InventoryItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CraftingRecipe" ("createdAt", "description", "goldCost", "id", "name", "requiredLevel", "resultRarity") SELECT "createdAt", "description", "goldCost", "id", "name", "requiredLevel", "resultRarity" FROM "CraftingRecipe";
DROP TABLE "CraftingRecipe";
ALTER TABLE "new_CraftingRecipe" RENAME TO "CraftingRecipe";
CREATE UNIQUE INDEX "CraftingRecipe_name_key" ON "CraftingRecipe"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "RecipeMaterial_recipeId_materialId_key" ON "RecipeMaterial"("recipeId", "materialId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCraftingMaterial_userId_materialId_key" ON "UserCraftingMaterial"("userId", "materialId");
