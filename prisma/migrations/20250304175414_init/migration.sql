/*
  Warnings:

  - You are about to drop the column `clientId` on the `Inbound` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Inbound" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Inbound_clientName_fkey" FOREIGN KEY ("clientName") REFERENCES "Client" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Inbound" ("clientName", "createdAt", "description", "id") SELECT "clientName", "createdAt", "description", "id" FROM "Inbound";
DROP TABLE "Inbound";
ALTER TABLE "new_Inbound" RENAME TO "Inbound";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
