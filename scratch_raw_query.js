import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DOCKER_DATABASE_URL
});

async function main() {
  try {
    const res = await pool.query('SELECT * FROM job_card');
    console.log('Raw rows from DB:', res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();
