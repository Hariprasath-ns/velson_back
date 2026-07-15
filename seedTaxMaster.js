import { neonPrisma, dockerPrisma } from "./src/config/db.js";
import dotenv from "dotenv";

dotenv.config();

const db = process.env.DB_ENV === "neon" ? neonPrisma : dockerPrisma;

// Each ledger account represents one GST slab
const taxLedgerData = [
  { ledgerName: "EXEMPT",  taxPercent: 0  },
  { ledgerName: "GST 5%",  taxPercent: 5  },
  { ledgerName: "GST 12%", taxPercent: 12 },
  { ledgerName: "GST 18%", taxPercent: 18 },
  { ledgerName: "GST 28%", taxPercent: 28 },
];

// For each slab: CGST = SGST = taxPercent/2, IGST = taxPercent (intrastate vs interstate)
// purchaseCgst/Sgst/Igst and salesCgst/Sgst/Igst mirror the general rates
const taxMasterData = [
  {
    ledgerName:       "EXEMPT",
    taxPercent:       0,
    cgstTax:          0,    sgstTax:          0,    igstTax:          0,
    purchaseCgstTax:  0,    purchaseSgstTax:  0,    purchaseIgstTax:  0,
    salesCgstTax:     0,    salesSgstTax:     0,    salesIgstTax:     0,
  },
  {
    ledgerName:       "GST 5%",
    taxPercent:       5,
    cgstTax:          2.5,  sgstTax:          2.5,  igstTax:          5,
    purchaseCgstTax:  2.5,  purchaseSgstTax:  2.5,  purchaseIgstTax:  5,
    salesCgstTax:     2.5,  salesSgstTax:     2.5,  salesIgstTax:     5,
  },
  {
    ledgerName:       "GST 12%",
    taxPercent:       12,
    cgstTax:          6,    sgstTax:          6,    igstTax:          12,
    purchaseCgstTax:  6,    purchaseSgstTax:  6,    purchaseIgstTax:  12,
    salesCgstTax:     6,    salesSgstTax:     6,    salesIgstTax:     12,
  },
  {
    ledgerName:       "GST 18%",
    taxPercent:       18,
    cgstTax:          9,    sgstTax:          9,    igstTax:          18,
    purchaseCgstTax:  9,    purchaseSgstTax:  9,    purchaseIgstTax:  18,
    salesCgstTax:     9,    salesSgstTax:     9,    salesIgstTax:     18,
  },
  {
    ledgerName:       "GST 28%",
    taxPercent:       28,
    cgstTax:          14,   sgstTax:          14,   igstTax:          28,
    purchaseCgstTax:  14,   purchaseSgstTax:  14,   purchaseIgstTax:  28,
    salesCgstTax:     14,   salesSgstTax:     14,   salesIgstTax:     28,
  },
];

async function seed() {
  console.log("Seeding tax_ledger_account...");
  let created = 0;
  let skipped = 0;

  try {
    // Step 1 — seed ledger accounts
    for (const data of taxLedgerData) {
      const existing = await db.taxLedgerAccount.findFirst({
        where: { ledgerName: data.ledgerName },
      });
      if (!existing) {
        await db.taxLedgerAccount.create({ data });
        console.log(`  Created : ${data.ledgerName} (${data.taxPercent}%)`);
        created++;
      } else {
        console.log(`  Skipped : ${data.ledgerName} — already exists`);
        skipped++;
      }
    }
    console.log(`\nLedger accounts — Created: ${created}, Skipped: ${skipped}\n`);

    // Step 2 — seed tax master rows
    console.log("Seeding tax_master...");
    created = 0;
    skipped = 0;

    for (const entry of taxMasterData) {
      const ledger = await db.taxLedgerAccount.findFirst({
        where: { ledgerName: entry.ledgerName },
      });
      if (!ledger) {
        console.error(`  ERROR: ledger not found for "${entry.ledgerName}"`);
        continue;
      }

      const existing = await db.taxMaster.findFirst({
        where: { taxLedgerId: ledger.id },
      });

      if (!existing) {
        const { ledgerName, ...rest } = entry;
        await db.taxMaster.create({
          data: { ...rest, taxLedgerId: ledger.id },
        });
        console.log(`  Created : tax_master for ${entry.ledgerName}`);
        created++;
      } else {
        console.log(`  Skipped : tax_master for ${entry.ledgerName} — already exists`);
        skipped++;
      }
    }
    console.log(`\nTax master — Created: ${created}, Skipped: ${skipped}`);
  } catch (err) {
    console.error("Error seeding:", err);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

seed();
