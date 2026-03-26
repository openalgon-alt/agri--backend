import pool from './api/_lib/neon.js';

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // MOCK TESTS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS mock_tests (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        price NUMERIC DEFAULT 0,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // MOCK QUESTIONS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS mock_questions (
        id SERIAL PRIMARY KEY,
        mock_test_id INTEGER REFERENCES mock_tests(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_option_index INTEGER NOT NULL,
        image_url TEXT,
        marks INTEGER DEFAULT 4,
        topic TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // EXAM SUBMISSIONS TABLE - user_id is TEXT for Firebase Auth UID
    await client.query(`
      CREATE TABLE IF NOT EXISTS exam_submissions (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        mock_test_id INTEGER REFERENCES mock_tests(id) ON DELETE CASCADE,
        score NUMERIC NOT NULL,
        total_questions INTEGER NOT NULL,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // TEST ATTEMPTS TABLE - optional but referenced in submit-test.js
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_attempts (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        test_id INTEGER REFERENCES mock_tests(id) ON DELETE CASCADE,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE,
        score NUMERIC
      );
    `);

    await client.query('COMMIT');
    console.log('Neon Database initialized successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to initialize Neon DB:', error);
  } finally {
    client.release();
    pool.end();
  }
}

initDB();
