import { PrismaClient } from "../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Prisma v7 requires a driver adapter instead of datasourceUrl
export const neonPrisma = new PrismaClient({
  adapter: new PrismaPg(new pg.Pool({ connectionString: process.env.NEON_DATABASE_URL })),
});

export const dockerPrisma = new PrismaClient({
  adapter: new PrismaPg(new pg.Pool({ connectionString: process.env.DOCKER_DATABASE_URL })),
});

export async function checkConnections() {
  const results = await Promise.allSettled([
    neonPrisma.$queryRaw`SELECT 1`.then(() => "neon    ✓ connected"),
    dockerPrisma.$queryRaw`SELECT 1`.then(() => "docker  ✓ connected"),
  ]);

  results.forEach((r, i) => {
    const label = i === 0 ? "neon" : "docker";
    if (r.status === "fulfilled") console.log(`[DB] ${r.value}`);
    else console.warn(`[DB] ${label}  ✗ unreachable — ${r.reason?.message}`);
  });
}
