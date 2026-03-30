import { query } from '../../api/_lib/cloudsql.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId query param required' });

  try {
    const result = await query(`
      SELECT 
        id,
        user_id AS "userId",
        mock_test_id AS "mockTestId",
        amount,
        status,
        purchase_date AS "purchasedAt",
        payment_method AS "paymentMethod",
        granted_by_admin AS "grantedByAdmin"
      FROM user_purchases
      WHERE user_id = $1 AND status = 'active'
    `, [userId]);

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching user purchases:', err);
    return res.status(200).json([]); // Return empty if table doesn't exist yet
  }
}
