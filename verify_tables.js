import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config({ path: '../agricatagolues/.env' }); // load from frontend env ?
// actually let me check if that works

const pool = new Pool({
  connectionString: process.env.CLOUD_SQL_URL || 'postgresql://agricatalogues_plux:KkO90I2S1Z@34.133.58.117:5432/agricatalogues_plux',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const res1 = await pool.query("SELECT * FROM information_schema.columns WHERE table_name = 'exam_submissions'");
    console.log("exam_submissions:", res1.rows.map(r => r.column_name));
    
    const res2 = await pool.query("SELECT * FROM information_schema.columns WHERE table_name = 'test_attempts'");
    console.log("test_attempts:", res2.rows.map(r => r.column_name));
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
main();
