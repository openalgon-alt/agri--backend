import { query } from './api/_lib/db.js';

async function check() {
  try {
    const res = await query(`SELECT firebase_uid, name, email, mobile, college FROM student_profiles ORDER BY created_at DESC LIMIT 10;`);
    console.log(res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
check();
