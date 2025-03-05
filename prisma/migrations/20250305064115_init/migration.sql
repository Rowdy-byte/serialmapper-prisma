-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InboundProduct" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "product" TEXT NOT NULL,
    "serialnumber" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inboundId" INTEGER NOT NULL,
    CONSTRAINT "InboundProduct_inboundId_fkey" FOREIGN KEY ("inboundId") REFERENCES "Inbound" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_InboundProduct" ("createdAt", "id", "inboundId", "product", "serialnumber") SELECT "createdAt", "id", "inboundId", "product", "serialnumber" FROM "InboundProduct";
DROP TABLE "InboundProduct";
ALTER TABLE "new_InboundProduct" RENAME TO "InboundProduct";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
