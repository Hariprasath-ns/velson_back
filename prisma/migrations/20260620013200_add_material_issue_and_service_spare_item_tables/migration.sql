-- CreateTable
CREATE TABLE "service_spare_item" (
    "id" SERIAL NOT NULL,
    "serviceSpareId" INTEGER NOT NULL,
    "partNo" TEXT NOT NULL,
    "partName" TEXT NOT NULL,
    "requiredQty" DOUBLE PRECISION NOT NULL,
    "issuedQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balanceQty" DOUBLE PRECISION NOT NULL,
    "uom" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_spare_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_issue_header" (
    "id" SERIAL NOT NULL,
    "issueNo" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "department" TEXT,
    "remarks" TEXT,
    "model" TEXT,
    "inchargeName" TEXT,
    "receiverName" TEXT,
    "customerName" TEXT,
    "customerCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_issue_header_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_issue_detail" (
    "id" SERIAL NOT NULL,
    "headerId" INTEGER NOT NULL,
    "partNo" TEXT NOT NULL,
    "partName" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "bomReqQty" DOUBLE PRECISION NOT NULL,
    "prevIssuedQty" DOUBLE PRECISION NOT NULL,
    "currentIssuedQty" DOUBLE PRECISION NOT NULL,
    "updatedIssuedQty" DOUBLE PRECISION NOT NULL,
    "updatedBalQty" DOUBLE PRECISION NOT NULL,
    "user" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_issue_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "material_issue_header_issueNo_key" ON "material_issue_header"("issueNo");

-- AddForeignKey
ALTER TABLE "service_spare_item" ADD CONSTRAINT "service_spare_item_serviceSpareId_fkey" FOREIGN KEY ("serviceSpareId") REFERENCES "service_spare"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_issue_detail" ADD CONSTRAINT "material_issue_detail_headerId_fkey" FOREIGN KEY ("headerId") REFERENCES "material_issue_header"("id") ON DELETE CASCADE ON UPDATE CASCADE;
