import { query } from '../../api/_lib/neon.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { submission_id, question_id, answer, user_id } = req.body;

    if (!submission_id || !question_id || !answer || !user_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Auto-migrate: Ensure test_answers table exists in Cloud SQL
    await query(`
      CREATE TABLE IF NOT EXISTS test_answers (
        id SERIAL PRIMARY KEY,
        attempt_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        answer TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (attempt_id, question_id)
      )
    `);

    // Upsert logic for Cloud SQL
    await query(`
      INSERT INTO test_answers (attempt_id, question_id, answer)
      VALUES ($1, $2, $3)
      ON CONFLICT (attempt_id, question_id)
      DO UPDATE SET answer = EXCLUDED.answer, updated_at = CURRENT_TIMESTAMP
    `, [submission_id, question_id, answer]);

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Save-Answer Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
