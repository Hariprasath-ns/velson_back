-- CreateTable: grn_master
CREATE TABLE "grn_master" (
    "id"             SERIAL           NOT NULL,
    "grnNo"          TEXT             NOT NULL,
    "financialYear"  TEXT             NOT NULL DEFAULT '',
    "grnDate"        TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grnType"        TEXT,
    "gateEntryNo"    TEXT,
    "supplierName"   TEXT,
    "contactPerson"  TEXT,
    "contactNo"      TEXT,
    "purchaseLedger" TEXT,
    "purchaseType"   TEXT,
    "currency"       TEXT,
    "currencyType"   TEXT,
    "poNo"           TEXT,
    "poDate"         TIMESTAMP(3),
    "taxType"        TEXT,
    "exchangeRate"   DOUBLE PRECISION NOT NULL DEFAULT 0,
    "invoiceNo"      TEXT,
    "invoiceDate"    TIMESTAMP(3),
    "qcType"         TEXT,
    "discountType"   TEXT             NOT NULL DEFAULT 'Dis_Per',
    "remarks"        TEXT,
    "currencyTotal"  DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roundOff"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "freightLedger"  TEXT,
    "tcsLedger"      TEXT,
    "subTotal"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount"    DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status"         TEXT             NOT NULL DEFAULT 'Open',
    "createdBy"      TEXT,
    "updatedBy"      TEXT,
    "createdAt"      TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3)     NOT NULL,

    CONSTRAINT "grn_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable: grn_detail
CREATE TABLE "grn_detail" (
    "id"             SERIAL           NOT NULL,
    "grnId"          INTEGER          NOT NULL,
    "slNo"           INTEGER          NOT NULL,
    "itemCode"       TEXT,
    "itemName"       TEXT,
    "supplierPartNo" TEXT,
    "description"    TEXT,
    "hsnCode"        TEXT,
    "unit"           TEXT,
    "stockQty"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "orderQty"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "qty"            DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitPrice"      DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total"          DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discPer"        DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discAmt"        DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalPrice"     DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxPer"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netAmt"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt"      TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3)     NOT NULL,

    CONSTRAINT "grn_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "grn_master_grnNo_key" ON "grn_master"("grnNo");

-- AddForeignKey
ALTER TABLE "grn_detail" ADD CONSTRAINT "grn_detail_grnId_fkey"
    FOREIGN KEY ("grnId") REFERENCES "grn_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;
