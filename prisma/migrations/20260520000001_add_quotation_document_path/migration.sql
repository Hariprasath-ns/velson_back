-- Add missing documentPath column to quotation_master
ALTER TABLE "quotation_master" ADD COLUMN IF NOT EXISTS "documentPath" TEXT;
