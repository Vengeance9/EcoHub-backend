/*
  Warnings:

  - A unique constraint covering the columns `[userId,ideaId]` on the table `WatchList` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WatchList_userId_ideaId_key" ON "WatchList"("userId", "ideaId");
