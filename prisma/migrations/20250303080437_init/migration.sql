/*
  Warnings:

  - You are about to drop the `serialNumbers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `serialNumberId` on the `Inbound` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "serialNumbers";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SerialNumber" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serial" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inboundId" INTEGER NOT NULL,
    CONSTRAINT "SerialNumber_inboundId_fkey" FOREIGN KEY ("inboundId") REFERENCES "Inbound" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Inbound" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientName" TEXT NOT NULL,
    CONSTRAINT "Inbound_clientName_fkey" FOREIGN KEY ("clientName") REFERENCES "Client" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Inbound" ("clientName", "createdAt", "description", "id") SELECT "clientName", "createdAt", "description", "id" FROM "Inbound";
DROP TABLE "Inbound";
ALTER TABLE "new_Inbound" RENAME TO "Inbound";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
