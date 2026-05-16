-- CreateTable
CREATE TABLE "category_master" (
    "id" SERIAL NOT NULL,
    "categoryName" TEXT NOT NULL,
    "categoryCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_category_master" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "subCategoryName" TEXT NOT NULL,
    "prefixCode" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_category_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "part_number_base" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "subCategoryId" INTEGER NOT NULL,
    "prefixCode" TEXT NOT NULL,
    "digitCount" INTEGER NOT NULL,
    "startingNumber" INTEGER NOT NULL,
    "endingNumber" INTEGER NOT NULL,
    "currentRunningNumber" INTEGER NOT NULL,
    "totalNumbers" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "part_number_base_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_master_categoryName_key" ON "category_master"("categoryName");

-- CreateIndex
CREATE UNIQUE INDEX "category_master_categoryCode_key" ON "category_master"("categoryCode");

-- CreateIndex
CREATE UNIQUE INDEX "sub_category_master_categoryId_subCategoryName_key" ON "sub_category_master"("categoryId", "subCategoryName");

-- AddForeignKey
ALTER TABLE "sub_category_master" ADD CONSTRAINT "sub_category_master_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_number_base" ADD CONSTRAINT "part_number_base_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_number_base" ADD CONSTRAINT "part_number_base_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "sub_category_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
