/*
  Warnings:

  - You are about to drop the column `downvotes` on the `Idea` table. All the data in the column will be lost.
  - You are about to drop the column `upvotes` on the `Idea` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Announcement" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Comments" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Idea" DROP COLUMN "downvotes",
DROP COLUMN "upvotes",
ALTER COLUMN "created_At" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "downvotes" INTEGER,
ADD COLUMN     "upvotes" INTEGER;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "needPasswordChange" SET DEFAULT true;
