/*
  Warnings:

  - You are about to drop the column `created_At` on the `Idea` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Idea" DROP COLUMN "created_At",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
