-- CreateTable: purchase_request
CREATE TABLE IF NOT EXISTS "purchase_request" (
    "id"             SERIAL       NOT NULL,
    "prNo"           TEXT         NOT NULL,
    "financialYear"  TEXT         NOT NULL,
    "prDate"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requiredDate"   TIMESTAMP(3),
    "department"     TEXT,
    "requestingUser" TEXT,
    "team"           TEXT,
    "requestingFor"  TEXT,
    "remarks"        TEXT,
    "status"         TEXT         NOT NULL DEFAULT 'Draft',
    "poNo"           TEXT,
    "poDate"         TIMESTAMP(3),
    "createdBy"      TEXT,
    "updatedBy"      TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable: purchase_request_detail
CREATE TABLE IF NOT EXISTS "purchase_request_detail" (
    "id"            SERIAL       NOT NULL,
    "prId"          INTEGER      NOT NULL,
    "slNo"          INTEGER      NOT NULL,
    "itemId"        INTEGER,
    "itemCode"      TEXT,
    "itemName"      TEXT,
    "specification" TEXT,
    "jobNo"         TEXT,
    "machineNo"     TEXT,
    "uom"           TEXT,
    "qty"           DOUBLE PRECISION NOT NULL DEFAULT 0,
    "eta"           TIMESTAMP(3),
    "purpose"       TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_request_detail_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "purchase_request_prNo_key" ON "purchase_request"("prNo");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'purchase_request_detail_prId_fkey') THEN
    ALTER TABLE "purchase_request_detail" ADD CONSTRAINT "purchase_request_detail_prId_fkey"
        FOREIGN KEY ("prId") REFERENCES "purchase_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'purchase_request_detail_itemId_fkey') THEN
    ALTER TABLE "purchase_request_detail" ADD CONSTRAINT "purchase_request_detail_itemId_fkey"
        FOREIGN KEY ("itemId") REFERENCES "item_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
