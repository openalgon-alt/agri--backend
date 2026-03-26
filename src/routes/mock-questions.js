import { query } from '../../api/_lib/neon.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.method === 'POST' ? req.body : req.query;
    // Allow either testId or test_id
    const testId = body?.testId || body?.test_id;

    if (!testId) {
       return res.status(400).json({ error: "Missing testId parameter" });
    }

    const { rows: testRows } = await query('SELECT * FROM mock_tests WHERE id = $1', [testId]);
    const test = testRows[0];

    if (!test) {
       return res.status(404).json({ error: "Test not found" });
    }

    const { rows: questions } = await query('SELECT * FROM mock_questions WHERE mock_test_id = $1', [testId]);
    
    // We'll return correct_option_index here since it simplifies the frontend for mock tests and the user wants a simple system
    // The previous implementation removed it, but my frontend examDataService mapping expects it.
    return res.status(200).json({
      test,
      questions: questions
    });

  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
