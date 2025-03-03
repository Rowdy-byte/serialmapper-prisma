/*
  Warnings:

  - You are about to drop the column `inboundId` on the `SerialNumber` table. All the data in the column will be lost.
  - Added the required column `productId` to the `SerialNumber` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inboundId" INTEGER NOT NULL,
    CONSTRAINT "Product_inboundId_fkey" FOREIGN KEY ("inboundId") REFERENCES "Inbound" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SerialNumber" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serial" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" INTEGER NOT NULL,
    CONSTRAINT "SerialNumber_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SerialNumber" ("createdAt", "id", "serial") SELECT "createdAt", "id", "serial" FROM "SerialNumber";
DROP TABLE "SerialNumber";
ALTER TABLE "new_SerialNumber" RENAME TO "SerialNumber";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
