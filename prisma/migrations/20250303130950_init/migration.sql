/*
  Warnings:

  - You are about to drop the column `serialNumbers` on the `Product` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "SerialNumber" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    CONSTRAINT "SerialNumber_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inboundId" INTEGER,
    CONSTRAINT "Product_inboundId_fkey" FOREIGN KEY ("inboundId") REFERENCES "Inbound" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("createdAt", "description", "id", "inboundId", "name", "number") SELECT "createdAt", "description", "id", "inboundId", "name", "number" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SerialNumber_number_key" ON "SerialNumber"("number");
