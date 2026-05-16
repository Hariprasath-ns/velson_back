// seedPartNumberBase.js — seeds CategoryMaster, SubCategoryMaster, PartNumberBase
import { PrismaClient } from './src/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DB_ENV === 'neon'
  ? process.env.NEON_DATABASE_URL
  : process.env.DOCKER_DATABASE_URL;

const prisma = new PrismaClient({
  adapter: new PrismaPg(new pg.Pool({ connectionString: dbUrl })),
});

const SEED_DATA = [
  {
    categoryName: 'STORE',
    subCategories: [
      { subCategoryName: 'TOOLS',              prefixCode: 'VT',  description: 'Tools and equipment',           digitCount: 5, startingNumber: 10,      endingNumber: 9999    },
      { subCategoryName: 'ASSEMBLY',           prefixCode: 'VA',  description: 'Assembly components',           digitCount: 5, startingNumber: 10010,   endingNumber: 19999   },
      { subCategoryName: 'GEAR BOX',           prefixCode: 'VG',  description: 'Gear box parts',                digitCount: 5, startingNumber: 20010,   endingNumber: 29999   },
      { subCategoryName: 'HYDRAULIC CYLINDER', prefixCode: 'VHC', description: 'Hydraulic cylinder parts',      digitCount: 5, startingNumber: 30010,   endingNumber: 39999   },
      { subCategoryName: 'HYDRAULIC PUMP',     prefixCode: 'VHP', description: 'Hydraulic pump components',     digitCount: 5, startingNumber: 40010,   endingNumber: 49999   },
      { subCategoryName: 'HYDRAULIC MOTOR',    prefixCode: 'VHM', description: 'Hydraulic motor components',    digitCount: 5, startingNumber: 50010,   endingNumber: 59999   },
      { subCategoryName: 'HYDRAULIC VALVE',    prefixCode: 'VHV', description: 'Hydraulic valve parts',         digitCount: 5, startingNumber: 60010,   endingNumber: 69999   },
      { subCategoryName: 'ELECTRICAL',         prefixCode: 'VE',  description: 'Electrical components',         digitCount: 5, startingNumber: 70010,   endingNumber: 79999   },
      { subCategoryName: 'HYDRAULIC',          prefixCode: 'VH',  description: 'General hydraulic parts',       digitCount: 5, startingNumber: 80010,   endingNumber: 89999   },
      { subCategoryName: 'FASTNER',            prefixCode: 'VF',  description: 'Fasteners and fittings',        digitCount: 5, startingNumber: 90010,   endingNumber: 99999   },
    ],
  },
  {
    categoryName: 'VEHICLE MODELS',
    subCategories: [
      { subCategoryName: 'COMMON',                    prefixCode: 'VC',  description: 'Common vehicle parts',          digitCount: 6, startingNumber: 100010,  endingNumber: 199999  },
      { subCategoryName: 'V2-I MYRMAX',               prefixCode: 'VM',  description: 'V2-I Myrmax model parts',        digitCount: 6, startingNumber: 200010,  endingNumber: 299999  },
      { subCategoryName: 'V3 - CISADA',               prefixCode: 'VCS', description: 'V3 Cisada model parts',          digitCount: 6, startingNumber: 300010,  endingNumber: 399999  },
      { subCategoryName: 'V4 - MINI MYRMAX',          prefixCode: 'VMM', description: 'V4 Mini Myrmax parts',           digitCount: 6, startingNumber: 400010,  endingNumber: 499999  },
      { subCategoryName: 'CORE DRILL',                prefixCode: 'VCD', description: 'Core drill components',          digitCount: 6, startingNumber: 500010,  endingNumber: 519999  },
      { subCategoryName: 'RC-REVERSE CIRCULATION',    prefixCode: 'VRC', description: 'RC reverse circulation parts',   digitCount: 6, startingNumber: 600010,  endingNumber: 699999  },
      { subCategoryName: 'V1 - MYRMAX',               prefixCode: 'VOM', description: 'V1 Myrmax model parts',          digitCount: 6, startingNumber: 800010,  endingNumber: 899999  },
      { subCategoryName: 'V9 - CISADA V+',            prefixCode: 'VCV', description: 'V9 Cisada V+ parts',             digitCount: 6, startingNumber: 900010,  endingNumber: 999999  },
      { subCategoryName: 'V10 - GROUND HOG',          prefixCode: 'VGH', description: 'V10 Ground Hog parts',           digitCount: 7, startingNumber: 1000010, endingNumber: 1099999 },
      { subCategoryName: 'V2-MYRMAX-GEARBOX MODEL',   prefixCode: 'VGM', description: 'V2 Myrmax gearbox model parts',  digitCount: 7, startingNumber: 1200010, endingNumber: 1299999 },
    ],
  },
  {
    categoryName: 'PRODUCTION PROCESS',
    subCategories: [
      { subCategoryName: 'VELSON CUSTOMER REQUIREMENT', prefixCode: 'VCR', description: 'Customer-specific parts',      digitCount: 7, startingNumber: 2000010, endingNumber: 2999999 },
      { subCategoryName: 'RAW MATERIAL',                prefixCode: 'VRM', description: 'Raw material items',           digitCount: 7, startingNumber: 3000010, endingNumber: 3999999 },
      { subCategoryName: 'VELSON OUTSOURCE',            prefixCode: 'VOS', description: 'Outsourced production items',  digitCount: 7, startingNumber: 4000010, endingNumber: 4999999 },
      { subCategoryName: 'VELSON ACCESSORIES',          prefixCode: 'VAC', description: 'Velson accessories',           digitCount: 7, startingNumber: 5000010, endingNumber: 5999999 },
      { subCategoryName: 'LASER CUTTING OS',            prefixCode: 'VLC', description: 'Laser cutting outsource',      digitCount: 7, startingNumber: 7000000, endingNumber: 7999999 },
    ],
  },
];

