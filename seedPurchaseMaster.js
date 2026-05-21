// seedPurchaseMaster.js
// Seeds PurchaseMaster (Purchase Orders: header + details) with:
//   MAIN_POs  — realistic purchase orders matching the seeded PRs
//   MOCK_POs  — additional sample records for development / testing

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
async function getSupplierId(sCode) {
  const row = await prisma.supplierMaster.findUnique({ where: { sCode }, select: { id: true, contactPerson: true, address: true, gstNo: true, supplierRefNo: true } });
  return row ?? null;
}

async function getItemId(partNo) {
  const row = await prisma.itemMaster.findUnique({
    where: { partNo },
    select: { id: true, partName: true, description: true, hsnCode: true },
  });
  return row ?? null;
}

// ── MAIN DATA — real purchase orders ─────────────────────────────────────────
const MAIN_POs = [
  {
    poNo:           '25-26/PO00001',
    financialYear:  '25-26',
    poDate:         new Date('2025-04-08'),
    etaDate:        new Date('2025-04-22'),
    poType:         'Purchase Order',
    supplierCode:   'SUP100',          // INDIA HYDRAULICS
    paymentTerms:   '30 days credit',
    destination:    'Tiruchengode',
    modeOfDespatch: 'Road Transport',
    deliveryPeriod: '14 days',
    testReport:     'Required',
    warrantyTerms:  '12 months from date of supply',
    remarks:        'Linked to PR00001 — urgent hydraulic parts',
    status:         'Approved',
    createdBy:      'Admin',
    updatedBy:      'Admin',
    cgstPer: 9,  sgstPer: 9,  igstPer: 0,
    items: [
      { purchaseReqNo: '25-26/PR00001', partNo: 'HYD-001', itemCode: 'HYD-001', itemName: 'Hydraulic Cylinder 50mm',       description: 'Double-acting, bore 50mm, stroke 200mm, 200 bar', uom: 'EA', qty: 5,   unitPrice: 4500, discPer: 0, gstPer: 18 },
      { purchaseReqNo: '25-26/PR00001', partNo: 'HYD-002', itemCode: 'HYD-002', itemName: 'Hydraulic Pump Gear Type 16cc', description: 'Gear pump 16cc/rev, 250 bar, SAE mount',             uom: 'EA', qty: 2,   unitPrice: 12000, discPer: 0, gstPer: 18 },
    ],
  },
  {
    poNo:           '25-26/PO00002',
    financialYear:  '25-26',
    poDate:         new Date('2025-04-15'),
    etaDate:        new Date('2025-04-30'),
    poType:         'Purchase Order',
    supplierCode:   'SUP137',          // HYDRAULICS & PNEUMATICS CO
    paymentTerms:   '45 days credit',
    destination:    'Tiruchengode',
    modeOfDespatch: 'Courier',
    deliveryPeriod: '10 days',
    testReport:     'Not Required',
    warrantyTerms:  '6 months',
    remarks:        'Linked to PR00002 — electrical items for V4i',
    status:         'Approved',
    createdBy:      'Admin',
    updatedBy:      'Admin',
    cgstPer: 9,  sgstPer: 9,  igstPer: 0,
    items: [
      { purchaseReqNo: '25-26/PR00002', partNo: 'ELE-001', itemCode: 'ELE-001', itemName: 'Motor 3-Phase 7.5kW',         description: 'IE2, 7.5kW, 1440RPM, 415V 3-phase, foot mount', uom: 'EA', qty: 1, unitPrice: 18500, discPer: 2, gstPer: 18 },
      { purchaseReqNo: '25-26/PR00002', partNo: 'ELE-002', itemCode: 'ELE-002', itemName: 'Solenoid Valve 4/2 Way 24VDC', description: '4/2-way, 24VDC, G1/4" ports, NBR seals',           uom: 'EA', qty: 4, unitPrice: 2800,  discPer: 0, gstPer: 18 },
    ],
  },
  {
    poNo:           '25-26/PO00003',
    financialYear:  '25-26',
    poDate:         new Date('2025-05-05'),
    etaDate:        new Date('2025-05-18'),
    poType:         'Purchase Order',
    supplierCode:   'SUP101',          // TAMILNADU STEEL & TRADING
    paymentTerms:   '30 days credit',
    destination:    'Tiruchengode',
    modeOfDespatch: 'Road Transport',
    deliveryPeriod: '7 days',
    testReport:     'Not Required',
    warrantyTerms:  'NA',
    remarks:        'Linked to PR00003 — raw material monthly replenishment',
    status:         'Approved',
    createdBy:      'Admin',
    updatedBy:      'Admin',
    cgstPer: 9,  sgstPer: 9,  igstPer: 0,
    items: [
      { purchaseReqNo: '25-26/PR00003', partNo: 'STL-001', itemCode: 'STL-001', itemName: 'MS Flat Bar 50x10mm',      description: 'IS 2062 Grade E250, 50x10mm, 6m length',      uom: 'Kg', qty: 500, unitPrice: 68, discPer: 0, gstPer: 18 },
      { purchaseReqNo: '25-26/PR00003', partNo: 'STL-002', itemCode: 'STL-002', itemName: 'MS Square Pipe 50x50x3mm', description: 'ERW SHS 50x50x3mm, IS 4923, 6m length',        uom: 'Kg', qty: 300, unitPrice: 72, discPer: 0, gstPer: 18 },
    ],
  },
  {
    poNo:           '25-26/PO00004',
    financialYear:  '25-26',
    poDate:         new Date('2025-05-13'),
    etaDate:        new Date('2025-05-27'),
    poType:         'Purchase Order',
    supplierCode:   'SUP138',          // S.N. ENGINEERS
    paymentTerms:   '30 days credit',
    destination:    'Tiruchengode',
    modeOfDespatch: 'Courier',
    deliveryPeriod: '10 days',
    testReport:     'Not Required',
    warrantyTerms:  '6 months',
    remarks:        'Linked to PR00004 — PM spares bearings and seals',
    status:         'Pending',
    createdBy:      'Admin',
    updatedBy:      'Admin',
    cgstPer: 9,  sgstPer: 9,  igstPer: 0,
    items: [
      { purchaseReqNo: '25-26/PR00004', partNo: 'BRNG-001', itemCode: 'BRNG-001', itemName: 'Ball Bearing 6205 ZZ',    description: '6205-2Z, 25mm bore, 52mm OD, C3 clearance',    uom: 'EA', qty: 20,  unitPrice: 320, discPer: 5, gstPer: 18 },
      { purchaseReqNo: '25-26/PR00004', partNo: 'SEAL-001', itemCode: 'SEAL-001', itemName: 'Oil Seal 40x55x8mm',      description: '40x55x8mm, NBR, single lip with spring',        uom: 'EA', qty: 30,  unitPrice: 85,  discPer: 0, gstPer: 18 },
      { purchaseReqNo: '25-26/PR00004', partNo: 'FAST-001', itemCode: 'FAST-001', itemName: 'Hex Bolt M12x50 Grade 8.8', description: 'M12x50 Gr 8.8 zinc plated with nut & washer', uom: 'No', qty: 100, unitPrice: 18,  discPer: 0, gstPer: 18 },
    ],
  },
  {
    poNo:           '25-26/PO00005',
    financialYear:  '25-26',
    poDate:         new Date('2025-05-21'),
    etaDate:        new Date('2025-06-07'),
    poType:         'Service Order',
    supplierCode:   'SUP100',          // INDIA HYDRAULICS
    paymentTerms:   'Advance',
    destination:    'Site — Coimbatore',
    modeOfDespatch: 'Own Vehicle',
    deliveryPeriod: '7 days',
    testReport:     'Not Required',
    warrantyTerms:  '3 months',
    remarks:        'Linked to PR00005 — field service kit',
    status:         'Draft',
    createdBy:      'Admin',
    updatedBy:      'Admin',
    cgstPer: 9,  sgstPer: 9,  igstPer: 0,
    items: [
      { purchaseReqNo: '25-26/PR00005', partNo: 'HYD-003', itemCode: 'HYD-003', itemName: 'Hydraulic Hose 1/2" x 1m', description: 'Braided, 350 bar rated, 1m length',   uom: 'EA', qty: 10, unitPrice: 850, discPer: 0, gstPer: 18 },
      { purchaseReqNo: '25-26/PR00005', partNo: 'SEAL-001', itemCode: 'SEAL-001', itemName: 'Oil Seal 40x55x8mm',      description: '40x55x8mm, NBR, single lip',          uom: 'EA', qty: 15, unitPrice: 85,  discPer: 0, gstPer: 18 },
    ],
  },
];

