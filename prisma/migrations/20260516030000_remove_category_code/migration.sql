-- AlterTable: remove categoryCode column from category_master
ALTER TABLE "category_master" DROP COLUMN IF EXISTS "categoryCode";
