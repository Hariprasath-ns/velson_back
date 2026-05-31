import { dockerPrisma } from './src/config/db.js';

async function test() {
  try {
    const rows = await dockerPrisma.$queryRaw`SELECT "cCode" FROM customer_master WHERE "cCode" ~ '^CUS[0-9]+$' ORDER BY CAST(SUBSTRING("cCode" FROM 4) AS INTEGER) DESC LIMIT 1`;
    console.log('Rows:', rows);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    process.exit(0);
  }
}
test();
