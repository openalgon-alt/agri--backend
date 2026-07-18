import { query } from '../../api/_lib/cloudsql.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mobile, password, name, college, district, category } = req.body;

  if (!mobile || !password || !name || !college || !district) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Check if user already exists
    const existing = await query(
      'SELECT id FROM ao_aao_students WHERE mobile = $1 LIMIT 1',
      [mobile]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'A user with this mobile number already exists.' });
    }

    // Insert user
    const result = await query(
      `INSERT INTO ao_aao_students (mobile, password, name, college, district, category)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, mobile, name, college, district, category, created_at`,
      [mobile, password, name, college, district, category || 'General']
    );

    return res.status(200).json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
