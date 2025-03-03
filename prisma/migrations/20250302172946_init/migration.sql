/*
  Warnings:

  - You are about to drop the column `clientId` on the `Inbound` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
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
    "serialNumberId" INTEGER NOT NULL,
    CONSTRAINT "Inbound_clientName_fkey" FOREIGN KEY ("clientName") REFERENCES "Client" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Inbound" ("createdAt", "description", "id", "serialNumberId") SELECT "createdAt", "description", "id", "serialNumberId" FROM "Inbound";
DROP TABLE "Inbound";
ALTER TABLE "new_Inbound" RENAME TO "Inbound";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Client_name_key" ON "Client"("name");
