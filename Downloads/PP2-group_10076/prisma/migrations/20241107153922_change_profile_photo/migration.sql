/*
  Warnings:

  - You are about to drop the `ProfilePhoto` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "ProfilePhoto_userID_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ProfilePhoto";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "avatar" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("email", "firstName", "id", "isAdmin", "lastName", "password", "phone", "username") SELECT "email", "firstName", "id", "isAdmin", "lastName", "password", "phone", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
