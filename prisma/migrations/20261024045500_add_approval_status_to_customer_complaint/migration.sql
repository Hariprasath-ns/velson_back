-- AlterTable
ALTER TABLE "customer_complaint" ADD COLUMN IF NOT EXISTS "approvalStatus" TEXT DEFAULT 'Pending Approval';
