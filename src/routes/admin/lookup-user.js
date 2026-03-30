import { query } from '../../../api/_lib/cloudsql.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'email query param required' });

  try {
    const trimmed = email.trim();

    const result = await query(
      `SELECT firebase_uid AS user_id, name, email, mobile AS phone
       FROM student_profiles
       WHERE email = $1 OR firebase_uid = $1
       LIMIT 1`,
      [trimmed]
    );

    if (result.rows.length > 0) {
      return res.status(200).json({ ...result.rows[0], _synthetic: false });
    }

    // Not found — return a synthetic record so admin can still grant
    return res.status(200).json({
      user_id: trimmed,
      name: null,
      email: trimmed.includes('@') ? trimmed : null,
      phone: null,
      _synthetic: true
    });
  } catch (err) {
    console.error('Error looking up user:', err);
    return res.status(500).json({ error: err.message });
  }
}
