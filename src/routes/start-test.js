import { query } from '../../api/_lib/neon.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, test_id, retake } = req.body;

    if (!user_id || !test_id) {
      return res.status(400).json({ error: 'Missing user_id or test_id' });
    }

    // Auto-migrate: Ensure test_attempts table exists in Cloud SQL
    await query(`
      CREATE TABLE IF NOT EXISTS test_attempts (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        test_id INTEGER NOT NULL,
        expires_at TIMESTAMP,
        completed_at TIMESTAMP,
        score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // If retake = true, delete any existing incomplete attempt so a fresh one is created
    if (retake) {
      await query(
        'DELETE FROM test_attempts WHERE user_id = $1 AND test_id = $2 AND completed_at IS NULL',
        [user_id, test_id]
      );
    } else {
      // Check for an existing incomplete attempt and return it to allow resume
      const { rows: existingAttempts } = await query(
        'SELECT id, expires_at FROM test_attempts WHERE user_id = $1 AND test_id = $2 AND completed_at IS NULL LIMIT 1',
        [user_id, test_id]
      );

      if (existingAttempts.length > 0) {
        const attempt = existingAttempts[0];
        const stillValid = attempt.expires_at ? new Date(attempt.expires_at) > new Date() : true;
        
        return res.status(200).json({
          attempt_id: attempt.id,
          expires_at: attempt.expires_at,
          resumed: true,
          still_valid: stillValid
        });
      }
    }

    // Fetch test duration from Cloud SQL mock_tests
    const { rows: tests } = await query(
      'SELECT duration_minutes FROM mock_tests WHERE id = $1',
      [test_id]
    );

    if (tests.length === 0) {
      return res.status(404).json({ error: 'Test not found in Cloud SQL' });
    }

    const durationMinutes = tests[0].duration_minutes || 50;
    const expiresAt = new Date(Date.now() + durationMinutes * 60000);

    const { rows: newAttempts } = await query(
      'INSERT INTO test_attempts (user_id, test_id, expires_at) VALUES ($1, $2, $3) RETURNING id',
      [user_id, test_id, expiresAt]
    );

    return res.status(200).json({
      attempt_id: newAttempts[0].id,
      expires_at: expiresAt,
      resumed: false
    });

  } catch (err) {
    console.error("Session Error (start-test):", err);
    return res.status(500).json({ error: err.message });
  }
}