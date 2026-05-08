/*
  Warnings:

  - A unique constraint covering the columns `[stripeEventId]` on the table `Purchase` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amount` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - The required column `transactionId` was added to the `Purchase` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updatedAt` to the `Purchase` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'UNPAID');

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "paymentGatewayData" JSONB,
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "stripeEventId" TEXT,
ADD COLUMN     "transactionId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_stripeEventId_key" ON "Purchase"("stripeEventId");
