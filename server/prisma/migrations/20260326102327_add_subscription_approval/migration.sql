-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "before" DROP NOT NULL,
ALTER COLUMN "after" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