// ── MOCK DATA — sample records for development / testing ──────────────────────
const MOCK_POs = [
  {
    poNo:           '25-26/PO00006',
    financialYear:  '25-26',
    poDate:         new Date('2025-06-03'),
    etaDate:        new Date('2025-06-17'),
    poType:         'Purchase Order',
    supplierCode:   'SUP137',          // HYDRAULICS & PNEUMATICS CO
    paymentTerms:   '30 days credit',
    destination:    'Tiruchengode',
    modeOfDespatch: 'Courier',
    deliveryPeriod: '10 days',
    testReport:     'Not Required',
    warrantyTerms:  '6 months',
    remarks:        'Mock - CNC consumables order',
    status:         'Draft',
    createdBy:      'Admin',
    updatedBy:      'Admin',
    cgstPer: 9,  sgstPer: 9,  igstPer: 0,
    items: [
      { purchaseReqNo: '25-26/PR00006', partNo: 'MOCK-HYD-101', itemCode: 'MOCK-HYD-101', itemName: 'Hydraulic Control Valve 3/8"',  description: 'Pilot-operated PRV, 3/8" BSP, 0-350 bar', uom: 'EA', qty: 3,   unitPrice: 6200, discPer: 0, gstPer: 18 },
      { purchaseReqNo: '25-26/PR00006', partNo: 'MOCK-FAST-101', itemCode: 'MOCK-FAST-101', itemName: 'Socket Head Cap Screw M10x30', description: 'M10x30 Gr 12.9 black oxide DIN 912',       uom: 'No', qty: 200, unitPrice: 22,   discPer: 5, gstPer: 18 },
    ],
  },
  {
    poNo:           '25-26/PO00007',
    financialYear:  '25-26',
    poDate:         new Date('2025-06-10'),
    etaDate:        new Date('2025-06-24'),
    poType:         'Purchase Order',
    supplierCode:   'SUP108',          // OPENING STOCK
    paymentTerms:   'Immediate',
    destination:    'Tiruchengode',
    modeOfDespatch: 'Road Transport',
    deliveryPeriod: '7 days',
    testReport:     'Not Required',
    warrantyTerms:  'NA',
    remarks:        'Mock - Assembly consumables order',
    status:         'Pending',
    createdBy:      'Admin',
    updatedBy:      'Admin',
    cgstPer: 9,  sgstPer: 9,  igstPer: 0,
    items: [
      { purchaseReqNo: '25-26/PR00007', partNo: 'MOCK-ELE-101',  itemCode: 'MOCK-ELE-101',  itemName: 'Pressure Gauge 0-400 Bar 63mm',   description: '0-400 bar, 63mm dial, glycerine filled',  uom: 'EA',    qty: 5, unitPrice: 950,  discPer: 0, gstPer: 18 },
      { purchaseReqNo: '25-26/PR00007', partNo: 'MOCK-CONS-101', itemCode: 'MOCK-CONS-101', itemName: 'Hydraulic Oil ISO VG 46 (20L)',    description: 'ISO VG 46 AW, zinc-free, 20L can',        uom: 'BARRAL', qty: 4, unitPrice: 2800, discPer: 0, gstPer: 18 },
    ],
  },
  {
    poNo:           '25-26/PO00008',
    financialYear:  '25-26',
    poDate:         new Date('2025-06-16'),
    etaDate:        new Date('2025-07-02'),
    poType:         'Purchase Order',
    supplierCode:   'SUP101',          // TAMILNADU STEEL & TRADING
    paymentTerms:   '30 days credit',
    destination:    'Tiruchengode',
    modeOfDespatch: 'Road Transport',
    deliveryPeriod: '7 days',
    testReport:     'Not Required',
    warrantyTerms:  'NA',
    remarks:        'Mock - Fabrication welding consumables',
    status:         'Approved',
    createdBy:      'Admin',
    updatedBy:      'Admin',
    cgstPer: 9,  sgstPer: 9,  igstPer: 0,
    items: [
      { purchaseReqNo: '25-26/PR00008', partNo: 'MOCK-WELD-101', itemCode: 'MOCK-WELD-101', itemName: 'Welding Electrode 3.15mm E6013', description: 'E6013, 3.15mm dia, 5kg pack, IS 814',         uom: 'Kg', qty: 100, unitPrice: 95, discPer: 0,  gstPer: 18 },
      { purchaseReqNo: '25-26/PR00008', partNo: 'MOCK-STL-101',  itemCode: 'MOCK-STL-101',  itemName: 'MS Plate 10mm Thick',            description: 'IS 2062 Grade E250, 10mm, 2500x1250mm sheet', uom: 'Kg', qty: 800, unitPrice: 75, discPer: 2,  gstPer: 18 },
    ],
  },
  {
    poNo:           '25-26/PO00009',
    financialYear:  '25-26',
    poDate:         new Date('2025-06-22'),
    etaDate:        new Date('2025-07-07'),
    poType:         'Purchase Order',
    supplierCode:   'SUP138',          // S.N. ENGINEERS
    paymentTerms:   '45 days credit',
    destination:    'Tiruchengode',
    modeOfDespatch: 'Courier',
    deliveryPeriod: '10 days',
    testReport:     'Not Required',
    warrantyTerms:  '6 months',
    remarks:        'Mock - Quarterly bearing order',
    status:         'Draft',
    createdBy:      'Admin',
    updatedBy:      'Admin',
    cgstPer: 9,  sgstPer: 9,  igstPer: 0,
    items: [
      { purchaseReqNo: '25-26/PR00009', partNo: 'MOCK-BRNG-101', itemCode: 'MOCK-BRNG-101', itemName: 'Cylindrical Roller Bearing NU205', description: 'NU205, 25mm bore, 52mm OD',              uom: 'EA', qty: 10, unitPrice: 850, discPer: 5, gstPer: 18 },
      { purchaseReqNo: '25-26/PR00009', partNo: 'BRNG-001',      itemCode: 'BRNG-001',      itemName: 'Ball Bearing 6205 ZZ',             description: '6205-2Z, C3 clearance, 25mm bore',       uom: 'EA', qty: 25, unitPrice: 320, discPer: 5, gstPer: 18 },
    ],
  },
  {
    poNo:           '25-26/PO00010',
    financialYear:  '25-26',
    poDate:         new Date('2025-06-27'),
    etaDate:        new Date('2025-07-12'),
    poType:         'Auto PO',
    supplierCode:   'SUP100',          // INDIA HYDRAULICS
    paymentTerms:   '30 days credit',
    destination:    'Tiruchengode',
    modeOfDespatch: 'Road Transport',
    deliveryPeriod: '14 days',
    testReport:     'Required',
    warrantyTerms:  '12 months',
    remarks:        'Mock - R&D prototype hydraulic unit build',
    status:         'Pending',
    createdBy:      'Admin',
    updatedBy:      'Admin',
    cgstPer: 9,  sgstPer: 9,  igstPer: 0,
    items: [
      { purchaseReqNo: '25-26/PR00010', partNo: 'MOCK-HYD-102', itemCode: 'MOCK-HYD-102', itemName: 'Hydraulic Oil Tank 50L',           description: '50L steel reservoir with strainer & drain', uom: 'EA', qty: 2, unitPrice: 3500,  discPer: 0, gstPer: 18 },
      { purchaseReqNo: '25-26/PR00010', partNo: 'HYD-002',      itemCode: 'HYD-002',      itemName: 'Hydraulic Pump Gear Type 16cc',    description: 'Gear pump 16cc/rev, 250 bar',              uom: 'EA', qty: 1, unitPrice: 12000, discPer: 0, gstPer: 18 },
      { purchaseReqNo: '25-26/PR00010', partNo: 'HYD-003',      itemCode: 'HYD-003',      itemName: 'Hydraulic Hose 1/2" x 1m',        description: 'Braided, 350 bar rated',                   uom: 'EA', qty: 6, unitPrice: 850,   discPer: 0, gstPer: 18 },
    ],
  },
];

