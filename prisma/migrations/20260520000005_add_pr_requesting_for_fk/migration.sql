-- Add requestingForId FK column to purchase_request
ALTER TABLE "purchase_request" ADD COLUMN IF NOT EXISTS "requestingForId" INTEGER;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'purchase_request_requestingForId_fkey') THEN
    ALTER TABLE "purchase_request" ADD CONSTRAINT "purchase_request_requestingForId_fkey"
        FOREIGN KEY ("requestingForId") REFERENCES "reference_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
