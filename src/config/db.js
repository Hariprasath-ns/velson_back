import { PrismaClient } from "../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Prisma v7 requires a driver adapter instead of datasourceUrl
const poolOpts = (connectionString) => ({
  connectionString,
  max: 10,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
})

const neonUrl = process.env.NEON_DATABASE_URL;
export const neonPrisma = neonUrl
  ? new PrismaClient({
      adapter: new PrismaPg(new pg.Pool(poolOpts(neonUrl))),
    })
  : null;

const dockerUrl = process.env.DOCKER_DATABASE_URL || process.env.DATABASE_URL;

export const dockerPrisma = new PrismaClient({
  adapter: new PrismaPg(new pg.Pool(poolOpts(dockerUrl))),
});

export async function checkConnections() {
  const checks = [];
  if (neonPrisma) {
    checks.push(neonPrisma.$queryRaw`SELECT 1`.then(() => "neon    ✓ connected"));
  } else {
    console.log("[DB] neon    – skipped (NEON_DATABASE_URL not set)");
  }
  checks.push(dockerPrisma.$queryRaw`SELECT 1`.then(() => "docker  ✓ connected"));

  const results = await Promise.allSettled(checks);

  results.forEach((r, i) => {
    const label = neonPrisma ? (i === 0 ? "neon" : "docker") : "docker";
    if (r.status === "fulfilled") console.log(`[DB] ${r.value}`);
    else console.warn(`[DB] ${label}  ✗ unreachable — ${r.reason?.message}`);
  });
}
