-- CreateTable
CREATE TABLE "quotation_sales" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "documentPath" TEXT,
    "documentData" BYTEA,
    "documentMimeType" TEXT,

    CONSTRAINT "quotation_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_sales_detail" (
    "id" SERIAL NOT NULL,
    "quotationSalesId" INTEGER NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slNo" INTEGER NOT NULL,

    CONSTRAINT "quotation_sales_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quotation_sales_quotationNo_key" ON "quotation_sales"("quotationNo");

-- AddForeignKey
ALTER TABLE "quotation_sales" ADD CONSTRAINT "quotation_sales_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_sales_detail" ADD CONSTRAINT "quotation_sales_detail_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_sales_detail" ADD CONSTRAINT "quotation_sales_detail_quotationSalesId_fkey" FOREIGN KEY ("quotationSalesId") REFERENCES "quotation_sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;
