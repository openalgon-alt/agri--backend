import { query } from '../../api/_lib/neon.js';

export default async function handler(req, res) {
  // CORS configuration
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

  // Allow both POST (which ExamDataService uses) and GET
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.method === 'POST' ? req.body : req.query;
    const activeOnly = body?.activeOnly !== false && body?.active_only !== 'false';

    let sqlQuery = 'SELECT * FROM mock_tests';
    const params = [];

    if (activeOnly) {
      sqlQuery += ' WHERE is_active = $1';
      params.push(true);
    }

    sqlQuery += ' ORDER BY created_at DESC';

    const { rows: mockTests } = await query(sqlQuery, params);

    return res.status(200).json(mockTests);
  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
