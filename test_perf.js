import { query } from './api/_lib/db.js';

async function testUserPerf() {
    try {
        const { rows: users } = await query('SELECT DISTINCT user_id FROM exam_submissions WHERE user_id IS NOT NULL LIMIT 1');
        if (users.length === 0) { console.log("No valid user IDs found"); return; }
        const uid = users[0].user_id;
        console.log("Found user ID:", uid);
        
        let submissions = [];
        try {
            const result = await query(
              `SELECT id, user_id, mock_test_id, score, total_questions, answers
               FROM exam_submissions
               WHERE user_id = $1`,
              [uid]
            );
            submissions = result.rows;
        } catch (dbErr) {
            console.log("Error selecting mock_test_id:", dbErr.message);
            if (dbErr.message && dbErr.message.includes('column "mock_test_id" does not exist')) {
                const resultFallback = await query(
                  `SELECT id, user_id, test_id as mock_test_id, score, total_questions, answers
                   FROM exam_submissions
                   WHERE user_id = $1`,
                  [uid]
                );
                submissions = resultFallback.rows;
            } else {
                throw dbErr;
            }
        }
        
        console.log("Submissions found:", submissions.length);
        const testIds = [...new Set(submissions.map(s => s.mock_test_id).filter(id => id != null))];
        console.log("Test IDs:", testIds);
        
        const questionsResult = await query(
            `SELECT id, mock_test_id, options, correct_option_index, marks, topic 
             FROM mock_questions 
             WHERE mock_test_id = ANY ($1::int[])`,
            [testIds]
        );
        console.log("Questions found:", questionsResult.rows.length);
        
        let sumScore = 0;
        let totalAttempts = submissions.length;
        for (const sub of submissions) {
            sumScore += (sub.score || 0);
        }
        console.log("Average Score:", Math.round(sumScore / totalAttempts));
    } catch (e) {
        console.error("Fatal Error:", e.message);
    } finally {
        process.exit();
    }
}
testUserPerf();
