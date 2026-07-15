import { neonPrisma, dockerPrisma } from './src/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const db = process.env.DB_ENV === 'neon' ? neonPrisma : dockerPrisma;

const NEW_REF_TYPES = ['Supplier_Type', 'Customer_Type'];

const REF_MASTER_DATA = [
  { referenceType: 'Supplier_Type', code: '001', description: 'Individual', updatedBy: 'ADMIN' },
  { referenceType: 'Supplier_Type', code: '002', description: 'Corporate',  updatedBy: 'ADMIN' },
  { referenceType: 'Customer_Type', code: '001', description: 'Individual', updatedBy: 'ADMIN' },
  { referenceType: 'Customer_Type', code: '002', description: 'Corporate',  updatedBy: 'ADMIN' },
];

async function seed() {
  console.log('Seeding Supplier_Type and Customer_Type...');

  try {
    // 1. Fetch existing ReferenceType names and highest code
    const existing = await db.referenceType.findMany({ select: { code: true, name: true } });
    const existingNames = new Set(existing.map(r => r.name));
    const codes = existing.map(r => parseInt(r.code, 10)).filter(n => !isNaN(n));
    let nextNum = codes.length > 0 ? Math.max(...codes) + 1 : 1;

    // 2. Insert only missing ReferenceType rows
    for (const name of NEW_REF_TYPES) {
      if (existingNames.has(name)) {
        console.log(`  ReferenceType "${name}" already exists — skipping.`);
      } else {
        await db.referenceType.create({
          data: { code: String(nextNum).padStart(3, '0'), name },
        });
        console.log(`  Created ReferenceType: [${String(nextNum).padStart(3, '0')}] ${name}`);
        nextNum++;
      }
    }

    // 3. Seed ReferenceMaster entries (skip duplicates)
    const result = await db.referenceMaster.createMany({
      data: REF_MASTER_DATA,
      skipDuplicates: true,
    });

    console.log(`\n  Inserted ${result.count} ReferenceMaster entry(ies):`);
    REF_MASTER_DATA.forEach(d => console.log(`    [${d.referenceType}] ${d.code} → ${d.description}`));

    console.log('\nSeeding complete.');
  } catch (err) {
    console.error('Error seeding:', err);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

seed();
