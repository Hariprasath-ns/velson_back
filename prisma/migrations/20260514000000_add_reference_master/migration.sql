-- CreateTable
CREATE TABLE "reference_master" (
    "id" SERIAL NOT NULL,
    "referenceType" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reference_master_pkey" PRIMARY KEY ("id")
);
