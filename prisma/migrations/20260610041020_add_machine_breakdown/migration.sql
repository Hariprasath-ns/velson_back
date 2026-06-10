-- CreateTable
CREATE TABLE "machine_breakdown" (
    "id" SERIAL NOT NULL,
    "mwrNo" TEXT NOT NULL,
    "machineName" TEXT NOT NULL,
    "jobCardNo" TEXT,
    "partNo" TEXT NOT NULL,
    "processStage" TEXT,
    "location" TEXT,
    "date" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "priority" TEXT,
    "problemDescription" TEXT,
    "status" TEXT NOT NULL DEFAULT 'waiting_clearance',
    "actionTaken" TEXT,
    "remark" TEXT,
    "solvedBy" TEXT,
    "solvedDate" TEXT,
    "createdBy" TEXT DEFAULT 'Admin',
    "updatedBy" TEXT DEFAULT 'Admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machine_breakdown_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "machine_breakdown_mwrNo_key" ON "machine_breakdown"("mwrNo");
