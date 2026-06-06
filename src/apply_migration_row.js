import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://postgres:password@localhost:5432/velson_db"
});

async function main() {
  const migrationName = "20260606000000_add_machine_manufacture_price";
  const migrationSqlPath = path.join(process.cwd(), "prisma", "migrations", migrationName, "migration.sql");
  const sqlContent = fs.readFileSync(migrationSqlPath, 'utf8');

  // Compute checksum (Prisma computes SHA256 of the migration.sql content)
  const checksum = crypto.createHash('sha256').update(sqlContent).digest('hex');
  console.log("Computed checksum:", checksum);

  const uuid = crypto.randomUUID();
  const now = new Date();

  await client.connect();

  // Check if it already exists
  const checkRes = await client.query("SELECT id FROM _prisma_migrations WHERE migration_name = $1", [migrationName]);
  if (checkRes.rows.length > 0) {
    console.log("Migration is already registered in the database. Updating checksum...");
    await client.query("UPDATE _prisma_migrations SET checksum = $1 WHERE migration_name = $2", [checksum, migrationName]);
    console.log("Checksum updated successfully.");
  } else {
    // Insert into _prisma_migrations
    await client.query(
      `INSERT INTO _prisma_migrations (
        id, 
        checksum, 
        finished_at, 
        migration_name, 
        logs, 
        rolled_back_at, 
        started_at, 
        applied_steps_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [uuid, checksum, now, migrationName, null, null, now, 1]
    );
    console.log("Successfully registered migration in _prisma_migrations table.");
  }

  // Clean up shadow database
  try {
    const shadowClient = new Client({
      connectionString: "postgresql://postgres:password@localhost:5432/postgres"
    });
    await shadowClient.connect();
    await shadowClient.query("DROP DATABASE IF EXISTS velson_shadow_db WITH (FORCE)");
    await shadowClient.end();
    console.log("Successfully dropped velson_shadow_db.");
  } catch (err) {
    console.warn("Failed to drop velson_shadow_db:", err.message);
  }

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
