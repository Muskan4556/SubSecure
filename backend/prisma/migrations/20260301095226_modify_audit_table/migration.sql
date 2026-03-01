/*
  Warnings:

  - You are about to drop the column `subscriptionId` on the `AuditLog` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_subscriptionId_fkey";

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "subscriptionId";
