import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Mirror the same DB_ENV selection logic used in src/config/db.js
const isNeon = process.env.DB_ENV === "neon";
const connectionString = isNeon
  ? process.env.NEON_DATABASE_URL
  : process.env.DOCKER_DATABASE_URL;

if (!connectionString) {
  console.error("No connection string found. Set NEON_DATABASE_URL or DOCKER_DATABASE_URL in .env");
  process.exit(1);
}

console.log(`Using DB: ${isNeon ? "neon" : "docker"}`);

const adapter = new PrismaPg(
  new pg.Pool({
    connectionString,
    max: 3,
    connectionTimeoutMillis: 10000,
  })
);
const prisma = new PrismaClient({ adapter });

const USERS = [
  { name: "Administrator", email: "admin@admin.com", password: "password123", role: "admin" },
  { name: "Staff User",    email: "staff@staff.com", password: "password123", role: "staff" },
  { name: "Basic User",   email: "user@user.com",   password: "password123", role: "user"  },
];

async function main() {
  // Ensure UserCredential table exists before seeding
  await prisma.$executeRaw`SELECT 1`.catch(() => {
    throw new Error("Cannot connect to database. Check your .env and ensure the DB is reachable.");
  });

  for (const u of USERS) {
    const hashed = await bcrypt.hash(u.password, 10);

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name },
      create: { name: u.name, email: u.email },
    });

    await prisma.userCredential.upsert({
      where: { userId: user.id },
      update: { password: hashed, role: u.role, isActive: true },
      create: {
        userId: user.id,
        username: u.email,
        password: hashed,
        role: u.role,
        isActive: true,
      },
    });

    console.log(`✓ Seeded: ${u.email} (${u.role})`);
  }

  console.log("\nDone. Default password for all accounts: password123");
}

main()
  .catch(err => {
    console.error("Seed failed:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
