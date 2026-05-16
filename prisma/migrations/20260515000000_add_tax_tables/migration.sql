-- CreateTable
CREATE TABLE "tax_ledger_account" (
    "id" SERIAL NOT NULL,
    "ledgerName" TEXT NOT NULL,
    "taxPercent" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_ledger_account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tax_ledger_account_ledgerName_key" ON "tax_ledger_account"("ledgerName");

-- CreateTable
CREATE TABLE "tax_master" (
    "id" SERIAL NOT NULL,
    "taxLedgerId" INTEGER NOT NULL,
    "taxPercent" DOUBLE PRECISION NOT NULL,
    "cgstTax" DOUBLE PRECISION NOT NULL,
    "sgstTax" DOUBLE PRECISION NOT NULL,
    "igstTax" DOUBLE PRECISION NOT NULL,
    "purchaseCgstTax" DOUBLE PRECISION NOT NULL,
    "purchaseSgstTax" DOUBLE PRECISION NOT NULL,
    "purchaseIgstTax" DOUBLE PRECISION NOT NULL,
    "salesCgstTax" DOUBLE PRECISION NOT NULL,
    "salesSgstTax" DOUBLE PRECISION NOT NULL,
    "salesIgstTax" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_master_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tax_master" ADD CONSTRAINT "tax_master_taxLedgerId_fkey"
    FOREIGN KEY ("taxLedgerId") REFERENCES "tax_ledger_account"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