async function main() {
  console.log('Seeding CategoryMaster, SubCategoryMaster, PartNumberBase …');

  for (const catData of SEED_DATA) {
    const category = await prisma.categoryMaster.upsert({
      where: { categoryName: catData.categoryName },
      update: {},
      create: { categoryName: catData.categoryName },
    });
    console.log(`  ✓ Category: ${category.categoryName} (id=${category.id})`);

    for (const sub of catData.subCategories) {
      const subCat = await prisma.subCategoryMaster.upsert({
        where: { categoryId_subCategoryName: { categoryId: category.id, subCategoryName: sub.subCategoryName } },
        update: { prefixCode: sub.prefixCode, description: sub.description },
        create: {
          categoryId:      category.id,
          subCategoryName: sub.subCategoryName,
          prefixCode:      sub.prefixCode,
          description:     sub.description,
        },
      });
      console.log(`    ✓ SubCategory: ${subCat.subCategoryName} (prefix=${subCat.prefixCode})`);

      const existing = await prisma.partNumberBase.findFirst({
        where: { subCategoryId: subCat.id },
      });

      if (!existing) {
        const totalNumbers = sub.endingNumber - sub.startingNumber;
        await prisma.partNumberBase.create({
          data: {
            categoryId:           category.id,
            subCategoryId:        subCat.id,
            prefixCode:           sub.prefixCode,
            digitCount:           sub.digitCount,
            startingNumber:       sub.startingNumber,
            endingNumber:         sub.endingNumber,
            currentRunningNumber: sub.startingNumber,
            totalNumbers,
            isActive:             true,
          },
        });
        console.log(`      ✓ PartNumberBase: ${sub.prefixCode} [${sub.startingNumber}–${sub.endingNumber}]`);
      } else {
        console.log(`      - PartNumberBase already exists for ${sub.prefixCode}, skipped`);
      }
    }
  }

  console.log('\n✅ seedPartNumberBase complete.');
}

main()
  .catch(err => { console.error('Seed error:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