// ── Tax / amount calculation ──────────────────────────────────────────────────
function calcAmounts(items, cgstPer, sgstPer, igstPer) {
  let subTotal = 0;
  const detailRows = items.map((item, i) => {
    const amount  = item.qty * item.unitPrice * (1 - item.discPer / 100);
    const discAmt = item.qty * item.unitPrice * (item.discPer / 100);
    const gstAmt  = amount * (item.gstPer / 100);
    const netAmt  = amount + gstAmt;
    subTotal += amount;
    return {
      slNo:           i + 1,
      purchaseReqNo:  item.purchaseReqNo  || null,
      itemCode:       item.itemCode       || null,
      itemName:       item.itemName       || null,
      description:    item.description    || null,
      hsnCode:        item.hsnCode        || null,
      uom:            item.uom            || null,
      qty:            item.qty,
      unitPrice:      item.unitPrice,
      discPer:        item.discPer,
      discAmt:        parseFloat(discAmt.toFixed(2)),
      amount:         parseFloat(amount.toFixed(2)),
      gstPer:         item.gstPer,
      gstAmt:         parseFloat(gstAmt.toFixed(2)),
      netAmt:         parseFloat(netAmt.toFixed(2)),
    };
  });
  const cgstAmt = parseFloat((subTotal * cgstPer / 100).toFixed(2));
  const sgstAmt = parseFloat((subTotal * sgstPer / 100).toFixed(2));
  const igstAmt = parseFloat((subTotal * igstPer / 100).toFixed(2));
  const totalAmount = parseFloat((subTotal + cgstAmt + sgstAmt + igstAmt).toFixed(2));
  return { detailRows, subTotal: parseFloat(subTotal.toFixed(2)), cgstAmt, sgstAmt, igstAmt, totalAmount };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`[seedPurchaseMaster] Connecting to ${dbEnv} database...`);

  const allPOs = [
    ...MAIN_POs.map(r => ({ ...r, _type: 'MAIN' })),
    ...MOCK_POs.map(r => ({ ...r, _type: 'MOCK' })),
  ];

  let created = 0;
  let skipped = 0;

  for (const po of allPOs) {
    const existing = await prisma.purchaseMaster.findUnique({ where: { poNo: po.poNo } });
    if (existing) {
      console.log(`  [${po._type}] Skipped : ${po.poNo} — already exists`);
      skipped++;
      continue;
    }

    // Resolve supplier FK
    const supplierRow = await getSupplierId(po.supplierCode);
    if (!supplierRow) {
      console.warn(`  [${po._type}] WARN    : ${po.poNo} — supplier ${po.supplierCode} not found, skipping`);
      skipped++;
      continue;
    }

    // Resolve item FKs and calculate amounts
    const itemsWithIds = [];
    for (const line of po.items) {
      const itemRow = await getItemId(line.partNo);
      itemsWithIds.push({ ...line, itemId: itemRow?.id ?? null, hsnCode: itemRow?.hsnCode ?? null });
    }
    const { detailRows, subTotal, cgstAmt, sgstAmt, igstAmt, totalAmount } =
      calcAmounts(itemsWithIds, po.cgstPer, po.sgstPer, po.igstPer);

    await prisma.$transaction(async (tx) => {
      const master = await tx.purchaseMaster.create({
        data: {
          poNo:            po.poNo,
          financialYear:   po.financialYear,
          poDate:          po.poDate,
          etaDate:         po.etaDate          ?? null,
          poType:          po.poType           || 'Purchase Order',
          supplierId:      supplierRow.id,
          contactPerson:   supplierRow.contactPerson ?? null,
          supplierAddress: supplierRow.address       ?? null,
          gstNo:           supplierRow.gstNo         ?? null,
          supplierRefNo:   po.supplierRefNo    ?? null,
          discountType:    'Dis_Per',
          freight:         0,
          destination:     po.destination      || null,
          paymentTerms:    po.paymentTerms     || null,
          testReport:      po.testReport       || null,
          modeOfDespatch:  po.modeOfDespatch   || null,
          deliveryPeriod:  po.deliveryPeriod   || null,
          warrantyTerms:   po.warrantyTerms    || null,
          remarks:         po.remarks          || null,
          subTotal:        subTotal,
          cgstPer:         po.cgstPer,
          cgstAmt:         cgstAmt,
          sgstPer:         po.sgstPer,
          sgstAmt:         sgstAmt,
          igstPer:         po.igstPer,
          igstAmt:         igstAmt,
          othersPer:       0,
          othersAmt:       0,
          totalAmount:     totalAmount,
          status:          po.status           || 'Draft',
          createdBy:       po.createdBy        || 'Admin',
          updatedBy:       po.updatedBy        || 'Admin',
        },
      });

      if (detailRows.length > 0) {
        await tx.purchaseDetail.createMany({
          data: detailRows.map((r, i) => ({
            ...r,
            poId:   master.id,
            itemId: itemsWithIds[i].itemId,
            hsnCode: itemsWithIds[i].hsnCode,
          })),
        });
      }
    });

    console.log(`  [${po._type}] Created : ${po.poNo} — Supplier: ${po.supplierCode} | ${po.items.length} line(s) | Total: ₹${totalAmount}`);
    created++;
  }

  console.log(`\n[seedPurchaseMaster] Done. Created: ${created}, Skipped: ${skipped}`);
}

main()
  .catch(err => {
    console.error('[seedPurchaseMaster] Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
