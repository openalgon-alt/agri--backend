import { query } from '../../api/_lib/neon.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { submission_id, answers, total_questions, user_id } = req.body;

    if (!submission_id || !user_id) {
      return res.status(400).json({ error: 'Missing submission_id or user_id' });
    }

    // Auto-migrate: Ensure exam_submissions table exists in Cloud SQL
    await query(`
      CREATE TABLE IF NOT EXISTS exam_submissions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        mock_test_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER DEFAULT 50,
        answers JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure new columns exist if the table was created before the new features
    await query(`ALTER TABLE exam_submissions ADD COLUMN IF NOT EXISTS answers JSONB`);
    await query(`ALTER TABLE exam_submissions ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 50`);
    await query(`ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0`);

    // 1. Get the attempt from Cloud SQL
    const { rows: attempts } = await query(
      'SELECT test_id FROM test_attempts WHERE id = $1',
      [submission_id]
    );

    if (attempts.length === 0) {
      return res.status(404).json({ error: 'Attempt not found in Cloud SQL' });
    }

    const testId = attempts[0].test_id;

    // 2. Fetch all questions for this test from Cloud SQL
    const { rows: questions } = await query(
      'SELECT * FROM mock_questions WHERE mock_test_id = $1',
      [testId]
    );

    let score = 0;
    let populatedQuestions = [];

    // 3. Calculate score
    if (questions && Array.isArray(questions) && answers) {
      populatedQuestions = questions.map(q => {
        const userAnswer = answers[q.id];
        const options = q.options || [];
        const correctIndex = q.correct_option_index ?? 0;
        const correctOption = options[correctIndex];

        if (userAnswer === correctOption) {
          score += (q.marks || 4);
        }

        return {
          id: q.id,
          mock_test_id: q.mock_test_id,
          question_text: q.question_text || q.question,
          options: options,
          correct_option_index: correctIndex,
          image_url: q.image_url || q.image,
          marks: q.marks,
          topic: q.topic
        };
      });
    }

    // 4. Save to Cloud SQL exam_submissions
    const { rows: submissions } = await query(
      'INSERT INTO exam_submissions (user_id, mock_test_id, score, total_questions, answers) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [user_id, testId, score, total_questions || questions.length || 50, JSON.stringify(answers || {})]
    );

    const submissionId = submissions[0].id;

    // 5. Mark the test_attempt as completed in Cloud SQL
    await query(
      'UPDATE test_attempts SET completed_at = $1, score = $2 WHERE id = $3',
      [new Date().toISOString(), score, submission_id]
    );

    return res.status(200).json({
      success: true,
      score,
      submission_id: submissionId,
      questions: populatedQuestions
    });

  } catch (err) {
    console.error("Submission Error (submit-test):", err);
    return res.status(500).json({ error: err.message });
  }
}
