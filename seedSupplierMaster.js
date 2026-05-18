import { PrismaClient } from './src/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbEnv = process.env.DB_ENV || 'docker';
const connString =
  dbEnv === 'neon'
    ? process.env.NEON_DATABASE_URL
    : process.env.DOCKER_DATABASE_URL;

const prisma = new PrismaClient({
  adapter: new PrismaPg(new pg.Pool({ connectionString: connString })),
});

// Ensure these supplier types exist in ReferenceMaster under Supplier_Type
const SUPPLIER_TYPE_ENTRIES = [
  { code: '001', description: 'Individual' },
  { code: '002', description: 'Corporate' },
  { code: '003', description: 'Manufacturer' },
  { code: '004', description: 'Dealer' },
  { code: '005', description: 'Distributor' },
  { code: '006', description: 'Trader' },
  { code: '007', description: 'Service Provider' },
];

const MOCK_SUPPLIERS = [
  {
    sCode: 'SUP100',
    supplierType: 'Manufacturer',
    supplierName: 'INDIA HYDRAULICS',
    address: 'TIRUCHENGODE (TK)',
    city: 'Tiruchengode',
    country: 'India',
    state: 'Tamil Nadu',
    stateCode: 'TN',
    pinCode: '637001',
    contactPerson: 'RAMASAMY',
    mobile: '9443189164',
    email: 'info@indiahydraulics.net',
    updatedBy: 'Admin',
    createdBy: 'Admin',
  },
  {
    sCode: 'SUP101',
    supplierType: 'Dealer',
    supplierName: 'TAMILNADU STEEL & TRADING',
    address: 'TIRUCHENGODE (TK)',
    country: 'India',
    state: 'Tamil Nadu',
    stateCode: 'TN',
    updatedBy: 'Admin',
    createdBy: 'Admin',
  },
  {
    sCode: 'SUP108',
    supplierType: 'Trader',
    supplierName: 'OPENING STOCK',
    country: 'India',
    state: 'Tamil Nadu',
    stateCode: 'TN',
    updatedBy: 'Admin',
    createdBy: 'Admin',
  },
  {
    sCode: 'SUP137',
    supplierType: 'Distributor',
    supplierName: 'HYDRAULICS & PNEUMATICS CO',
    address: 'COIMBATORE',
    city: 'Coimbatore',
    country: 'India',
    state: 'Tamil Nadu',
    stateCode: 'TN',
    contactPerson: 'SHABIR',
    mobile: '9894339642',
    updatedBy: 'Admin',
    createdBy: 'Admin',
  },
  {
    sCode: 'SUP138',
    supplierType: 'Manufacturer',
    supplierName: 'S.N. ENGINEERS',
    address: 'BANGALORE',
    city: 'Bengaluru',
    country: 'India',
    state: 'Karnataka',
    stateCode: 'KA',
    contactPerson: 'MADHI',
    mobile: '9640589658',
    updatedBy: 'Admin',
    createdBy: 'Admin',
  },
];

async function main() {
  console.log(`[seed] Connecting to ${dbEnv} database...`);

  // 1. Ensure Supplier_Type entries exist in ReferenceMaster
  const refType = await prisma.referenceType.findUnique({
    where: { name: 'Supplier_Type' },
  });

  if (!refType) {
    console.warn('[seed] WARNING: Supplier_Type not found in reference_type. Run seedreferencetypename.js first.');
  } else {
    const existing = await prisma.referenceMaster.findMany({
      where: { referenceType: 'Supplier_Type' },
      select: { description: true },
    });
    const existingDesc = new Set(existing.map(r => r.description));

    const toInsert = SUPPLIER_TYPE_ENTRIES.filter(e => !existingDesc.has(e.description));
    if (toInsert.length > 0) {
      await prisma.referenceMaster.createMany({
        data: toInsert.map(e => ({
          referenceType: 'Supplier_Type',
          referenceTypeId: refType.id,
          code: e.code,
          description: e.description,
          updatedBy: 'Admin',
        })),
        skipDuplicates: true,
      });
      console.log(`[seed] Inserted ${toInsert.length} Supplier_Type entries:`, toInsert.map(e => e.description).join(', '));
    } else {
      console.log('[seed] All Supplier_Type entries already exist.');
    }
  }

  // 2. Seed the 5 mock supplier records
  const existingCodes = new Set(
    (await prisma.supplierMaster.findMany({ select: { sCode: true } })).map(r => r.sCode)
  );

  const toInsert = MOCK_SUPPLIERS.filter(s => !existingCodes.has(s.sCode));

  if (toInsert.length === 0) {
    console.log('[seed] All supplier records already exist — nothing to insert.');
    return;
  }

  const result = await prisma.supplierMaster.createMany({
    data: toInsert,
    skipDuplicates: true,
  });

  console.log(`[seed] Inserted ${result.count} supplier record(s):`);
  toInsert.forEach(s => console.log(`  [${s.sCode}] ${s.supplierName}`));
}

main()
  .catch(err => {
    console.error('[seed] Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
