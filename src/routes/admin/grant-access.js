import { query } from '../../../api/_lib/cloudsql.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, mockTestId, amount, paymentMethod } = req.body;

    if (!userId || mockTestId === undefined || mockTestId === null || !paymentMethod) {
      return res.status(400).json({
        error: `Missing required fields. Got: userId=${userId}, mockTestId=${mockTestId}, paymentMethod=${paymentMethod}`
      });
    }

    const parsedTestId = parseInt(mockTestId);
    if (isNaN(parsedTestId)) {
      return res.status(400).json({ error: `Invalid mockTestId: ${mockTestId}` });
    }

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
      try { await query(sql); } catch (_) { /* column may already exist */ }
    }

    // Add unique constraint if not exists
    try {
      await query(`ALTER TABLE user_purchases ADD CONSTRAINT uq_user_purchases_user_test UNIQUE (user_id, mock_test_id)`);
    } catch (_) { /* already exists */ }

    const emailToStore = userId.includes('@') ? userId : null;

    const result = await query(`
      INSERT INTO user_purchases (user_id, mock_test_id, email, amount, status, payment_method, granted_by_admin)
      VALUES ($1, $2, $3, $4, 'active', $5, true)
      ON CONFLICT (user_id, mock_test_id) DO UPDATE SET
        status = 'active',
        amount = EXCLUDED.amount,
        payment_method = EXCLUDED.payment_method,
        granted_by_admin = true,
        email = COALESCE(EXCLUDED.email, user_purchases.email)
      RETURNING *
    `, [userId, parsedTestId, emailToStore, amount || 0, paymentMethod]);

    console.log(`[grant-access] Granted: user=${userId}, test=${parsedTestId}`);
    return res.status(200).json({ success: true, record: result.rows[0] });

  } catch (err) {
    console.error('Error granting access:', err);
    return res.status(500).json({ error: err.message });
  }
}
