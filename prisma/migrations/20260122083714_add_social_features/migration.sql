-- CreateTable
CREATE TABLE "MarketplaceListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "listedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "buyerId" TEXT,
    "soldAt" DATETIME,
    CONSTRAINT "MarketplaceListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MarketplaceListing_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MarketplaceListing_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_classId_fkey" FOREIGN KEY ("classId") REFERENCES "CharacterClass" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_weaponId_fkey" FOREIGN KEY ("weaponId") REFERENCES "InventoryItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_armorId_fkey" FOREIGN KEY ("armorId") REFERENCES "InventoryItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "InventoryItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("accessoryId", "agility", "armorId", "classId", "email", "emailVerified", "gold", "id", "image", "intelligence", "level", "name", "partyId", "password", "role", "strength", "vitality", "weaponId", "xp") SELECT "accessoryId", "agility", "armorId", "classId", "email", "emailVerified", "gold", "id", "image", "intelligence", "level", "name", "partyId", "password", "role", "strength", "vitality", "weaponId", "xp" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_weaponId_key" ON "User"("weaponId");
CREATE UNIQUE INDEX "User_armorId_key" ON "User"("armorId");
CREATE UNIQUE INDEX "User_accessoryId_key" ON "User"("accessoryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceListing_itemId_key" ON "MarketplaceListing"("itemId");

-- CreateIndex
CREATE INDEX "MarketplaceListing_sellerId_idx" ON "MarketplaceListing"("sellerId");

-- CreateIndex
CREATE INDEX "MarketplaceListing_status_idx" ON "MarketplaceListing"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_postId_key" ON "Like"("userId", "postId");
