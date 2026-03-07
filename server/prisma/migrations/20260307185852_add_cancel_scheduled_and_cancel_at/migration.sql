-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'CANCEL_SCHEDULED';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "cancelAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'REQUESTED';

-- CreateIndex
CREATE INDEX "Subscription_ownerId_idx" ON "Subscription"("ownerId");

-- CreateIndex
CREATE INDEX "Subscription_renewalDate_idx" ON "Subscription"("renewalDate");

-- CreateIndex
CREATE INDEX "Subscription_cancelAt_idx" ON "Subscription"("cancelAt");
