import { neonPrisma, dockerPrisma } from './src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const db = process.env.DB_ENV === 'neon' ? neonPrisma : dockerPrisma;

const PREFIX_SEED = [
  'VT', 'VA%', 'VG', 'VHC', 'VHP', 'VHM', 'VHV', 'VE', 'VH', 'VF',
  'VC', 'VM', 'VCS', 'VMM', 'VCD', 'VRC', 'V% (VE)', 'VOM', 'VCV',
  'VGH', 'VLC', 'VCR', 'VRM', 'VOS', 'VAC',
];

async function seed() {
  console.log('Clearing existing prefix data...');
  try {
    await db.prefix.deleteMany({});
    console.log('  Cleared all existing prefixes.');

    console.log('Seeding Prefix table...');
    let created = 0;
    for (const prefixCode of PREFIX_SEED) {
      await db.prefix.create({ data: { prefixCode } });
      console.log(`  Created : ${prefixCode}`);
      created++;
    }
    console.log(`\nSeeding complete. Created: ${created}`);
  } catch (err) {
    console.error('Error seeding prefixes:', err);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

seed();
