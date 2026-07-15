-- CreateTable
CREATE TABLE "outsource_parts" (
    "id" SERIAL NOT NULL,
    "dcNo" TEXT NOT NULL,
    "dcDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" INTEGER,
    "partyName" TEXT NOT NULL,
    "address" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outsource_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outsource_parts_detail" (
    "id" SERIAL NOT NULL,
    "registerId" INTEGER NOT NULL,
    "slNo" INTEGER NOT NULL,
    "itemName" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outsource_parts_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "outsource_parts_dcNo_key" ON "outsource_parts"("dcNo");

-- AddForeignKey
ALTER TABLE "outsource_parts" ADD CONSTRAINT "outsource_parts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outsource_parts_detail" ADD CONSTRAINT "outsource_parts_detail_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES "outsource_parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
