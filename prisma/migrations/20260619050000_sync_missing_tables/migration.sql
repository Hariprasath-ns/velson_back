-- AlterTable
ALTER TABLE "UserCredential" ADD COLUMN     "failedAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lockoutUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "material_request" ADD COLUMN     "vehicleName" TEXT;

-- AlterTable
ALTER TABLE "service_booking" ADD COLUMN     "tempStatus" TEXT DEFAULT 'Open';

-- AlterTable
ALTER TABLE "service_detail" ALTER COLUMN "checkedAssemblies" SET DATA TYPE TEXT[];

-- CreateTable
CREATE TABLE "user_permission" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "module" TEXT NOT NULL,
    "canDisplay" BOOLEAN NOT NULL DEFAULT false,
    "canSave" BOOLEAN NOT NULL DEFAULT false,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "canPrint" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "canDisplay" BOOLEAN NOT NULL DEFAULT false,
    "canSave" BOOLEAN NOT NULL DEFAULT false,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "canPrint" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_token" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_spare" (
    "id" SERIAL NOT NULL,
    "serviceJobNo" TEXT NOT NULL,
    "bookingCustomerCode" TEXT,
    "customerName" TEXT,
    "customerCode" TEXT,
    "displayOrder" INTEGER DEFAULT 1,
    "displayDate" TEXT,
    "lastSavedAssName" TEXT,
    "servicePartNo" TEXT,
    "vehicleNo" TEXT,
    "serialNo" TEXT,
    "vehicleModelNo" TEXT,
    "modelSubType" TEXT,
    "vehicleName" TEXT,
    "status" TEXT DEFAULT 'Open',
    "selectedParts" INTEGER[],
    "totalAmount" DOUBLE PRECISION DEFAULT 0,
    "savedDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_spare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_permission_userId_module_key" ON "user_permission"("userId", "module");

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_role_module_key" ON "role_permission"("role", "module");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_token_key" ON "refresh_token"("token");

-- AddForeignKey
ALTER TABLE "user_permission" ADD CONSTRAINT "user_permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
