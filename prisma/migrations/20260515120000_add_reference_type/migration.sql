-- CreateTable
CREATE TABLE "reference_type" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reference_type_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reference_type_code_key" ON "reference_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "reference_type_name_key" ON "reference_type"("name");

-- AddColumn
ALTER TABLE "reference_master" ADD COLUMN "referenceTypeId" INTEGER;

-- AddForeignKey
ALTER TABLE "reference_master" ADD CONSTRAINT "reference_master_referenceTypeId_fkey"
    FOREIGN KEY ("referenceTypeId") REFERENCES "reference_type"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
