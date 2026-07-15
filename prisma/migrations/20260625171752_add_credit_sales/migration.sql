-- AlterTable
ALTER TABLE "delivery_challan_detail" ALTER COLUMN "uom" SET DEFAULT 'PCS',
ALTER COLUMN "rate" SET DEFAULT 0,
ALTER COLUMN "amount" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "credit_sales" (
    "id" SERIAL NOT NULL,
    "billNo" TEXT NOT NULL,
    "billDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "salesAc" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "dcNo" TEXT,
    "dcDate" TIMESTAMP(3),
    "partyName" TEXT NOT NULL,
    "address" TEXT,
    "taxType" TEXT NOT NULL,
    "deliveryPlace" TEXT,
    "deliveryTo" TEXT,
    "stockReduce" TEXT NOT NULL DEFAULT 'No',
    "transport" TEXT,
    "remarks" TEXT,
    "totalQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grossAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxableAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cgst" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sgst" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "igst" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_sales_detail" (
    "id" SERIAL NOT NULL,
    "creditSalesId" INTEGER NOT NULL,
    "slNo" INTEGER NOT NULL,
    "barcode" TEXT,
    "partNo" TEXT NOT NULL,
    "partName" TEXT NOT NULL,
    "specification" TEXT,
    "brand" TEXT,
    "uom" TEXT NOT NULL DEFAULT 'PCS',
    "qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grossAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxable" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxPercent" DOUBLE PRECISION NOT NULL DEFAULT 18,
    "netRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_sales_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "credit_sales_billNo_key" ON "credit_sales"("billNo");

-- AddForeignKey
ALTER TABLE "credit_sales_detail" ADD CONSTRAINT "credit_sales_detail_creditSalesId_fkey" FOREIGN KEY ("creditSalesId") REFERENCES "credit_sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;
