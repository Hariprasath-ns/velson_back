-- Create quotation_master if it does not exist
-- (may have been created via prisma db push before this migration was written)
CREATE TABLE IF NOT EXISTS "quotation_master" (
    "id" SERIAL NOT NULL,
    "quotationNo" TEXT NOT NULL,
    "financialYear" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "customerRef" TEXT,
    "currencyCode" TEXT DEFAULT 'INR',
    "exchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "modelRef" TEXT,
    "taxType" TEXT,
    "quotationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "revisionNo" INTEGER NOT NULL DEFAULT 0,
    "quotationType" TEXT,
    "discountType" TEXT NOT NULL DEFAULT 'Dis_Per',
    "showTotalsGrid" BOOLEAN NOT NULL DEFAULT false,
    "specialDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "freightAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxPercent" DOUBLE PRECISION NOT NULL DEFAULT 18,
    "packingForwarding" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentTerms" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quotation_master_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "quotation_master_quotationNo_key" ON "quotation_master"("quotationNo");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quotation_master_customerId_fkey'
  ) THEN
    ALTER TABLE "quotation_master"
      ADD CONSTRAINT "quotation_master_customerId_fkey"
      FOREIGN KEY ("customerId") REFERENCES "customer_master"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- Create quotation_detail if it does not exist (slNo is added below)
CREATE TABLE IF NOT EXISTS "quotation_detail" (
    "id" SERIAL NOT NULL,
    "quotationId" INTEGER NOT NULL,
    "itemId" INTEGER,
    "partNo" TEXT,
    "itemName" TEXT,
    "description" TEXT,
    "hsnCode" TEXT,
    "uom" TEXT,
    "qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quotation_detail_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quotation_detail_quotationId_fkey'
  ) THEN
    ALTER TABLE "quotation_detail"
      ADD CONSTRAINT "quotation_detail_quotationId_fkey"
      FOREIGN KEY ("quotationId") REFERENCES "quotation_master"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quotation_detail_itemId_fkey'
  ) THEN
    ALTER TABLE "quotation_detail"
      ADD CONSTRAINT "quotation_detail_itemId_fkey"
      FOREIGN KEY ("itemId") REFERENCES "item_master"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Add slNo column (the original purpose of this migration)
ALTER TABLE "quotation_detail" ADD COLUMN IF NOT EXISTS "slNo" INTEGER NOT NULL DEFAULT 0;
