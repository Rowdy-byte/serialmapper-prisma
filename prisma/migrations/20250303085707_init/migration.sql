/*
  Warnings:

  - Added the required column `serialNumberId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
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
    "serialNumberId" INTEGER NOT NULL,
    CONSTRAINT "Product_serialNumberId_fkey" FOREIGN KEY ("serialNumberId") REFERENCES "SerialNumber" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("createdAt", "description", "id", "inboundId", "name", "number") SELECT "createdAt", "description", "id", "inboundId", "name", "number" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_serialNumberId_key" ON "Product"("serialNumberId");
CREATE TABLE "new_SerialNumber" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serial" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" INTEGER
);
INSERT INTO "new_SerialNumber" ("createdAt", "id", "productId", "serial") SELECT "createdAt", "id", "productId", "serial" FROM "SerialNumber";
DROP TABLE "SerialNumber";
ALTER TABLE "new_SerialNumber" RENAME TO "SerialNumber";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
