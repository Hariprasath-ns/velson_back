import { PrismaClient } from "./src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const dbEnv = process.env.DB_ENV || "docker";
const connString =
  dbEnv === "neon"
    ? process.env.NEON_DATABASE_URL
    : process.env.DOCKER_DATABASE_URL;

const prisma = new PrismaClient({
  adapter: new PrismaPg(new pg.Pool({ connectionString: connString })),
});

const REF_TYPE_NAMES = [
  "Account Type",
  "App_User",
  "Area",
  "Booking_Status",
  "Booking_Vehicle_Name",
  "Breakdown_Email",
  "Conformation_Part_Description",
  "Conformation_Type",
  "Currency",
  "DC_Type",
  "Department",
  "Designation",
  "Discount Type",
  "Form",
  "Freight",
  "GRN_Inward_Type",
  "Inward_Type",
  "Item Category",
  "Item Expiry",
  "Item Group",
  "Item Lock",
  "Item Type",
  "JOB_Email",
  "Ledger Type",
  "Line",
  "Machine Category",
  "Material_Grade",
  "Material_Req_For",
  "Material_Type",
  "OUTSOURCE_STATUS_TYPE",
  "OUTSOURCE_TYPE",
  "PAYMODE",
  "PO Status",
  "PO Type",
  "Print_Copy",
  "Priority",
  "Process_Type",
  "QC_Inspection_Type",
  "QC_STATUS",
  "QC_Type",
  "Quotation Type",
  "Quotation_confirmed_Status",
  "Spare_Issue_Type",
  "State",
  "Status",
  "Store",
  "Sub Group",
  "Tax Type",
  "Team",
  "Terms",
  "UOM",
  "User Role",
  "Vehicle_Sub_Type",
  "Vehicle_Type",
  "Warranty_Type",
  "Supplier_Type",
  "Customer_Type",
];

async function main() {
  console.log(`[seed] Connecting to ${dbEnv} database...`);

  // Find the highest existing code to continue the sequence
  const existing = await prisma.referenceType.findMany({
    select: { code: true, name: true },
  });

  const existingNames = new Set(existing.map((r) => r.name));
  const existingCodes = existing
    .map((r) => parseInt(r.code, 10))
    .filter((n) => !isNaN(n));
  let nextNum = existingCodes.length > 0 ? Math.max(...existingCodes) + 1 : 1;

  const toInsert = [];
  for (const name of REF_TYPE_NAMES) {
    if (!existingNames.has(name)) {
      toInsert.push({ code: String(nextNum).padStart(3, "0"), name });
      nextNum++;
    }
  }

  if (toInsert.length === 0) {
    console.log("[seed] All reference types already exist — nothing to insert.");
    return;
  }

  const result = await prisma.referenceType.createMany({
    data: toInsert,
    skipDuplicates: true,
  });

  console.log(`[seed] Inserted ${result.count} reference type(s).`);
  toInsert.forEach((r) => console.log(`  [${r.code}] ${r.name}`));
}

main()
  .catch((err) => {
    console.error("[seed] Error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
