-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Inbound" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientName" TEXT NOT NULL,
    CONSTRAINT "Inbound_clientName_fkey" FOREIGN KEY ("clientName") REFERENCES "Client" ("name") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Inbound" ("clientName", "createdAt", "description", "id") SELECT "clientName", "createdAt", "description", "id" FROM "Inbound";
DROP TABLE "Inbound";
ALTER TABLE "new_Inbound" RENAME TO "Inbound";
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inboundId" INTEGER,
    CONSTRAINT "Product_inboundId_fkey" FOREIGN KEY ("inboundId") REFERENCES "Inbound" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("createdAt", "description", "id", "inboundId", "name", "number") SELECT "createdAt", "description", "id", "inboundId", "name", "number" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
