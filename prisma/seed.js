// prisma/seed.js  — called by `npx prisma db seed` (see package.json "prisma.seed")
// Delegates to the root-level seed scripts that follow the project's ESM + db pattern.

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const scripts = [
  'seedTaxMaster.js',
  'seedNotifications.js',
  'seedCustomerMaster.js',      // 5. Seed Customer_Type entries + customer records
  // 'seedPurchaseRequest.js',     // 7. Seed PurchaseRequest + details (main + mock)
  // 'seedPurchaseMaster.js',      // 8. Seed PurchaseMaster (PO) + details (main + mock)
  'seedAuthUsers.js',             // 0. Seed User + Role + Permission entries (for auth + testing)
  'seedSupplierType.js',      // 0. Seed Supplier_Type entries (for categorizing suppliers)
  // 'seedSupplierMaster.js',      // 4. Seed Supplier_Type entries + supplier records
  'seedQuotation.js',        // 0. Seed QuoteMaster + details (main + mock)
  'seedItemGroupMaster.js',     // 0. Seed ItemGroupMaster (for grouping items in UI)
  'seedPrefix.js',             // 0. Seed ReferencePrefix entries (for generating codes like PR-0001)
  'seedreferencetypename.js',   // 1. Ensure all ReferenceType rows exist
  'seedReferenceMaster.js',     // 2. Seed all ReferenceMaster rows (Department, Team, UOM, etc.)
  'seedPartNumberBase.js',      // 3. Seed CategoryMaster, SubCategoryMaster, PartNumberBase
];

for (const script of scripts) {
  const full = path.join(root, script);
  console.log(`\n▶ Running ${script} …`);
  execSync(`node "${full}"`, { stdio: 'inherit', cwd: root });
}

console.log('\n✅ prisma/seed.js — all seed scripts completed.');
