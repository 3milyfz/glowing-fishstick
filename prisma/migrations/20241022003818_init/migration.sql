/*
  Warnings:

  - Added the required column `language` to the `CodeTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CodeTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "authorID" INTEGER NOT NULL,
    "forkID" INTEGER,
    CONSTRAINT "CodeTemplate_authorID_fkey" FOREIGN KEY ("authorID") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CodeTemplate_forkID_fkey" FOREIGN KEY ("forkID") REFERENCES "CodeTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CodeTemplate" ("authorID", "code", "explanation", "forkID", "id", "title") SELECT "authorID", "code", "explanation", "forkID", "id", "title" FROM "CodeTemplate";
DROP TABLE "CodeTemplate";
ALTER TABLE "new_CodeTemplate" RENAME TO "CodeTemplate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
