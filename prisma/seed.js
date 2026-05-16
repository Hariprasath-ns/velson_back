// prisma/seed.js  — called by `npx prisma db seed` (see package.json "prisma.seed")
// Delegates to the root-level seed scripts that follow the project's ESM + db pattern.

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const scripts = [
  'seedreferencetypename.js',   // 1. Ensure all ReferenceType rows exist
  'seedReferenceMaster.js',     // 2. Seed all ReferenceMaster rows
  'seedPartNumberBase.js',      // 3. Seed CategoryMaster, SubCategoryMaster, PartNumberBase
];

for (const script of scripts) {
  const full = path.join(root, script);
  console.log(`\n▶ Running ${script} …`);
  execSync(`node "${full}"`, { stdio: 'inherit', cwd: root });
}

console.log('\n✅ prisma/seed.js — all seed scripts completed.');
