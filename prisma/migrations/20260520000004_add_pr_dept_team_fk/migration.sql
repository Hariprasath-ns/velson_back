-- Add departmentId and teamId FK columns to purchase_request
ALTER TABLE "purchase_request" ADD COLUMN "departmentId" INTEGER;
ALTER TABLE "purchase_request" ADD COLUMN "teamId" INTEGER;

-- AddForeignKey: department -> reference_master
ALTER TABLE "purchase_request" ADD CONSTRAINT "purchase_request_departmentId_fkey"
    FOREIGN KEY ("departmentId") REFERENCES "reference_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: team -> reference_master
ALTER TABLE "purchase_request" ADD CONSTRAINT "purchase_request_teamId_fkey"
    FOREIGN KEY ("teamId") REFERENCES "reference_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;
