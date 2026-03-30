import { query } from '../../../api/_lib/cloudsql.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await query(`
      SELECT 
        firebase_uid AS id,
        name,
        email,
        mobile AS phone,
        college,
        district,
        created_at
      FROM student_profiles
      ORDER BY created_at DESC
    `);

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json({ error: err.message });
  }
}
