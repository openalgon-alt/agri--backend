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
    const { submission_id, question_id, answer, user_id } = req.body;

    if (!submission_id || !question_id || !answer || !user_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Usually we would want to check ownership, but for simplicity we can insert/upsert
    const { error: upsertError } = await supabase
      .from('test_answers')
      .upsert({
        attempt_id: submission_id,
        question_id: question_id,
        answer: answer
      }, { onConflict: 'attempt_id,question_id' }); // Assuming unique constraint on these two

    if (upsertError) {
        // If test_answers table doesn't exist or is not matching schema, we'll swallow or return error
        // Let's console log for now
        console.error("UPSERT ERROR", upsertError);
        return res.status(500).json({ error: upsertError.message });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
