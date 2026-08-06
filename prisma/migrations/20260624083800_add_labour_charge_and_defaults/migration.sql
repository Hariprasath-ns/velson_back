-- AlterTable
ALTER TABLE "delivery_challan" ALTER COLUMN "totalQty" SET DEFAULT 0,
ALTER COLUMN "totalAmount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "delivery_challan_detail" ALTER COLUMN "qty" SET DEFAULT 0,
ALTER COLUMN "uom" SET DEFAULT NULL,
ALTER COLUMN "rate" SET DEFAULT NULL,
ALTER COLUMN "amount" SET DEFAULT NULL;

-- AlterTable
ALTER TABLE "item_master" ADD COLUMN     "labourCharge" DECIMAL(10,2);
