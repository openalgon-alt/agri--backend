import { query } from './api/_lib/db.js';

async function test() {
    try {
        const { rows } = await query('SELECT * FROM exam_submissions LIMIT 5');
        console.log("Submissions:");
        console.log(rows);
        
        if (rows.length > 0) {
            const uid = rows[0].user_id;
            console.log("\nTesting user-performance logic for user:", uid);
            
            const result = await query(
                `SELECT s.id, s.user_id, s.mock_test_id, s.score, s.total_questions, s.answers, s.created_at
                 FROM exam_submissions s
                 WHERE s.user_id = $1`,
                [uid]
            );
            console.log("User Submissions Count:", result.rows.length);
            
            const testIds = [...new Set(result.rows.map(s => s.mock_test_id).filter(id => id != null))];
            console.log("Test IDs:", testIds);
            
            if (testIds.length > 0) {
                const questionsResult = await query(
                    `SELECT id, mock_test_id, options, correct_option_index, marks, topic 
                     FROM mock_questions 
                     WHERE mock_test_id = ANY ($1::int[])`,
                    [testIds]
                );
                console.log("Questions Count:", questionsResult.rows.length);
                if (questionsResult.rows.length > 0) {
                     console.log("Sample question topic:", questionsResult.rows[0].topic);
                }
            }
        }
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        process.exit();
    }
}
test();
