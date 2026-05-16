-- CreateTable
CREATE TABLE "item_group_master" (
    "id" SERIAL NOT NULL,
    "groupName" TEXT NOT NULL,
    "store" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_group_master_pkey" PRIMARY KEY ("id")
);
