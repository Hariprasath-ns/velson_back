import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DOCKER_DATABASE_URL
});

async function main() {
  try {
    const res = await pool.query('SELECT id, "partNo", "partName", "imageMimeType", "imagePath", ("imageData" IS NOT NULL) AS has_image_data FROM item_master LIMIT 50');
    console.log('Items in DB:', res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();
