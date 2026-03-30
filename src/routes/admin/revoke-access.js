import { query } from '../../../api/_lib/cloudsql.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id query param required' });

  try {
    const result = await query(
      `DELETE FROM user_purchases WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error revoking access:', err);
    return res.status(500).json({ error: err.message });
  }
}
