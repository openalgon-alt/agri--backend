import { query } from '../../../api/_lib/cloudsql.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ensure table exists
    await query(`
      CREATE TABLE IF NOT EXISTS user_purchases (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        mock_test_id INTEGER NOT NULL,
        email TEXT,
        amount NUMERIC DEFAULT 0,
        status TEXT DEFAULT 'active',
        payment_method TEXT DEFAULT 'Online',
        granted_by_admin BOOLEAN DEFAULT true,
        purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migrate existing tables that may be missing columns
    const migrations = [
      `ALTER TABLE user_purchases ADD COLUMN IF NOT EXISTS email TEXT`,
      `ALTER TABLE user_purchases ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Online'`,
      `ALTER TABLE user_purchases ADD COLUMN IF NOT EXISTS granted_by_admin BOOLEAN DEFAULT true`,
      `ALTER TABLE user_purchases ADD COLUMN IF NOT EXISTS purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`,
    ];
    for (const sql of migrations) {
      try { await query(sql); } catch (_) { /* ignore */ }
    }

    const result = await query(`
      SELECT 
        up.*,
        mt.title AS test_title,
        COALESCE(up.email, sp.email, up.user_id) AS user_email,
        COALESCE(sp.name, up.email, up.user_id) AS user_name
      FROM user_purchases up
      LEFT JOIN mock_tests mt ON up.mock_test_id = mt.id
      LEFT JOIN student_profiles sp ON sp.firebase_uid = up.user_id OR sp.email = up.email
      ORDER BY up.purchase_date DESC
    `);

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching purchases:', err);
    return res.status(500).json({ error: err.message });
  }
}
