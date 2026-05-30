-- Add departmentId and teamId FK columns to purchase_request
ALTER TABLE "purchase_request" ADD COLUMN IF NOT EXISTS "departmentId" INTEGER;
ALTER TABLE "purchase_request" ADD COLUMN IF NOT EXISTS "teamId" INTEGER;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'purchase_request_departmentId_fkey') THEN
    ALTER TABLE "purchase_request" ADD CONSTRAINT "purchase_request_departmentId_fkey"
        FOREIGN KEY ("departmentId") REFERENCES "reference_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'purchase_request_teamId_fkey') THEN
    ALTER TABLE "purchase_request" ADD CONSTRAINT "purchase_request_teamId_fkey"
        FOREIGN KEY ("teamId") REFERENCES "reference_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
