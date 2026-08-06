// seedPurchaseRequest.js
// Seeds PurchaseRequest (header + details) with:
//   MAIN_PRs  — realistic standing purchase requests used in production
//   MOCK_PRs  — additional sample records for development / testing

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

// ── Helpers ───────────────────────────────────────────────────────────────────
const getFinancialYear = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const y1 = month >= 4 ? year : year - 1;
  return `${String(y1).slice(-2)}-${String(y1 + 1).slice(-2)}`;
};

async function getRefId(referenceType, description) {
  const row = await prisma.referenceMaster.findFirst({
    where: { referenceType, description: { equals: description, mode: 'insensitive' } },
    select: { id: true },
  });
  return row?.id ?? null;
}

async function getItemId(partNo) {
  const row = await prisma.itemMaster.findUnique({ where: { partNo }, select: { id: true, partName: true, description: true, hsnCode: true } });
  return row ?? null;
}

// ── MAIN DATA — real standing purchase requests ───────────────────────────────
const MAIN_PRs = [
  {
    prNo:          '25-26/PR00001',
    financialYear: '25-26',
    prDate:        new Date('2025-04-05'),
    requiredDate:  new Date('2025-04-20'),
    department:    'PURCHASE',
    team:          'Store',
    requestingUser:'Rajesh Kumar',
    requestingFor: 'Production',
    remarks:       'Urgent — hydraulic cylinder stock critically low',
    status:        'Approved',
    createdBy:     'Admin',
    updatedBy:     'Admin',
    items: [
      { partNo: 'HYD-001', itemCode: 'HYD-001', itemName: 'Hydraulic Cylinder 50mm', specification: 'Double-acting, bore 50mm, stroke 200mm, 200 bar', uom: 'EA', qty: 5, purpose: 'Machine assembly' },
      { partNo: 'HYD-002', itemCode: 'HYD-002', itemName: 'Hydraulic Pump Gear Type 16cc', specification: 'Gear pump 16cc/rev, max 250 bar, SAE mount', uom: 'EA', qty: 2, purpose: 'Replacement' },
    ],
  },
  {
    prNo:          '25-26/PR00002',
    financialYear: '25-26',
    prDate:        new Date('2025-04-12'),
    requiredDate:  new Date('2025-04-28'),
    department:    'ELECTRICAL',
    team:          'Assembly',
    requestingUser:'Selvam R',
    requestingFor: 'Production',
    remarks:       'Required for V4i panel wiring',
    status:        'Approved',
    createdBy:     'Admin',
    updatedBy:     'Admin',
    items: [
      { partNo: 'ELE-001', itemCode: 'ELE-001', itemName: 'Motor 3-Phase 7.5kW', specification: 'IE2, 7.5kW, 1440RPM, 415V 3-phase, foot mount', uom: 'EA', qty: 1, purpose: 'Drive motor replacement' },
      { partNo: 'ELE-002', itemCode: 'ELE-002', itemName: 'Solenoid Valve 4/2 Way 24VDC', specification: '4/2-way, 24VDC, G1/4" ports, NBR seals', uom: 'EA', qty: 4, purpose: 'Control circuit' },
    ],
  },
  {
    prNo:          '25-26/PR00003',
    financialYear: '25-26',
    prDate:        new Date('2025-05-02'),
    requiredDate:  new Date('2025-05-15'),
    department:    'FABRICATION',
    team:          'Sheet Metal',
    requestingUser:'Murugan S',
    requestingFor: 'Production',
    remarks:       'Monthly raw-material replenishment',
    status:        'Approved',
    createdBy:     'Admin',
    updatedBy:     'Admin',
    items: [
      { partNo: 'STL-001', itemCode: 'STL-001', itemName: 'MS Flat Bar 50x10mm', specification: 'IS 2062 Grade E250, 50x10mm, 6m length', uom: 'Kg', qty: 500, purpose: 'Frame fabrication' },
      { partNo: 'STL-002', itemCode: 'STL-002', itemName: 'MS Square Pipe 50x50x3mm', specification: 'ERW SHS 50x50x3mm, IS 4923, 6m length', uom: 'Kg', qty: 300, purpose: 'Chassis fabrication' },
    ],
  },
  {
    prNo:          '25-26/PR00004',
    financialYear: '25-26',
    prDate:        new Date('2025-05-10'),
    requiredDate:  new Date('2025-05-25'),
    department:    'STORE & ACCOUNTS',
    team:          'Store',
    requestingUser:'Anitha D',
    requestingFor: 'Maintenance',
    remarks:       'Bearings and seals for preventive maintenance',
    status:        'Pending',
    createdBy:     'Admin',
    updatedBy:     'Admin',
    items: [
      { partNo: 'BRNG-001', itemCode: 'BRNG-001', itemName: 'Ball Bearing 6205 ZZ', specification: '6205-2Z, 25mm bore, 52mm OD, C3 clearance', uom: 'EA', qty: 20, purpose: 'PM spares' },
      { partNo: 'SEAL-001', itemCode: 'SEAL-001', itemName: 'Oil Seal 40x55x8mm', specification: '40x55x8mm, NBR, single lip with spring', uom: 'EA', qty: 30, purpose: 'PM spares' },
      { partNo: 'FAST-001', itemCode: 'FAST-001', itemName: 'Hex Bolt M12x50 Grade 8.8', specification: 'M12x50 Gr 8.8 zinc plated, with nut & washer', uom: 'No', qty: 100, purpose: 'Assembly fasteners' },
    ],
  },
  {
    prNo:          '25-26/PR00005',
    financialYear: '25-26',
    prDate:        new Date('2025-05-18'),
    requiredDate:  new Date('2025-06-05'),
    department:    'HYDRAULIC',
    team:          'Purchase',
    requestingUser:'Karthik V',
    requestingFor: 'Service',
    remarks:       'Service kit for field machine repair',
    status:        'Draft',
    createdBy:     'Admin',
    updatedBy:     'Admin',
    items: [
      { partNo: 'HYD-003', itemCode: 'HYD-003', itemName: 'Hydraulic Hose 1/2" x 1m', specification: 'High-pressure braided, 1/2" bore, rated 350 bar', uom: 'EA', qty: 10, purpose: 'Field service kit' },
      { partNo: 'SEAL-001', itemCode: 'SEAL-001', itemName: 'Oil Seal 40x55x8mm', specification: '40x55x8mm, NBR, single lip', uom: 'EA', qty: 15, purpose: 'Field service kit' },
    ],
  },
];

