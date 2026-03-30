import { query } from '../../api/_lib/neon.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId query param required' });

  try {
    // 1. Fetch submissions for this user from Cloud SQL
    let submissions = [];
    try {
        const result = await query(
          `SELECT s.id, s.user_id, s.mock_test_id as t_mock_test_id, s.score, s.total_questions, s.answers, s.created_at, t.title as test_title
           FROM exam_submissions s
           LEFT JOIN mock_tests t ON s.mock_test_id = t.id
           WHERE s.user_id = $1
           ORDER BY s.created_at DESC`,
          [userId]
        );
        submissions = result.rows;
    } catch (dbErr) {
        if (dbErr.message && dbErr.message.includes('column s.mock_test_id does not exist')) {
            // Fallback for older exam_submissions schemas
            const resultFallback = await query(
              `SELECT s.id, s.user_id, s.test_id as t_mock_test_id, s.score, s.total_questions, s.answers, s.created_at, t.title as test_title
               FROM exam_submissions s
               LEFT JOIN mock_tests t ON s.test_id = t.id
               WHERE s.user_id = $1
               ORDER BY s.created_at DESC`,
              [userId]
            );
            submissions = resultFallback.rows;
        } else {
            throw dbErr;
        }
    }

    return res.status(200).json(formatSubmissions(submissions || []));

  } catch (err) {
    if (err.message && err.message.includes('relation "exam_submissions" does not exist')) {
      return res.status(200).json([]);
    }
    console.error('Error (get-user-submissions):', err);
    return res.status(500).json({ error: err.message });
  }
}

function formatSubmissions(rows) {
  return rows.map(s => ({
    id: s.id,
    userId: s.user_id,
    mockTestId: s.t_mock_test_id,
    testTitle: s.test_title || `Mock Test #${s.t_mock_test_id}`,
    score: s.score || 0,
    totalQuestions: s.total_questions || 50,
    answers: s.answers || {},
    submittedAt: s.created_at
  }));
}
