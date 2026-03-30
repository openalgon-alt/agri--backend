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
    const { user_id, test_id, retake } = req.body;

    if (!user_id || !test_id) {
      return res.status(400).json({ error: 'Missing user_id or test_id' });
    }

    // If retake = true, delete any existing incomplete attempt so a fresh one is created
    if (retake) {
      await supabase
        .from('test_attempts')
        .delete()
        .eq('user_id', user_id)
        .eq('test_id', test_id);
    } else {
      // Check for an existing incomplete attempt and return it to allow resume
      const { data: existingAttempt } = await supabase
        .from('test_attempts')
        .select('id, expires_at')
        .eq('user_id', user_id)
        .eq('test_id', test_id)
        .single();

      if (existingAttempt) {
        const stillValid = existingAttempt.expires_at
          ? new Date(existingAttempt.expires_at) > new Date()
          : true;
        return res.status(200).json({
          attempt_id: existingAttempt.id,
          expires_at: existingAttempt.expires_at,
          resumed: true,
          still_valid: stillValid
        });
      }
    }

    // Fetch test duration
    const { data: test } = await supabase
      .from('mock_tests')
      .select('duration_minutes')
      .eq('id', test_id)
      .single();

    const durationMinutes = test?.duration_minutes || 50;
    const expiresAt = new Date(Date.now() + durationMinutes * 60000);

    const { data: newAttempt, error: insertError } = await supabase
      .from('test_attempts')
      .insert({ user_id, test_id, expires_at: expiresAt })
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    return res.status(200).json({
      attempt_id: newAttempt.id,
      expires_at: expiresAt,
      resumed: false
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}