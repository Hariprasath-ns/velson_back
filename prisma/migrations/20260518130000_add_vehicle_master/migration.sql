-- CreateTable
CREATE TABLE "vehicle_master" (
    "id" SERIAL NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" INTEGER NOT NULL,
    "vehicleCount" INTEGER DEFAULT 1,
    "address" TEXT,
    "vehicleNumber" TEXT,
    "modelName" TEXT NOT NULL,
    "modelSubType" TEXT,
    "vehicleName" TEXT NOT NULL,
    "serialNumber" TEXT,
    "bomType" TEXT NOT NULL DEFAULT 'New',
    "bomModelNumber" TEXT,
    "remarks" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_master_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vehicle_master" ADD CONSTRAINT "vehicle_master_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
