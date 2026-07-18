import { query } from './api/_lib/db.js';

async function testTopics() {
    try {
        const result = await query(`SELECT DISTINCT topic FROM mock_questions`);
        console.log("Found topics:");
        console.dir(result.rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

testTopics();
