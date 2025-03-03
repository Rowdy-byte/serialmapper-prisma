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
    "serialNumberId" INTEGER,
    CONSTRAINT "Product_serialNumberId_fkey" FOREIGN KEY ("serialNumberId") REFERENCES "SerialNumber" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("createdAt", "description", "id", "inboundId", "name", "number", "serialNumberId") SELECT "createdAt", "description", "id", "inboundId", "name", "number", "serialNumberId" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_serialNumberId_key" ON "Product"("serialNumberId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
