import { query } from '../../api/_lib/cloudsql.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mobile, password } = req.body;

  if (!mobile || !password) {
    return res.status(400).json({ error: 'Mobile number and password are required.' });
  }

  try {
    const result = await query(
      'SELECT id, mobile, name, college, district, category, password, created_at FROM ao_aao_students WHERE mobile = $1 LIMIT 1',
      [mobile]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User not found. Please register first.' });
    }

    const user = result.rows[0];
    if (user.password !== password) {
      return res.status(400).json({ error: 'Invalid password.' });
    }

    // Don't return password
    delete user.password;

    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
