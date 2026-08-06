-- CreateTable
CREATE TABLE "index_creation" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "indexNo" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "modelNo" TEXT NOT NULL,
    "fileLocation" TEXT,
    "fileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imagePath" TEXT,
    "imageData" BYTEA,
    "imageMimeType" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "index_creation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "index_creation_excel_data" (
    "id" SERIAL NOT NULL,
    "indexCreationId" INTEGER NOT NULL,
    "excelData" JSON NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "index_creation_excel_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "index_creation_upload" (
    "id" SERIAL NOT NULL,
    "indexCreationId" INTEGER NOT NULL,
    "imagePath" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageData" BYTEA,
    "imageMimeType" TEXT,

    CONSTRAINT "index_creation_upload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "index_creation_indexNo_key" ON "index_creation"("indexNo");

-- CreateIndex
CREATE UNIQUE INDEX "index_creation_excel_data_indexCreationId_key" ON "index_creation_excel_data"("indexCreationId");

-- AddForeignKey
ALTER TABLE "index_creation_excel_data" ADD CONSTRAINT "index_creation_excel_data_indexCreationId_fkey" FOREIGN KEY ("indexCreationId") REFERENCES "index_creation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "index_creation_upload" ADD CONSTRAINT "index_creation_upload_indexCreationId_fkey" FOREIGN KEY ("indexCreationId") REFERENCES "index_creation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
