-- CreateTable
CREATE TABLE "delivery_challan" (
    "id" SERIAL NOT NULL,
    "dcNo" TEXT NOT NULL,
    "financialYear" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "partyType" TEXT NOT NULL,
    "customerId" INTEGER,
    "supplierId" INTEGER,
    "partyName" TEXT NOT NULL,
    "address" TEXT,
    "contPerson" TEXT,
    "contactNo" TEXT,
    "gstNo" TEXT,
    "dcType" TEXT NOT NULL,
    "vehicleNo" TEXT,
    "driverName" TEXT,
    "desThrough" TEXT,
    "termsOfDelivery" TEXT,
    "totalQty" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_challan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_challan_detail" (
    "id" SERIAL NOT NULL,
    "dcId" INTEGER NOT NULL,
    "slNo" INTEGER NOT NULL,
    "barcode" TEXT,
    "partNo" TEXT NOT NULL,
    "partName" TEXT NOT NULL,
    "spec" TEXT,
    "brand" TEXT,
    "qty" DOUBLE PRECISION NOT NULL,
    "uom" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_challan_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_challan_dcNo_key" ON "delivery_challan"("dcNo");

-- AddForeignKey
ALTER TABLE "delivery_challan" ADD CONSTRAINT "delivery_challan_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_challan" ADD CONSTRAINT "delivery_challan_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_challan_detail" ADD CONSTRAINT "delivery_challan_detail_dcId_fkey" FOREIGN KEY ("dcId") REFERENCES "delivery_challan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
