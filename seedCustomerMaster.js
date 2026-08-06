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

const MOCK_CUSTOMERS = [
  {
    cCode: 'CUS97',
    customerType: 'Regular',
    customerName: 'SM DRILLING COMPANY',
    country: 'India',
    updatedBy: 'Admin',
    createdBy: 'Admin',
  },
  {
    cCode: 'CUS98',
    customerType: 'Dealer',
    customerName: 'APC DRILLING AND CONSTRUCTION PVT LTD',
    country: 'India',
    updatedBy: 'Admin',
    createdBy: 'Admin',
  },
  {
    cCode: 'CUS102',
    customerType: 'Regular',
    customerName: 'VELSON',
    country: 'India',
    mobile: '7402649977',
    updatedBy: 'Admin',
    createdBy: 'Admin',
  },
  {
    cCode: 'CUS103',
    customerType: 'Regular',
    customerName: 'ABHISHEK SONI',
    country: 'India',
    updatedBy: 'Admin',
    createdBy: 'Admin',
  },
];

async function main() {
  console.log(`[seed] Connecting to ${dbEnv} database...`);

  // 2. Seed the 4 mock customer records
  const existingCodes = new Set(
    (await prisma.customerMaster.findMany({ select: { cCode: true } })).map(r => r.cCode)
  );

  const toInsert = MOCK_CUSTOMERS.filter(c => !existingCodes.has(c.cCode));

  if (toInsert.length === 0) {
    console.log('[seed] All customer records already exist — nothing to insert.');
    return;
  }

  const result = await prisma.customerMaster.createMany({
    data: toInsert,
    skipDuplicates: true,
  });

  console.log(`[seed] Inserted ${result.count} customer record(s):`);
  toInsert.forEach(c => console.log(`  [${c.cCode}] ${c.customerName}`));
}

main()
  .catch(err => {
    console.error('[seed] Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
