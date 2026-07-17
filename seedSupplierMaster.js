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
    supplierType: 'Corporate',
    supplierName: 'INDIA HYDRAULICS',
    address: 'TIRUCHENGODE (TK)',
    city: 'Tiruchengode',
    country: 'India',
    state: 'Tamil Nadu',
    stateCode: 'TN',
    pinCode: '637001',
    contactPerson: 'RAMASAMY',
    mobile: '9443189164',
    phone: '04288-252111',
    email: 'info@indiahydraulics.net',
    website: 'www.indiahydraulics.net',
    gstNo: '33AABCI1234F1Z1',
    panNo: 'AABCI1234F',
    bankName: 'STATE BANK OF INDIA',
    branchName: 'TIRUCHENGODE',
    accountName: 'INDIA HYDRAULICS',
    accountNumber: '112233445566',
    ifscCode: 'SBIN0000111',
    micrCode: '637002001',
    updatedBy: 'Admin',
    createdBy: 'Admin',
  },
  {
    sCode: 'SUP101',
    supplierType: 'Corporate',
    supplierName: 'TAMILNADU STEEL & TRADING',
    address: 'TIRUCHENGODE (TK)',
    city: 'Tiruchengode',
    country: 'India',
    state: 'Tamil Nadu',
    stateCode: 'TN',
    pinCode: '637002',
    contactPerson: 'KUMAR',
    mobile: '9842712345',
    phone: '04288-253222',
    email: 'sales@tnsteel.in',
    website: 'www.tnsteel.in',
    gstNo: '33AABCT9876G1Z2',
    panNo: 'AABCT9876G',
    bankName: 'HDFC BANK',
    branchName: 'TIRUCHENGODE',
    accountName: 'TAMILNADU STEEL & TRADING',
    accountNumber: '50100234567890',
    ifscCode: 'HDFC0000456',
    micrCode: '637240002',
    updatedBy: 'Admin',
    createdBy: 'Admin',
  },
  {
    sCode: 'SUP108',
    supplierType: 'Individual',
    supplierName: 'OPENING STOCK',
    address: 'CHENNAI MAIN ROAD',
    city: 'Chennai',
    country: 'India',
    state: 'Tamil Nadu',
    stateCode: 'TN',
    pinCode: '600053',
    contactPerson: 'MURUGAN',
    mobile: '9840012345',
    phone: '044-24567890',
    email: 'admin@openingstock.com',
    website: 'www.openingstock.com',
    gstNo: '33AABCO3456H1Z3',
    panNo: 'AABCO3456H',
    bankName: 'ICICI BANK',
    branchName: 'AMBATTUR',
    accountName: 'OPENING STOCK',
    accountNumber: '000105001234',
    ifscCode: 'ICIC0000001',
    micrCode: '600229002',
    updatedBy: 'Admin',
    createdBy: 'Admin',
  },
  {
    sCode: 'SUP137',
    supplierType: 'Corporate',
    supplierName: 'HYDRAULICS & PNEUMATICS CO',
    address: 'COIMBATORE',
    city: 'Coimbatore',
    country: 'India',
    state: 'Tamil Nadu',
    stateCode: 'TN',
    pinCode: '641004',
    contactPerson: 'SHABIR',
    mobile: '9894339642',
    phone: '0422-2567891',
    email: 'sales@hydropneumatics.com',
    website: 'www.hydropneumatics.com',
    gstNo: '33AABCH4567J1Z4',
    panNo: 'AABCH4567J',
    bankName: 'AXIS BANK',
    branchName: 'PEELAMEDU',
    accountName: 'HYDRAULICS PNEUMATICS',
    accountNumber: '912020012345678',
    ifscCode: 'UTIB0000123',
    micrCode: '641211002',
    updatedBy: 'Admin',
    createdBy: 'Admin',
  },
  {
    sCode: 'SUP138',
    supplierType: 'Individual',
    supplierName: 'S.N. ENGINEERS',
    address: 'BANGALORE',
    city: 'Bengaluru',
    country: 'India',
    state: 'Karnataka',
    stateCode: 'KA',
    pinCode: '560058',
    contactPerson: 'MADHI',
    mobile: '9640589658',
    phone: '080-28394567',
    email: 'contact@snengineers.com',
    website: 'www.snengineers.com',
    gstNo: '29AABCS5678K1Z5',
    panNo: 'AABCS5678K',
    bankName: 'CANARA BANK',
    branchName: 'PEENYA',
    accountName: 'S N ENGINEERS',
    accountNumber: '11223344556677',
    ifscCode: 'CNRB0001234',
    micrCode: '560015023',
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
