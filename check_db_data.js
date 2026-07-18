import { query } from './db_local.js';

async function check() {
  try {
    const res = await query(`
      SELECT id, firebase_uid, name, email, mobile, college, district, created_at 
      FROM student_profiles 
      ORDER BY created_at DESC 
      LIMIT 10;
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
check();
