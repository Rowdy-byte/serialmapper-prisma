/*
  Warnings:

  - You are about to drop the `SerialNumber` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `inboundId` on the `Product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "SerialNumber_number_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SerialNumber";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "InboundProduct" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "serialnumber" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inboundId" INTEGER NOT NULL,
    "product" TEXT NOT NULL,
    CONSTRAINT "InboundProduct_inboundId_fkey" FOREIGN KEY ("inboundId") REFERENCES "Inbound" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Product" ("createdAt", "description", "id", "name", "number") SELECT "createdAt", "description", "id", "name", "number" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
