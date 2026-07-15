-- AlterTable
ALTER TABLE "index_creation_excel_data" ALTER COLUMN "excelData" SET DATA TYPE JSONB;

-- CreateTable
CREATE TABLE "db_token_blacklist" (
    "id" SERIAL NOT NULL,
    "jti" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "db_token_blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "db_token_blacklist_jti_key" ON "db_token_blacklist"("jti");

-- CreateIndex
CREATE INDEX "credit_sales_createdAt_idx" ON "credit_sales"("createdAt");

-- CreateIndex
CREATE INDEX "customer_complaint_createdAt_idx" ON "customer_complaint"("createdAt");

-- CreateIndex
CREATE INDEX "customer_complaint_status_idx" ON "customer_complaint"("status");

-- CreateIndex
CREATE INDEX "customer_master_createdAt_idx" ON "customer_master"("createdAt");

-- CreateIndex
CREATE INDEX "delivery_challan_createdAt_idx" ON "delivery_challan"("createdAt");

-- CreateIndex
CREATE INDEX "delivery_challan_customerId_idx" ON "delivery_challan"("customerId");

-- CreateIndex
CREATE INDEX "delivery_challan_supplierId_idx" ON "delivery_challan"("supplierId");

-- CreateIndex
CREATE INDEX "gate_master_createdAt_idx" ON "gate_master"("createdAt");

-- CreateIndex
CREATE INDEX "gate_master_status_idx" ON "gate_master"("status");

-- CreateIndex
CREATE INDEX "grn_detail_itemCode_stockQty_idx" ON "grn_detail"("itemCode", "stockQty");

-- CreateIndex
CREATE INDEX "grn_master_createdAt_idx" ON "grn_master"("createdAt");

-- CreateIndex
CREATE INDEX "grn_master_status_idx" ON "grn_master"("status");

-- CreateIndex
CREATE INDEX "item_master_partNo_barcodeType_idx" ON "item_master"("partNo", "barcodeType");

-- CreateIndex
CREATE INDEX "item_master_createdAt_idx" ON "item_master"("createdAt");

-- CreateIndex
CREATE INDEX "job_card_createdAt_idx" ON "job_card"("createdAt");

-- CreateIndex
CREATE INDEX "job_card_status_idx" ON "job_card"("status");

-- CreateIndex
CREATE INDEX "material_issue_header_createdAt_idx" ON "material_issue_header"("createdAt");

-- CreateIndex
CREATE INDEX "material_request_createdAt_idx" ON "material_request"("createdAt");

-- CreateIndex
CREATE INDEX "material_request_status_idx" ON "material_request"("status");

-- CreateIndex
CREATE INDEX "purchase_master_destination_paymentTerms_project_modeOfDesp_idx" ON "purchase_master"("destination", "paymentTerms", "project", "modeOfDespatch", "freight");

-- CreateIndex
CREATE INDEX "purchase_master_createdAt_idx" ON "purchase_master"("createdAt");

-- CreateIndex
CREATE INDEX "purchase_master_status_idx" ON "purchase_master"("status");

-- CreateIndex
CREATE INDEX "purchase_request_createdAt_idx" ON "purchase_request"("createdAt");

-- CreateIndex
CREATE INDEX "purchase_request_status_idx" ON "purchase_request"("status");

-- CreateIndex
CREATE INDEX "quotation_master_createdAt_idx" ON "quotation_master"("createdAt");

-- CreateIndex
CREATE INDEX "quotation_master_status_idx" ON "quotation_master"("status");

-- CreateIndex
CREATE INDEX "quotation_master_customerId_idx" ON "quotation_master"("customerId");

-- CreateIndex
CREATE INDEX "quotation_sales_createdAt_idx" ON "quotation_sales"("createdAt");

-- CreateIndex
CREATE INDEX "quotation_sales_status_idx" ON "quotation_sales"("status");

-- CreateIndex
CREATE INDEX "quotation_sales_customerId_idx" ON "quotation_sales"("customerId");

-- CreateIndex
CREATE INDEX "service_bill_createdAt_idx" ON "service_bill"("createdAt");

-- CreateIndex
CREATE INDEX "service_bill_status_idx" ON "service_bill"("status");

-- CreateIndex
CREATE INDEX "supplier_master_createdAt_idx" ON "supplier_master"("createdAt");
