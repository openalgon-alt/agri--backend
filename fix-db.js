import { query } from './api/_lib/db.js';

async function fixTable() {
    try {
        console.log("Fixing table exam_submissions...");
        await query(`ALTER TABLE exam_submissions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
        console.log("Success.");
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        process.exit();
    }
}
fixTable();
