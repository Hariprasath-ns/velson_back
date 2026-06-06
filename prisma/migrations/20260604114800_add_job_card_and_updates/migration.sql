-- DropForeignKey
ALTER TABLE "purchase_master" DROP CONSTRAINT "purchase_master_supplierId_fkey";

-- AlterTable
-- ALTER TABLE "UserCredential" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "company_master" ADD COLUMN     "logoData" BYTEA,
ADD COLUMN     "logoMimeType" TEXT;
-- ALTER COLUMN "updatedAt" DROP DEFAULT;

-- -- AlterTable
-- ALTER TABLE "contractor_master" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "customer_master" ADD COLUMN     "imageData" BYTEA,
ADD COLUMN     "imageMimeType" TEXT,
ADD COLUMN     "imagePath" TEXT,
ADD COLUMN     "pdfData" BYTEA,
ADD COLUMN     "pdfMimeType" TEXT,
ADD COLUMN     "pdfPath" TEXT;
-- ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
-- ALTER TABLE "employee_master" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- -- AlterTable
-- ALTER TABLE "gate_detail" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- -- AlterTable
-- ALTER TABLE "gate_master" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- -- AlterTable
-- ALTER TABLE "grn_detail" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- -- AlterTable
-- ALTER TABLE "grn_master" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "item_master" ADD COLUMN     "imageData" BYTEA,
ADD COLUMN     "imageMimeType" TEXT,
ADD COLUMN     "pdfData" BYTEA,
ADD COLUMN     "pdfMimeType" TEXT,
ADD COLUMN     "routeCardNo" TEXT;

-- AlterTable
ALTER TABLE "item_master_upload" ADD COLUMN     "imageData" BYTEA,
ADD COLUMN     "imageMimeType" TEXT,
ADD COLUMN     "pdfData" BYTEA,
ADD COLUMN     "pdfMimeType" TEXT;
-- ALTER COLUMN "updatedAt" DROP DEFAULT;

-- -- AlterTable
-- ALTER TABLE "machine_master" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- -- AlterTable
-- ALTER TABLE "material_request" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- -- AlterTable
-- ALTER TABLE "material_request_detail" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
-- ALTER TABLE "purchase_detail" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
-- ALTER TABLE "purchase_master" DROP COLUMN "supplierId",
-- ALTER COLUMN "updatedAt" DROP DEFAULT;

-- -- AlterTable
-- ALTER TABLE "purchase_request" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- -- AlterTable
-- ALTER TABLE "purchase_request_detail" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- -- AlterTable
-- ALTER TABLE "quotation_detail" ALTER COLUMN "updatedAt" DROP DEFAULT,
-- ALTER COLUMN "slNo" DROP DEFAULT;

-- AlterTable
ALTER TABLE "quotation_master" ADD COLUMN     "documentData" BYTEA,
ADD COLUMN     "documentMimeType" TEXT;
-- ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
-- ALTER TABLE "vehicle_service_master" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "service_booking" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "bookingDate" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerCode" TEXT,
    "customerVehicleCount" INTEGER DEFAULT 1,
    "vehicleSerialNo" TEXT,
    "serialNo" TEXT,
    "vehicleNo" TEXT,
    "serviceJobNo" TEXT NOT NULL,
    "vehicleModelNo" TEXT NOT NULL,
    "modelSubType" TEXT NOT NULL,
    "vehicleName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_detail" (
    "id" SERIAL NOT NULL,
    "serviceJobNo" TEXT NOT NULL,
    "customerCode" TEXT,
    "vehicleCount" INTEGER DEFAULT 1,
    "customerName" TEXT,
    "bookingId" INTEGER,
    "bookingDate" TEXT,
    "serialNo" TEXT,
    "vehicleNo" TEXT,
    "vehicleModelNo" TEXT NOT NULL,
    "modelSubType" TEXT NOT NULL,
    "vehicleName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "remarks" TEXT,
    "servicePartNo" TEXT,
    "checkedAssemblies" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bom_creation" (
    "id" SERIAL NOT NULL,
    "bomNo" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerName" TEXT NOT NULL,
    "customerCode" TEXT,
    "vehicleCount" INTEGER,
    "serviceJobNo" TEXT NOT NULL,
    "vehicleSerialNo" TEXT,
    "model" TEXT,
    "fileLocation" TEXT,
    "fileName" TEXT,
    "groupName" TEXT,
    "assemblyPartNo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Created',
    "excelRows" JSONB,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bom_creation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_card" (
    "id" SERIAL NOT NULL,
    "jobNo" TEXT NOT NULL,
    "model" TEXT,
    "qtyV" DOUBLE PRECISION,
    "currentDate" TIMESTAMP(3),
    "priority" TEXT,
    "requiredDate" TIMESTAMP(3),
    "note" TEXT,
    "partImage" BYTEA,
    "partImageMime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_card_line_item" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER NOT NULL,
    "slNo" INTEGER NOT NULL,
    "partNo" TEXT NOT NULL,
    "partName" TEXT NOT NULL,
    "planQty" DOUBLE PRECISION,
    "uom" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_card_line_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_booking_bookingId_key" ON "service_booking"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "service_booking_serviceJobNo_key" ON "service_booking"("serviceJobNo");

-- CreateIndex
CREATE UNIQUE INDEX "service_detail_serviceJobNo_key" ON "service_detail"("serviceJobNo");

-- CreateIndex
CREATE UNIQUE INDEX "bom_creation_bomNo_key" ON "bom_creation"("bomNo");

-- CreateIndex
CREATE UNIQUE INDEX "job_card_jobNo_key" ON "job_card"("jobNo");

-- AddForeignKey
ALTER TABLE "purchase_master" ADD CONSTRAINT "purchase_master_supplierRefNo_fkey" FOREIGN KEY ("supplierRefNo") REFERENCES "supplier_master"("sCode") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_card_line_item" ADD CONSTRAINT "job_card_line_item_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "job_card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
