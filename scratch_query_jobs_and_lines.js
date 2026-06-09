import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DOCKER_DATABASE_URL
});

async function main() {
  try {
    const res = await pool.query('SELECT * FROM job_card WHERE "jobNo" = \'2\'');
    console.log('Job Card 2:', res.rows[0]);
    if (res.rows[0]) {
      const items = await pool.query('SELECT * FROM job_card_line_item WHERE "jobCardId" = $1', [res.rows[0].id]);
      console.log('Line Items for Job Card 2:', items.rows);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();
