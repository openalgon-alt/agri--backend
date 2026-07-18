import { query } from './api/_lib/db.js';

async function checkTests() {
    try {
        const result = await query(`SELECT id, title, category FROM mock_tests LIMIT 20`);
        console.log("Found tests:");
        console.dir(result.rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkTests();
