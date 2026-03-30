import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId query param required' });

  try {
    // Fetch submissions for this user (by firebase_uid or email)
    const { data: submissions, error } = await supabase
      .from('exam_submissions')
      .select(`
        id,
        user_id,
        mock_test_id,
        score,
        total_questions,
        answers,
        created_at,
        mock_tests ( title )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      // If answers column doesn't exist, try without it
      if (error.message?.includes('answers')) {
        const { data: fallback, error: fallbackError } = await supabase
          .from('exam_submissions')
          .select(`
            id, user_id, mock_test_id, score, total_questions, created_at,
            mock_tests ( title )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (fallbackError) return res.status(500).json({ error: fallbackError.message });
        return res.status(200).json(formatSubmissions(fallback || []));
      }
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(formatSubmissions(submissions || []));

  } catch (err) {
    console.error('Error in get-user-submissions:', err);
    return res.status(500).json({ error: err.message });
  }
}

function formatSubmissions(rows) {
  return rows.map(s => ({
    id: s.id,
    userId: s.user_id,
    mockTestId: s.mock_test_id,
    testTitle: s.mock_tests?.title || `Test #${s.mock_test_id}`,
    score: s.score || 0,
    totalQuestions: s.total_questions || 50,
    answers: s.answers || {},
    submittedAt: s.created_at
  }));
}
