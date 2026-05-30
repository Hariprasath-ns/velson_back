-- CreateTable: purchase_master
CREATE TABLE IF NOT EXISTS "purchase_master" (
    "id"              SERIAL           NOT NULL,
    "poNo"            TEXT             NOT NULL,
    "financialYear"   TEXT             NOT NULL,
    "poDate"          TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "etaDate"         TIMESTAMP(3),
    "poType"          TEXT             NOT NULL DEFAULT 'Purchase Order',
    "supplierId"      INTEGER,
    "contactPerson"   TEXT,
    "contactNumber"   TEXT,
    "supplierAddress" TEXT,
    "gstNo"           TEXT,
    "supplierRefNo"   TEXT,
    "discountType"    TEXT             NOT NULL DEFAULT 'Dis_Per',
    "freight"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "destination"     TEXT,
    "paymentTerms"    TEXT,
    "testReport"      TEXT,
    "project"         TEXT,
    "modeOfDespatch"  TEXT,
    "deliveryPeriod"  TEXT,
    "taxTerms"        TEXT,
    "warrantyTerms"   TEXT,
    "discountTerms"   TEXT,
    "remarks"         TEXT,
    "subTotal"        DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cgstPer"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cgstAmt"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sgstPer"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sgstAmt"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "igstPer"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "igstAmt"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "othersPer"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "othersAmt"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount"     DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status"          TEXT             NOT NULL DEFAULT 'Draft',
    "createdBy"       TEXT,
    "updatedBy"       TEXT,
    "createdAt"       TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable: purchase_detail
CREATE TABLE IF NOT EXISTS "purchase_detail" (
    "id"             SERIAL           NOT NULL,
    "poId"           INTEGER          NOT NULL,
    "slNo"           INTEGER          NOT NULL,
    "itemId"         INTEGER,
    "purchaseReqNo"  TEXT,
    "supplierPartNo" TEXT,
    "itemCode"       TEXT,
    "itemName"       TEXT,
    "description"    TEXT,
    "hsnCode"        TEXT,
    "uom"            TEXT,
    "qty"            DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitPrice"      DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discPer"        DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discAmt"        DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gstPer"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gstAmt"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netAmt"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt"      TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_detail_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "purchase_master_poNo_key" ON "purchase_master"("poNo");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'purchase_master_supplierId_fkey') THEN
    ALTER TABLE "purchase_master" ADD CONSTRAINT "purchase_master_supplierId_fkey"
        FOREIGN KEY ("supplierId") REFERENCES "supplier_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'purchase_detail_poId_fkey') THEN
    ALTER TABLE "purchase_detail" ADD CONSTRAINT "purchase_detail_poId_fkey"
        FOREIGN KEY ("poId") REFERENCES "purchase_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'purchase_detail_itemId_fkey') THEN
    ALTER TABLE "purchase_detail" ADD CONSTRAINT "purchase_detail_itemId_fkey"
        FOREIGN KEY ("itemId") REFERENCES "item_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
