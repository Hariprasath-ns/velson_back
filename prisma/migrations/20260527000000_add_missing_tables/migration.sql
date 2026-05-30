-- item_master_upload
CREATE TABLE IF NOT EXISTS "item_master_upload" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "imagePath" TEXT,
    "pdfPath" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_master_upload_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'item_master_upload_itemId_fkey') THEN
    ALTER TABLE "item_master_upload" ADD CONSTRAINT "item_master_upload_itemId_fkey"
        FOREIGN KEY ("itemId") REFERENCES "item_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- gate_master
CREATE TABLE IF NOT EXISTS "gate_master" (
    "id" SERIAL NOT NULL,
    "gateEntryNo" TEXT NOT NULL,
    "financialYear" TEXT NOT NULL DEFAULT '',
    "gateEntryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "poId" INTEGER,
    "poNo" TEXT,
    "prqNo" TEXT,
    "supplierName" TEXT,
    "supplierAddress" TEXT,
    "gateNo" TEXT,
    "carrierName" TEXT,
    "vehicleNo" TEXT,
    "invoiceNo" TEXT,
    "invoiceDate" TIMESTAMP(3),
    "remarks" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gate_master_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "gate_master_gateEntryNo_key" ON "gate_master"("gateEntryNo");

-- gate_detail
CREATE TABLE IF NOT EXISTS "gate_detail" (
    "id" SERIAL NOT NULL,
    "gateId" INTEGER NOT NULL,
    "slNo" INTEGER NOT NULL,
    "poNo" TEXT,
    "itemCode" TEXT,
    "itemName" TEXT,
    "supplierPartNo" TEXT,
    "description" TEXT,
    "hsnCode" TEXT,
    "unit" TEXT,
    "qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "recQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gate_detail_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gate_detail_gateId_fkey') THEN
    ALTER TABLE "gate_detail" ADD CONSTRAINT "gate_detail_gateId_fkey"
        FOREIGN KEY ("gateId") REFERENCES "gate_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- employee_master
CREATE TABLE IF NOT EXISTS "employee_master" (
    "id" SERIAL NOT NULL,
    "empCode" TEXT NOT NULL,
    "empName" TEXT NOT NULL,
    "address" TEXT,
    "contactNo" TEXT,
    "adharNo" TEXT,
    "joinDate" TIMESTAMP(3),
    "relevingDate" TIMESTAMP(3),
    "department" TEXT,
    "designation" TEXT,
    "contractPerson" TEXT,
    "companyName" TEXT,
    "team" TEXT,
    "emailId" TEXT,
    "repPerson" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "deletedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_master_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "employee_master_empCode_key" ON "employee_master"("empCode");

-- company_master
CREATE TABLE IF NOT EXISTS "company_master" (
    "id" SERIAL NOT NULL,
    "companyCode" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyType" TEXT,
    "doorNumber" TEXT,
    "street" TEXT,
    "place" TEXT,
    "post" TEXT,
    "city" TEXT,
    "taluk" TEXT,
    "district" TEXT,
    "districtCode" TEXT,
    "state" TEXT,
    "stateCode" TEXT,
    "country" TEXT DEFAULT 'India',
    "pinCode" TEXT,
    "address" TEXT,
    "gstin" TEXT,
    "panNo" TEXT,
    "companyPhone" TEXT,
    "companyEmail" TEXT,
    "companyWebsite" TEXT,
    "marketingPhone" TEXT,
    "marketingEmail" TEXT,
    "marketingWebsite" TEXT,
    "purchasePhone" TEXT,
    "purchaseEmail" TEXT,
    "purchaseWebsite" TEXT,
    "salesPhone" TEXT,
    "salesEmail" TEXT,
    "salesWebsite" TEXT,
    "servicePhone" TEXT,
    "serviceEmail" TEXT,
    "serviceWebsite" TEXT,
    "bankName" TEXT,
    "bankBranch" TEXT,
    "bankAccountType" TEXT,
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "bankIfscCode" TEXT,
    "bankMicrCode" TEXT,
    "bankDistrict" TEXT,
    "bankState" TEXT,
    "bankPinCode" TEXT,
    "bankCountry" TEXT,
    "bankAddress" TEXT,
    "logoPath" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_master_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "company_master_companyCode_key" ON "company_master"("companyCode");

-- contractor_master
CREATE TABLE IF NOT EXISTS "contractor_master" (
    "id" SERIAL NOT NULL,
    "contractCode" TEXT NOT NULL,
    "contractName" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contractor_master_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "contractor_master_contractCode_key" ON "contractor_master"("contractCode");

-- vehicle_service_master
CREATE TABLE IF NOT EXISTS "vehicle_service_master" (
    "id" SERIAL NOT NULL,
    "vehicleTypeId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "labourCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "materialCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_service_master_pkey" PRIMARY KEY ("id")
);

-- material_request
CREATE TABLE IF NOT EXISTS "material_request" (
    "id" SERIAL NOT NULL,
    "mrNo" TEXT NOT NULL,
    "financialYear" TEXT NOT NULL,
    "tempRequestNo" TEXT,
    "departmentTo" TEXT,
    "requestingUser" TEXT,
    "team" TEXT,
    "requestingFor" TEXT,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requiredDate" TIMESTAMP(3),
    "requiredDays" TEXT,
    "storeName" TEXT,
    "bomPartName" TEXT,
    "remarks" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_request_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "material_request_mrNo_key" ON "material_request"("mrNo");

-- material_request_detail
CREATE TABLE IF NOT EXISTS "material_request_detail" (
    "id" SERIAL NOT NULL,
    "mrId" INTEGER NOT NULL,
    "slNo" INTEGER NOT NULL,
    "modelName" TEXT,
    "itemCode" TEXT,
    "itemName" TEXT,
    "requestedQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "materialGrade" TEXT,
    "unit" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_request_detail_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'material_request_detail_mrId_fkey') THEN
    ALTER TABLE "material_request_detail" ADD CONSTRAINT "material_request_detail_mrId_fkey"
        FOREIGN KEY ("mrId") REFERENCES "material_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
