import { neonPrisma, dockerPrisma } from "../src/config/db.js";

const dummyUsers = [
  { name: "Alice Johnson",  email: "alice@velson.dev"   },
  { name: "Bob Smith",      email: "bob@velson.dev"     },
  { name: "Charlie Brown",  email: "charlie@velson.dev" },
  { name: "Diana Prince",   email: "diana@velson.dev"   },
  { name: "Eve Adams",      email: "eve@velson.dev"     },
];

async function seedDB(prisma, label) {
  console.log(`\n[seed] ${label} — seeding ${dummyUsers.length} users...`);
  for (const user of dummyUsers) {
    await prisma.user.upsert({
      where:  { email: user.email },
      update: { name: user.name },
      create: user,
    });
    console.log(`  + ${user.name}`);
  }
  console.log(`[seed] ${label} ✓ done`);
}

async function main() {
  const results = await Promise.allSettled([
    seedDB(neonPrisma,   "Neon"),
    seedDB(dockerPrisma, "Docker"),
  ]);

  results.forEach((r) => {
    if (r.status === "rejected")
      console.error(`[seed] ✗ failed — ${r.reason?.message}`);
  });
}

main().finally(async () => {
  await neonPrisma.$disconnect();
  await dockerPrisma.$disconnect();
});
