-- CreateTable
CREATE TABLE "prefix" (
    "id" SERIAL NOT NULL,
    "prefixCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prefix_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prefix_prefixCode_key" ON "prefix"("prefixCode");
