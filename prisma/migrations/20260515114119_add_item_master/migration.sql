-- CreateTable
CREATE TABLE "item_master" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER,
    "partNo" TEXT NOT NULL,
    "outsourcePartNo" TEXT,
    "partName" TEXT NOT NULL,
    "modelId" INTEGER,
    "brand" TEXT,
    "description" TEXT,
    "size" TEXT,
    "weight" DOUBLE PRECISION,
    "unitId" INTEGER,
    "hsnCode" TEXT,
    "purchaseRate" DOUBLE PRECISION,
    "marginPercent" DOUBLE PRECISION,
    "rate" DOUBLE PRECISION,
    "currencyId" INTEGER,
    "taxId" INTEGER,
    "subGroupId" INTEGER,
    "storeId" INTEGER,
    "rackNo" TEXT,
    "location" TEXT,
    "itemTypeId" INTEGER,
    "qcTypeId" INTEGER,
    "materialGradeId" INTEGER,
    "materialTypeId" INTEGER,
    "rawMaterialId" INTEGER,
    "rmLength" TEXT,
    "rawMaterialWt" DOUBLE PRECISION,
    "fgMaterialWt" DOUBLE PRECISION,
    "reorderLevel" DOUBLE PRECISION,
    "minStock" DOUBLE PRECISION,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_master_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "item_master_partNo_key" ON "item_master"("partNo");
