/*
  Warnings:

  - The values [REQUESTED] on the enum `SubscriptionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `approvedAt` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `approvedById` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionStatus_new" AS ENUM ('ACTIVE', 'CANCEL_SCHEDULED', 'CANCELLED');
ALTER TABLE "public"."Subscription" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Subscription" ALTER COLUMN "status" TYPE "SubscriptionStatus_new" USING ("status"::text::"SubscriptionStatus_new");
ALTER TYPE "SubscriptionStatus" RENAME TO "SubscriptionStatus_old";
ALTER TYPE "SubscriptionStatus_new" RENAME TO "SubscriptionStatus";
DROP TYPE "public"."SubscriptionStatus_old";
ALTER TABLE "Subscription" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_approvedById_fkey";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "approvedAt",
DROP COLUMN "approvedById",
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
