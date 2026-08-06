-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCredential" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reference_type" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reference_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reference_master" (
    "id" SERIAL NOT NULL,
    "referenceType" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "referenceTypeId" INTEGER,

    CONSTRAINT "reference_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_ledger_account" (
    "id" SERIAL NOT NULL,
    "ledgerName" TEXT NOT NULL,
    "taxPercent" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_ledger_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_group_master" (
    "id" SERIAL NOT NULL,
    "groupName" TEXT NOT NULL,
    "store" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_group_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prefix" (
    "id" SERIAL NOT NULL,
    "prefixCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prefix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_master" (
    "id" SERIAL NOT NULL,
    "taxLedgerId" INTEGER NOT NULL,
    "taxPercent" DOUBLE PRECISION NOT NULL,
    "cgstTax" DOUBLE PRECISION NOT NULL,
    "sgstTax" DOUBLE PRECISION NOT NULL,
    "igstTax" DOUBLE PRECISION NOT NULL,
    "purchaseCgstTax" DOUBLE PRECISION NOT NULL,
    "purchaseSgstTax" DOUBLE PRECISION NOT NULL,
    "purchaseIgstTax" DOUBLE PRECISION NOT NULL,
    "salesCgstTax" DOUBLE PRECISION NOT NULL,
    "salesSgstTax" DOUBLE PRECISION NOT NULL,
    "salesIgstTax" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_master" (
    "id" SERIAL NOT NULL,
    "categoryName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_category_master" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "subCategoryName" TEXT NOT NULL,
    "prefixCode" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_category_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "part_number_base" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "subCategoryId" INTEGER NOT NULL,
    "prefixCode" TEXT NOT NULL,
    "digitCount" INTEGER NOT NULL,
    "startingNumber" INTEGER NOT NULL,
    "endingNumber" INTEGER NOT NULL,
    "currentRunningNumber" INTEGER NOT NULL,
    "totalNumbers" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "part_number_base_pkey" PRIMARY KEY ("id")
);

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
    "routeCardNo" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imagePath" TEXT,
    "pdfPath" TEXT,
    "imageData" BYTEA,
    "imageMimeType" TEXT,
    "pdfData" BYTEA,
    "pdfMimeType" TEXT,

    CONSTRAINT "item_master_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "item_master_upload" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "imagePath" TEXT,
    "pdfPath" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageData" BYTEA,
    "imageMimeType" TEXT,
    "pdfData" BYTEA,
    "pdfMimeType" TEXT,

    CONSTRAINT "item_master_upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_master" (
    "id" SERIAL NOT NULL,
    "customerType" TEXT NOT NULL,
    "cCode" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
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
    "aadharNo" TEXT,
    "gstNo" TEXT,
    "panNo" TEXT,
    "bankName" TEXT,
    "branchName" TEXT,
    "accountName" TEXT,
    "accountNumber" TEXT,
    "ifscCode" TEXT,
    "micrCode" TEXT,
    "remarks" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageData" BYTEA,
    "imageMimeType" TEXT,
    "imagePath" TEXT,
    "pdfData" BYTEA,
    "pdfMimeType" TEXT,
    "pdfPath" TEXT,

    CONSTRAINT "customer_master_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "quotation_master" (
    "id" SERIAL NOT NULL,
    "quotationNo" TEXT NOT NULL,
    "financialYear" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "customerRef" TEXT,
    "currencyCode" TEXT DEFAULT 'INR',
    "exchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "modelRef" TEXT,
    "taxType" TEXT,
    "quotationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "revisionNo" INTEGER NOT NULL DEFAULT 0,
    "quotationType" TEXT,
    "discountType" TEXT NOT NULL DEFAULT 'Dis_Per',
    "showTotalsGrid" BOOLEAN NOT NULL DEFAULT false,
    "specialDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "freightAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxPercent" DOUBLE PRECISION NOT NULL DEFAULT 18,
    "packingForwarding" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentTerms" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "documentPath" TEXT,
    "documentData" BYTEA,
    "documentMimeType" TEXT,

    CONSTRAINT "quotation_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_detail" (
    "id" SERIAL NOT NULL,
    "quotationId" INTEGER NOT NULL,
    "itemId" INTEGER,
    "partNo" TEXT,
    "itemName" TEXT,
    "description" TEXT,
    "hsnCode" TEXT,
    "uom" TEXT,
    "qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slNo" INTEGER NOT NULL,

    CONSTRAINT "quotation_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_request" (
    "id" SERIAL NOT NULL,
    "prNo" TEXT NOT NULL,
    "financialYear" TEXT NOT NULL,
    "prDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requiredDate" TIMESTAMP(3),
    "department" TEXT,
    "requestingUser" TEXT,
    "team" TEXT,
    "requestingFor" TEXT,
    "remarks" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "poNo" TEXT,
    "poDate" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "departmentId" INTEGER,
    "teamId" INTEGER,
    "requestingForId" INTEGER,

    CONSTRAINT "purchase_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_request_detail" (
    "id" SERIAL NOT NULL,
    "prId" INTEGER NOT NULL,
    "slNo" INTEGER NOT NULL,
    "itemId" INTEGER,
    "itemCode" TEXT,
    "itemName" TEXT,
    "specification" TEXT,
    "jobNo" TEXT,
    "machineNo" TEXT,
    "uom" TEXT,
    "qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "eta" TIMESTAMP(3),
    "purpose" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_request_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_master" (
    "id" SERIAL NOT NULL,
    "poNo" TEXT NOT NULL,
    "financialYear" TEXT NOT NULL,
    "poDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "etaDate" TIMESTAMP(3),
    "poType" TEXT NOT NULL DEFAULT 'Purchase Order',
    "contactPerson" TEXT,
    "contactNumber" TEXT,
    "supplierAddress" TEXT,
    "gstNo" TEXT,
    "supplierRefNo" TEXT,
    "discountType" TEXT NOT NULL DEFAULT 'Dis_Per',
    "freight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "destination" TEXT,
    "paymentTerms" TEXT,
    "testReport" TEXT,
    "project" TEXT,
    "modeOfDespatch" TEXT,
    "deliveryPeriod" TEXT,
    "taxTerms" TEXT,
    "warrantyTerms" TEXT,
    "discountTerms" TEXT,
    "remarks" TEXT,
    "subTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cgstPer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cgstAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sgstPer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sgstAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "igstPer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "igstAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "othersPer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "othersAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_detail" (
    "id" SERIAL NOT NULL,
    "poId" INTEGER NOT NULL,
    "slNo" INTEGER NOT NULL,
    "itemId" INTEGER,
    "purchaseReqNo" TEXT,
    "supplierPartNo" TEXT,
    "itemCode" TEXT,
    "itemName" TEXT,
    "description" TEXT,
    "hsnCode" TEXT,
    "uom" TEXT,
    "qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discPer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gstPer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gstAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gate_master" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gate_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_master" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_master" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "logoData" BYTEA,
    "logoMimeType" TEXT,

    CONSTRAINT "company_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gate_detail" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gate_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractor_master" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractor_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grn_master" (
    "id" SERIAL NOT NULL,
    "grnNo" TEXT NOT NULL,
    "financialYear" TEXT NOT NULL DEFAULT '',
    "grnDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grnType" TEXT,
    "gateEntryNo" TEXT,
    "supplierName" TEXT,
    "contactPerson" TEXT,
    "contactNo" TEXT,
    "purchaseLedger" TEXT,
    "purchaseType" TEXT,
    "currency" TEXT,
    "currencyType" TEXT,
    "poNo" TEXT,
    "poDate" TIMESTAMP(3),
    "taxType" TEXT,
    "exchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "invoiceNo" TEXT,
    "invoiceDate" TIMESTAMP(3),
    "qcType" TEXT,
    "discountType" TEXT NOT NULL DEFAULT 'Dis_Per',
    "remarks" TEXT,
    "currencyTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roundOff" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "freightLedger" TEXT,
    "tcsLedger" TEXT,
    "subTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grn_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grn_detail" (
    "id" SERIAL NOT NULL,
    "grnId" INTEGER NOT NULL,
    "slNo" INTEGER NOT NULL,
    "itemCode" TEXT,
    "itemName" TEXT,
    "supplierPartNo" TEXT,
    "description" TEXT,
    "hsnCode" TEXT,
    "unit" TEXT,
    "stockQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "orderQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discPer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxPer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grn_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_master" (
    "id" SERIAL NOT NULL,
    "machineCode" TEXT NOT NULL,
    "machineName" TEXT NOT NULL,
    "serialNo" TEXT,
    "machineCategoryId" TEXT,
    "workHoursPerDay" TEXT,
    "model" TEXT,
    "country" TEXT,
    "currency" TEXT,
    "vendorId" TEXT,
    "installationPlace" TEXT,
    "remarks" TEXT,
    "manufacture" TEXT,
    "price" DOUBLE PRECISION,
    "yearOfFG" TIMESTAMP(3),
    "dateOfPurchase" TIMESTAMP(3),
    "dateOfInstallation" TIMESTAMP(3),
    "warantyExpDate" TIMESTAMP(3),
    "amcExpDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machine_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_service_master" (
    "id" SERIAL NOT NULL,
    "vehicleTypeId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "labourCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "materialCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_service_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_request" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_request_detail" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_request_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qc_check_method" (
    "id" SERIAL NOT NULL,
    "checkCode" TEXT NOT NULL,
    "checkName" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'A',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qc_check_method_pkey" PRIMARY KEY ("id")
);

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
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "approvedDate" TIMESTAMP(3),
    "approvedBy" TEXT,
    "rejectedDate" TIMESTAMP(3),
    "cancelledDate" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "workingStartDate" TIMESTAMP(3),
    "workingEndDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "selfStockIn" BOOLEAN DEFAULT false,
    "selectedCustomers" JSONB,

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
    "processName" TEXT,
    "processDate" TIMESTAMP(3),
    "state" TEXT,
    "empName" TEXT,
    "machineName" TEXT,
    "workCenterNo" TEXT,
    "remarks" TEXT,
    "notApplicable" BOOLEAN NOT NULL DEFAULT false,
    "workingStartDate" TIMESTAMP(3),
    "workingEndDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_card_line_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_master" (
    "id" SERIAL NOT NULL,
    "pm_part_name" TEXT NOT NULL,
    "pm_process_name" TEXT NOT NULL,
    "pm_process_name1" TEXT,
    "pm_process_order" TEXT NOT NULL,
    "team_id" TEXT,
    "machine_code" TEXT,
    "machine_name" TEXT,
    "pm_days" TEXT,
    "pm_hours" TEXT,
    "minutes" TEXT,
    "setting_time" TEXT,
    "cycle_time" TEXT,
    "handling_time" TEXT,
    "idle_time" TEXT,
    "created_by" TEXT DEFAULT 'Admin',
    "updated_by" TEXT DEFAULT 'Admin',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "process_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_log" (
    "id" SERIAL NOT NULL,
    "ledger_name" TEXT NOT NULL,
    "customer_code" TEXT NOT NULL,
    "log_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "document_path" TEXT,
    "document_data" BYTEA,
    "document_mime_type" TEXT,
    "remarks" TEXT,
    "created_by" TEXT DEFAULT 'ADMIN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_complaint" (
    "id" SERIAL NOT NULL,
    "ccNo" TEXT NOT NULL,
    "recDate" TEXT,
    "customerName" TEXT NOT NULL,
    "customerCode" TEXT,
    "complainantName" TEXT,
    "modelNo" TEXT,
    "siteAddress" TEXT,
    "whatsappLocation" TEXT,
    "openingComplaint" TEXT,
    "serialNo" TEXT,
    "designation" TEXT,
    "mobileNo" TEXT,
    "alternateNo" TEXT,
    "emailId" TEXT,
    "complaintType" TEXT,
    "serviceType" TEXT,
    "workCompleteDate" TEXT,
    "complaintClosedDate" TEXT,
    "natureOfComplaint" TEXT,
    "actionThrough" TEXT,
    "attenderName" TEXT,
    "attenDate" TEXT,
    "finalDate" TEXT,
    "actionTaken" TEXT,
    "preventiveMeasure" TEXT,
    "feedbackSatisfaction" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "vehicleCount" TEXT,
    "createdBy" TEXT DEFAULT 'Admin',
    "updatedBy" TEXT DEFAULT 'Admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_complaint_image" (
    "id" SERIAL NOT NULL,
    "complaintId" INTEGER NOT NULL,
    "name" TEXT,
    "imageData" BYTEA,
    "imageMimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_complaint_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_process_menu" (
    "id" SERIAL NOT NULL,
    "job_card_id" INTEGER NOT NULL,
    "part_no" TEXT NOT NULL,
    "part_name" TEXT NOT NULL,
    "process_name" TEXT NOT NULL,
    "process_order" TEXT NOT NULL,
    "team_id" TEXT,
    "machine_code" TEXT,
    "machine_name" TEXT,
    "pm_days" TEXT,
    "pm_hours" TEXT,
    "minutes" TEXT,
    "setting_time" TEXT,
    "cycle_time" TEXT,
    "handling_time" TEXT,
    "idle_time" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "created_by" TEXT DEFAULT 'System',
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_process_menu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserCredential_userId_key" ON "UserCredential"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCredential_username_key" ON "UserCredential"("username");

-- CreateIndex
CREATE UNIQUE INDEX "reference_type_code_key" ON "reference_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "reference_type_name_key" ON "reference_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tax_ledger_account_ledgerName_key" ON "tax_ledger_account"("ledgerName");

-- CreateIndex
CREATE UNIQUE INDEX "prefix_prefixCode_key" ON "prefix"("prefixCode");

-- CreateIndex
CREATE UNIQUE INDEX "category_master_categoryName_key" ON "category_master"("categoryName");

-- CreateIndex
CREATE UNIQUE INDEX "sub_category_master_categoryId_subCategoryName_key" ON "sub_category_master"("categoryId", "subCategoryName");

-- CreateIndex
CREATE UNIQUE INDEX "item_master_partNo_key" ON "item_master"("partNo");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_master_sCode_key" ON "supplier_master"("sCode");

-- CreateIndex
CREATE UNIQUE INDEX "customer_master_cCode_key" ON "customer_master"("cCode");

-- CreateIndex
CREATE UNIQUE INDEX "quotation_master_quotationNo_key" ON "quotation_master"("quotationNo");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_request_prNo_key" ON "purchase_request"("prNo");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_master_poNo_key" ON "purchase_master"("poNo");

-- CreateIndex
CREATE UNIQUE INDEX "gate_master_gateEntryNo_key" ON "gate_master"("gateEntryNo");

-- CreateIndex
CREATE UNIQUE INDEX "employee_master_empCode_key" ON "employee_master"("empCode");

-- CreateIndex
CREATE UNIQUE INDEX "company_master_companyCode_key" ON "company_master"("companyCode");

-- CreateIndex
CREATE UNIQUE INDEX "contractor_master_contractCode_key" ON "contractor_master"("contractCode");

-- CreateIndex
CREATE UNIQUE INDEX "grn_master_grnNo_key" ON "grn_master"("grnNo");

-- CreateIndex
CREATE UNIQUE INDEX "machine_master_machineCode_key" ON "machine_master"("machineCode");

-- CreateIndex
CREATE UNIQUE INDEX "material_request_mrNo_key" ON "material_request"("mrNo");

-- CreateIndex
CREATE UNIQUE INDEX "qc_check_method_checkCode_key" ON "qc_check_method"("checkCode");

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

-- CreateIndex
CREATE UNIQUE INDEX "customer_complaint_ccNo_key" ON "customer_complaint"("ccNo");

-- CreateIndex
CREATE INDEX "job_process_menu_job_card_id_part_no_is_active_idx" ON "job_process_menu"("job_card_id", "part_no", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "job_process_menu_job_card_id_part_no_process_name_process_o_key" ON "job_process_menu"("job_card_id", "part_no", "process_name", "process_order");

-- AddForeignKey
ALTER TABLE "UserCredential" ADD CONSTRAINT "UserCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reference_master" ADD CONSTRAINT "reference_master_referenceTypeId_fkey" FOREIGN KEY ("referenceTypeId") REFERENCES "reference_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_master" ADD CONSTRAINT "tax_master_taxLedgerId_fkey" FOREIGN KEY ("taxLedgerId") REFERENCES "tax_ledger_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_category_master" ADD CONSTRAINT "sub_category_master_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_number_base" ADD CONSTRAINT "part_number_base_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_number_base" ADD CONSTRAINT "part_number_base_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "sub_category_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_master_upload" ADD CONSTRAINT "item_master_upload_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_master" ADD CONSTRAINT "vehicle_master_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_master" ADD CONSTRAINT "quotation_master_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_detail" ADD CONSTRAINT "quotation_detail_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_detail" ADD CONSTRAINT "quotation_detail_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotation_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_request" ADD CONSTRAINT "purchase_request_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "reference_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_request" ADD CONSTRAINT "purchase_request_requestingForId_fkey" FOREIGN KEY ("requestingForId") REFERENCES "reference_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_request" ADD CONSTRAINT "purchase_request_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "reference_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_request_detail" ADD CONSTRAINT "purchase_request_detail_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_request_detail" ADD CONSTRAINT "purchase_request_detail_prId_fkey" FOREIGN KEY ("prId") REFERENCES "purchase_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_master" ADD CONSTRAINT "purchase_master_supplierRefNo_fkey" FOREIGN KEY ("supplierRefNo") REFERENCES "supplier_master"("sCode") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_detail" ADD CONSTRAINT "purchase_detail_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_detail" ADD CONSTRAINT "purchase_detail_poId_fkey" FOREIGN KEY ("poId") REFERENCES "purchase_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_detail" ADD CONSTRAINT "gate_detail_gateId_fkey" FOREIGN KEY ("gateId") REFERENCES "gate_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grn_detail" ADD CONSTRAINT "grn_detail_grnId_fkey" FOREIGN KEY ("grnId") REFERENCES "grn_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_request_detail" ADD CONSTRAINT "material_request_detail_mrId_fkey" FOREIGN KEY ("mrId") REFERENCES "material_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_card_line_item" ADD CONSTRAINT "job_card_line_item_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "job_card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_complaint_image" ADD CONSTRAINT "customer_complaint_image_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "customer_complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_process_menu" ADD CONSTRAINT "job_process_menu_job_card_id_fkey" FOREIGN KEY ("job_card_id") REFERENCES "job_card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
