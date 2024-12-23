-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "ProfilePhoto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userID" INTEGER NOT NULL,
    CONSTRAINT "ProfilePhoto_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Content" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "authorID" INTEGER NOT NULL,
    "creationTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Content_authorID_fkey" FOREIGN KEY ("authorID") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Voted" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userID" INTEGER NOT NULL,
    "contentID" INTEGER NOT NULL,
    CONSTRAINT "Voted_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Voted_contentID_fkey" FOREIGN KEY ("contentID") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Upvoted" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userID" INTEGER NOT NULL,
    "contentID" INTEGER NOT NULL,
    CONSTRAINT "Upvoted_userID_contentID_fkey" FOREIGN KEY ("userID", "contentID") REFERENCES "Voted" ("userID", "contentID") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Upvoted_contentID_fkey" FOREIGN KEY ("contentID") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Upvoted_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Downvoted" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userID" INTEGER NOT NULL,
    "contentID" INTEGER NOT NULL,
    CONSTRAINT "Downvoted_userID_contentID_fkey" FOREIGN KEY ("userID", "contentID") REFERENCES "Voted" ("userID", "contentID") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Downvoted_contentID_fkey" FOREIGN KEY ("contentID") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Downvoted_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reported" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userID" INTEGER NOT NULL,
    "contentID" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    CONSTRAINT "Reported_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Reported_contentID_fkey" FOREIGN KEY ("contentID") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CodeTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "authorID" INTEGER NOT NULL,
    "forkID" INTEGER,
    CONSTRAINT "CodeTemplate_authorID_fkey" FOREIGN KEY ("authorID") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CodeTemplate_forkID_fkey" FOREIGN KEY ("forkID") REFERENCES "CodeTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contentID" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    CONSTRAINT "Post_contentID_fkey" FOREIGN KEY ("contentID") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contentID" INTEGER NOT NULL,
    "postID" INTEGER NOT NULL,
    CONSTRAINT "Comment_postID_fkey" FOREIGN KEY ("postID") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_contentID_fkey" FOREIGN KEY ("contentID") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reply" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contentID" INTEGER NOT NULL,
    "commentID" INTEGER NOT NULL,
    CONSTRAINT "Reply_commentID_fkey" FOREIGN KEY ("commentID") REFERENCES "Comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Reply_contentID_fkey" FOREIGN KEY ("contentID") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CodeTemplateTag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "templateID" INTEGER NOT NULL,
    "tagID" INTEGER NOT NULL,
    CONSTRAINT "CodeTemplateTag_templateID_fkey" FOREIGN KEY ("templateID") REFERENCES "CodeTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CodeTemplateTag_tagID_fkey" FOREIGN KEY ("tagID") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PostTag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postID" INTEGER NOT NULL,
    "tagID" INTEGER NOT NULL,
    CONSTRAINT "PostTag_postID_fkey" FOREIGN KEY ("postID") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PostTag_tagID_fkey" FOREIGN KEY ("tagID") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ProfilePhoto_userID_key" ON "ProfilePhoto"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "Voted_userID_contentID_key" ON "Voted"("userID", "contentID");

-- CreateIndex
CREATE UNIQUE INDEX "Upvoted_userID_contentID_key" ON "Upvoted"("userID", "contentID");

-- CreateIndex
CREATE UNIQUE INDEX "Downvoted_userID_contentID_key" ON "Downvoted"("userID", "contentID");

-- CreateIndex
CREATE UNIQUE INDEX "Reported_userID_contentID_key" ON "Reported"("userID", "contentID");

-- CreateIndex
CREATE UNIQUE INDEX "Post_contentID_key" ON "Post"("contentID");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_contentID_key" ON "Comment"("contentID");

-- CreateIndex
CREATE UNIQUE INDEX "Reply_contentID_key" ON "Reply"("contentID");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CodeTemplateTag_templateID_tagID_key" ON "CodeTemplateTag"("templateID", "tagID");

-- CreateIndex
CREATE UNIQUE INDEX "PostTag_postID_tagID_key" ON "PostTag"("postID", "tagID");
