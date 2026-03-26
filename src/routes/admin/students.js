import { query } from '../../../api/_lib/neon.js';

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await query(
      `SELECT * FROM student_profiles ORDER BY created_at DESC;`
    );

    return res.status(200).json({ students: result.rows });
  } catch (err) {
    console.error('Error fetching students:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
