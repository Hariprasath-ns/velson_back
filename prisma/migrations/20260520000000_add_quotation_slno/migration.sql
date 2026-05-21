-- Add slNo column to existing quotation_detail rows with default 0
ALTER TABLE "quotation_detail" ADD COLUMN IF NOT EXISTS "slNo" INTEGER NOT NULL DEFAULT 0;
