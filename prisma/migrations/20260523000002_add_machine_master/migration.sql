CREATE TABLE IF NOT EXISTS "machine_master" (
    "id"                 SERIAL PRIMARY KEY,
    "machineCode"        TEXT NOT NULL,
    "machineName"        TEXT NOT NULL,
    "serialNo"           TEXT,
    "machineCategoryId"  TEXT,
    "workHoursPerDay"    TEXT,
    "model"              TEXT,
    "country"            TEXT,
    "currency"           TEXT,
    "vendorId"           TEXT,
    "installationPlace"  TEXT,
    "remarks"            TEXT,
    "yearOfFG"           TIMESTAMP(3),
    "dateOfPurchase"     TIMESTAMP(3),
    "dateOfInstallation" TIMESTAMP(3),
    "warantyExpDate"     TIMESTAMP(3),
    "amcExpDate"         TIMESTAMP(3),
    "status"             TEXT NOT NULL DEFAULT 'Active',
    "createdBy"          TEXT,
    "updatedBy"          TEXT,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "machine_master_machineCode_key" ON "machine_master"("machineCode");
