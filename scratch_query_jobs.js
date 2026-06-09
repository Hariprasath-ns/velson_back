import { dockerPrisma } from './src/config/db.js';

async function main() {
  try {
    const jobs = await dockerPrisma.jobCard.findMany();
    console.log('Jobs from Prisma:', jobs);
  } catch (err) {
    console.error('Error fetching jobs:', err);
  } finally {
    await dockerPrisma.$disconnect();
  }
}

main();
