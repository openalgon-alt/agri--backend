import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {

    const { user_id, test_id } = req.body;

    if (!user_id || !test_id) {
      return res.status(400).json({ error: 'Missing user_id or test_id' });
    }

    // Check if user already attempted this test
    const { data: existingAttempt, error: existingError } = await supabase
      .from('test_attempts')
      .select('id')
      .eq('user_id', user_id)
      .eq('test_id', test_id)
      .single();

    if (existingAttempt) {
      return res.status(400).json({ error: 'Free test already attempted' });
    }

    // If error is not "no rows found", return error
    if (existingError && existingError.code !== 'PGRST116') {
      return res.status(500).json({ error: existingError.message });
    }

    // Get test duration
    const { data: test, error: testError } = await supabase
      .from('mock_tests')
      .select('duration_minutes')
      .eq('id', test_id)
      .single();

    if (testError || !test) {
      return res.status(500).json({ error: 'Test not found' });
    }

    const expiresAt = new Date(Date.now() + test.duration_minutes * 60000);

    // Create new attempt
    const { data: newAttempt, error: insertError } = await supabase
      .from('test_attempts')
      .insert({
        user_id,
        test_id,
        expires_at: expiresAt
      })
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    return res.status(200).json({
      attempt_id: newAttempt.id,
      expires_at: expiresAt
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}