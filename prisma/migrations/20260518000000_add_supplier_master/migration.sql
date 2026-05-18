-- CreateTable
CREATE TABLE "supplier_master" (
    "id" SERIAL NOT NULL,
    "supplierType" TEXT NOT NULL,
    "sCode" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "address" TEXT,
    "address2" TEXT,
    "address3" TEXT,
    "address4" TEXT,
    "city" TEXT,
    "country" TEXT DEFAULT 'India',
    "state" TEXT,
    "stateCode" TEXT,
    "pinCode" TEXT,
    "contactPerson" TEXT,
    "mobile" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "gstNo" TEXT,
    "panNo" TEXT,
    "bankName" TEXT,
    "branchName" TEXT,
    "accountName" TEXT,
    "accountNumber" TEXT,
    "ifscCode" TEXT,
    "micrCode" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_master_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "supplier_master_sCode_key" ON "supplier_master"("sCode");
