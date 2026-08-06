-- CreateTable
CREATE TABLE "stock_adjustment" (
    "id" SERIAL NOT NULL,
    "partNo" TEXT NOT NULL,
    "partName" TEXT,
    "qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "uom" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "barcode" TEXT,
    "barcodeType" TEXT DEFAULT 'Single',
    "type" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT DEFAULT 'Admin',
    "updatedBy" TEXT DEFAULT 'Admin',

    CONSTRAINT "stock_adjustment_pkey" PRIMARY KEY ("id")
);
