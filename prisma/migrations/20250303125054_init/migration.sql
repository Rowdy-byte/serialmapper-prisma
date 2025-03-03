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
    CONSTRAINT "Product_inboundId_fkey" FOREIGN KEY ("inboundId") REFERENCES "Inbound" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("createdAt", "description", "id", "inboundId", "name", "number", "serialNumberId") SELECT "createdAt", "description", "id", "inboundId", "name", "number", "serialNumberId" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_serialNumberId_key" ON "Product"("serialNumberId");
CREATE TABLE "new_SerialNumber" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serial" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" INTEGER,
    CONSTRAINT "SerialNumber_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SerialNumber" ("createdAt", "id", "productId", "serial") SELECT "createdAt", "id", "productId", "serial" FROM "SerialNumber";
DROP TABLE "SerialNumber";
ALTER TABLE "new_SerialNumber" RENAME TO "SerialNumber";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
