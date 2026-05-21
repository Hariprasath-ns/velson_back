-- Add requestingForId FK column to purchase_request
ALTER TABLE "purchase_request" ADD COLUMN "requestingForId" INTEGER;

-- AddForeignKey: requestingFor -> reference_master
ALTER TABLE "purchase_request" ADD CONSTRAINT "purchase_request_requestingForId_fkey"
    FOREIGN KEY ("requestingForId") REFERENCES "reference_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;