// ── MOCK DATA — sample records for development / testing ──────────────────────
const MOCK_PRs = [
  {
    prNo:          '25-26/PR00006',
    financialYear: '25-26',
    prDate:        new Date('2025-06-01'),
    requiredDate:  new Date('2025-06-15'),
    department:    'CNC',
    team:          'CNC',
    requestingUser:'Vignesh P',
    requestingFor: 'Production',
    remarks:       'Mock - CNC consumables reorder',
    status:        'Draft',
    createdBy:     'Admin',
    updatedBy:     'Admin',
    items: [
      { partNo: 'MOCK-HYD-101', itemCode: 'MOCK-HYD-101', itemName: 'Hydraulic Control Valve 3/8"', specification: 'Pilot-operated PRV, 3/8" BSP, 0-350 bar', uom: 'EA', qty: 3, purpose: 'CNC hydraulic circuit' },
      { partNo: 'MOCK-FAST-101', itemCode: 'MOCK-FAST-101', itemName: 'Socket Head Cap Screw M10x30', specification: 'M10x30 Gr 12.9 black oxide, DIN 912', uom: 'No', qty: 200, purpose: 'CNC fixture assembly' },
    ],
  },
  {
    prNo:          '25-26/PR00007',
    financialYear: '25-26',
    prDate:        new Date('2025-06-08'),
    requiredDate:  new Date('2025-06-22'),
    department:    'ASSEMBLY',
    team:          'Assembly',
    requestingUser:'Priya N',
    requestingFor: 'Production',
    remarks:       'Mock - Assembly line consumables',
    status:        'Pending',
    createdBy:     'Admin',
    updatedBy:     'Admin',
    items: [
      { partNo: 'MOCK-ELE-101', itemCode: 'MOCK-ELE-101', itemName: 'Pressure Gauge 0-400 Bar 63mm', specification: '0-400 bar, 63mm dial, glycerine filled, 1/4" BSP', uom: 'EA', qty: 5, purpose: 'Assembly test rigs' },
      { partNo: 'MOCK-CONS-101', itemCode: 'MOCK-CONS-101', itemName: 'Hydraulic Oil ISO VG 46 (20L)', specification: 'ISO VG 46 AW, zinc-free, 20L can', uom: 'BARRAL', qty: 4, purpose: 'Machine fill' },
    ],
  },
  {
    prNo:          '25-26/PR00008',
    financialYear: '25-26',
    prDate:        new Date('2025-06-14'),
    requiredDate:  new Date('2025-06-30'),
    department:    'FABRICATION',
    team:          'Welding',
    requestingUser:'Durai M',
    requestingFor: 'Production',
    remarks:       'Mock - Welding consumables monthly',
    status:        'Approved',
    createdBy:     'Admin',
    updatedBy:     'Admin',
    items: [
      { partNo: 'MOCK-WELD-101', itemCode: 'MOCK-WELD-101', itemName: 'Welding Electrode 3.15mm E6013', specification: 'E6013, 3.15mm dia, 5kg pack, IS 814', uom: 'Kg', qty: 100, purpose: 'MIG welding' },
      { partNo: 'MOCK-STL-101', itemCode: 'MOCK-STL-101', itemName: 'MS Plate 10mm Thick', specification: 'IS 2062 Grade E250, 10mm, 2500x1250mm', uom: 'Kg', qty: 800, purpose: 'Chassis plate cutting' },
    ],
  },
  {
    prNo:          '25-26/PR00009',
    financialYear: '25-26',
    prDate:        new Date('2025-06-20'),
    requiredDate:  new Date('2025-07-05'),
    department:    'STORE & ACCOUNTS',
    team:          'Store',
    requestingUser:'Lakshmi B',
    requestingFor: 'Maintenance',
    remarks:       'Mock - Quarterly bearing replenishment',
    status:        'Draft',
    createdBy:     'Admin',
    updatedBy:     'Admin',
    items: [
      { partNo: 'MOCK-BRNG-101', itemCode: 'MOCK-BRNG-101', itemName: 'Cylindrical Roller Bearing NU205', specification: 'NU205, 25mm bore, 52mm OD, removable inner', uom: 'EA', qty: 10, purpose: 'PM stock' },
      { partNo: 'BRNG-001', itemCode: 'BRNG-001', itemName: 'Ball Bearing 6205 ZZ', specification: '6205-2Z, C3 clearance', uom: 'EA', qty: 25, purpose: 'PM stock' },
    ],
  },
  {
    prNo:          '25-26/PR00010',
    financialYear: '25-26',
    prDate:        new Date('2025-06-25'),
    requiredDate:  new Date('2025-07-10'),
    department:    'HYDRAULIC',
    team:          'Raw',
    requestingUser:'Senthil K',
    requestingFor: 'R&D',
    remarks:       'Mock - R&D prototype build',
    status:        'Pending',
    createdBy:     'Admin',
    updatedBy:     'Admin',
    items: [
      { partNo: 'MOCK-HYD-102', itemCode: 'MOCK-HYD-102', itemName: 'Hydraulic Oil Tank 50L', specification: '50L steel reservoir with suction strainer', uom: 'EA', qty: 2, purpose: 'Prototype hydraulic unit' },
      { partNo: 'HYD-002', itemCode: 'HYD-002', itemName: 'Hydraulic Pump Gear Type 16cc', specification: 'Gear pump 16cc/rev, 250 bar, bi-directional', uom: 'EA', qty: 1, purpose: 'Prototype hydraulic unit' },
      { partNo: 'HYD-003', itemCode: 'HYD-003', itemName: 'Hydraulic Hose 1/2" x 1m', specification: 'Braided, 350 bar rated', uom: 'EA', qty: 6, purpose: 'Prototype connections' },
    ],
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`[seedPurchaseRequest] Connecting to ${dbEnv} database...`);

  const allPRs = [
    ...MAIN_PRs.map(r => ({ ...r, _type: 'MAIN' })),
    ...MOCK_PRs.map(r => ({ ...r, _type: 'MOCK' })),
  ];

  let created = 0;
  let skipped = 0;

  for (const pr of allPRs) {
    const existing = await prisma.purchaseRequest.findUnique({ where: { prNo: pr.prNo } });
    if (existing) {
      console.log(`  [${pr._type}] Skipped : ${pr.prNo} — already exists`);
      skipped++;
      continue;
    }

    // Resolve department FK
    const departmentId = await getRefId('Department', pr.department);
    const teamId       = await getRefId('Team', pr.team);

    // Resolve item FKs for detail rows
    const detailRows = [];
    for (let i = 0; i < pr.items.length; i++) {
      const line = pr.items[i];
      const itemRow = await getItemId(line.partNo);
      detailRows.push({
        slNo:          i + 1,
        itemId:        itemRow?.id        ?? null,
        itemCode:      line.itemCode      || null,
        itemName:      line.itemName      || null,
        specification: line.specification || null,
        uom:           line.uom           || null,
        qty:           line.qty           ?? 0,
        purpose:       line.purpose       || null,
      });
    }

    await prisma.$transaction(async (tx) => {
      const master = await tx.purchaseRequest.create({
        data: {
          prNo:           pr.prNo,
          financialYear:  pr.financialYear,
          prDate:         pr.prDate,
          requiredDate:   pr.requiredDate  ?? null,
          department:     pr.department    || null,
          departmentId:   departmentId,
          requestingUser: pr.requestingUser || null,
          team:           pr.team          || null,
          teamId:         teamId,
          requestingFor:  pr.requestingFor || null,
          remarks:        pr.remarks       || null,
          status:         pr.status        || 'Draft',
          createdBy:      pr.createdBy     || 'Admin',
          updatedBy:      pr.updatedBy     || 'Admin',
        },
      });
      if (detailRows.length > 0) {
        await tx.purchaseRequestDetail.createMany({
          data: detailRows.map(r => ({ ...r, prId: master.id })),
        });
      }
    });

    console.log(`  [${pr._type}] Created : ${pr.prNo} — Dept: ${pr.department} | Team: ${pr.team} | ${pr.items.length} line(s)`);
    created++;
  }

  console.log(`\n[seedPurchaseRequest] Done. Created: ${created}, Skipped: ${skipped}`);
}

main()
  .catch(err => {
    console.error('[seedPurchaseRequest] Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
