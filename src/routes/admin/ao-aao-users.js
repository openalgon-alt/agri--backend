import { query } from '../../../api/_lib/cloudsql.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await query(
      'SELECT id, mobile, name, college, district, category, created_at FROM ao_aao_students ORDER BY created_at DESC;'
    );
    return res.status(200).json({ users: result.rows });
  } catch (err) {
    console.error('Error fetching AO/AAO users:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
