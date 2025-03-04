/*
  Warnings:

  - Added the required column `clientName` to the `Inbound` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Inbound" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientName" TEXT NOT NULL,
    "clientId" INTEGER NOT NULL,
    CONSTRAINT "Inbound_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Inbound" ("clientId", "createdAt", "description", "id") SELECT "clientId", "createdAt", "description", "id" FROM "Inbound";
DROP TABLE "Inbound";
ALTER TABLE "new_Inbound" RENAME TO "Inbound";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
