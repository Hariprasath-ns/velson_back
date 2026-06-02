-- CreateTable
CREATE TABLE "part_usage_list" (
    "id" SERIAL NOT NULL,
    "partNo" TEXT NOT NULL,
    "partName" TEXT NOT NULL,
    "group" TEXT,
    "partSpareQty" INTEGER,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "part_usage_list_pkey" PRIMARY KEY ("id")
);
