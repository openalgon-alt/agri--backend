import { query } from './api/_lib/neon.js';

async function main() {
  try {
    const res = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'mock_tests'");
    console.log(JSON.stringify(res.rows));
  } catch(e) {
    console.error(e);
  }
}
main();
