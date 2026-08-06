-- CreateTable
CREATE TABLE "service_bill" (
    "id" SERIAL NOT NULL,
    "refNo" TEXT NOT NULL,
    "billDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serviceNo" TEXT NOT NULL,
    "partyName" TEXT NOT NULL,
    "cusCode" TEXT,
    "address" TEXT,
    "taxType" TEXT NOT NULL,
    "serviceJobNo" TEXT,
    "serialNo" TEXT,
    "vehicleCount" TEXT,
    "vehicleNo" TEXT,
    "vehicleModelNo" TEXT,
    "modelSubType" TEXT,
    "vehicleName" TEXT,
    "servicePartNo" TEXT,
    "materialCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "labourCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gstPer" DOUBLE PRECISION NOT NULL DEFAULT 18,
    "gstAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "billAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_bill_item" (
    "id" SERIAL NOT NULL,
    "serviceBillId" INTEGER NOT NULL,
    "slNo" INTEGER NOT NULL,
    "itemName" TEXT NOT NULL,
    "barcode" TEXT,
    "uom" TEXT,
    "qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "labourCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "issueNo" TEXT,
    "jobNo" TEXT,
    "receiver" TEXT,
    "miRe" TEXT,
    "bookingCode" TEXT,
    "vehicleType" TEXT,
    "serviceM" TEXT,
    "mItemNa" TEXT,
    "printOrderNo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_bill_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_bill_refNo_key" ON "service_bill"("refNo");

-- AddForeignKey
ALTER TABLE "service_bill_item" ADD CONSTRAINT "service_bill_item_serviceBillId_fkey" FOREIGN KEY ("serviceBillId") REFERENCES "service_bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
