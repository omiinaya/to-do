-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Todo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "thingId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "dueDate" DATETIME,
    "tags" TEXT NOT NULL DEFAULT '',
    "recurrence" TEXT,
    "parentTodoId" TEXT,
    CONSTRAINT "Todo_parentTodoId_fkey" FOREIGN KEY ("parentTodoId") REFERENCES "Todo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Todo_thingId_fkey" FOREIGN KEY ("thingId") REFERENCES "Thing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Todo" ("completed", "completedAt", "createdAt", "id", "note", "priority", "thingId") SELECT "completed", "completedAt", "createdAt", "id", "note", "priority", "thingId" FROM "Todo";
DROP TABLE "Todo";
ALTER TABLE "new_Todo" RENAME TO "Todo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
