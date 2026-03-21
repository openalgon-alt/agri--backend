import { query } from '../_lib/neon.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: "Missing required id" });
    }

    // 1. Delete dependent records via Neon DB to prevent foreign key constraint errors
    const tablesWithMockTestId = ['mock_questions', 'exam_submissions'];
    for (const table of tablesWithMockTestId) {
      try { await query(`DELETE FROM ${table} WHERE mock_test_id = $1`, [id]); } catch(e) { console.warn(`Skipped ${table} deletion`, e.message); }
    }
    const tablesWithTestId = ['test_attempts'];
    for (const table of tablesWithTestId) {
      try { await query(`DELETE FROM ${table} WHERE test_id = $1`, [id]); } catch(e) { console.warn(`Skipped ${table} deletion`, e.message); }
    }
    try { await query(`DELETE FROM user_purchases WHERE mock_test_id = $1`, [id]); } catch(e) { }

    // 2. Also try deleting from Supabase in case user_purchases is managed there separately
    try {
      const { supabase } = await import('../_lib/supabase.js');
      await supabase.from('user_purchases').delete().eq('mock_test_id', id);
    } catch (e) { console.warn('Skipped Supabase purchase deletion', e.message); }

    // 3. Finally, delete the mock test
    await query('DELETE FROM mock_tests WHERE id = $1', [id]);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
