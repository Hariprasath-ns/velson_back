import { neonPrisma, dockerPrisma } from './src/config/db.js';

async function main() {
  console.log("Querying Docker Database...");
  try {
    const dockerCount = await dockerPrisma.creditSales.count();
    console.log("Docker Credit Sales count:", dockerCount);
    const dockerSales = await dockerPrisma.creditSales.findMany({
      take: 5
    });
    console.log("Docker Sales:", dockerSales);
  } catch (err) {
    console.error("Docker error:", err.message);
  }

  console.log("Querying Neon Database...");
  try {
    const neonCount = await neonPrisma.creditSales.count();
    console.log("Neon Credit Sales count:", neonCount);
    const neonSales = await neonPrisma.creditSales.findMany({
      take: 5
    });
    console.log("Neon Sales:", neonSales);
  } catch (err) {
    console.error("Neon error:", err.message);
  }
}

main().finally(() => {
  dockerPrisma.$disconnect();
  neonPrisma.$disconnect();
});
