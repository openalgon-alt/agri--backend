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
    const { submission_id, answers, total_questions, user_id } = req.body;

    if (!submission_id || !user_id) {
      return res.status(400).json({ error: 'Missing submission_id or user_id' });
    }

    // 1. Get the attempt to find test_id
    const { data: attempt, error: attemptError } = await supabase
      .from('test_attempts')
      .select('test_id')
      .eq('id', submission_id)
      .single();

    if (attemptError || !attempt) {
        return res.status(404).json({ error: 'Attempt not found' });
    }

    const testId = attempt.test_id;

    // 2. Fetch all questions for this test to calculate score
    const { data: questions, error: qError } = await supabase
        .from('mock_questions')
        .select('*')
        .eq('mock_test_id', testId);
    
    if (qError) {
        return res.status(500).json({ error: 'Failed to fetch questions' });
    }

    let score = 0;
    let populatedQuestions = [];

    // Calculate score
    if (questions && answers) {
        populatedQuestions = questions.map(q => {
             const userAnswer = answers[q.id];
             const correctOption = q.options[q.correct_option_index];
             
             if (userAnswer === correctOption) {
                 score += (q.marks || 4); // default 4 marks if not specified
             } else if (userAnswer) {
                 // negative marking could go here
                 // score -= 1;
             }

             return {
                 id: q.id,
                 mock_test_id: q.mock_test_id,
                 question_text: q.question_text || q.question,
                 options: q.options,
                 correct_option_index: q.correct_option_index,
                 image_url: q.image_url || q.image,
                 marks: q.marks,
                 topic: q.topic
             };
        });
    }

    // 3. Mark attempt as completed (optional, depending on schema)
    // await supabase.from('test_attempts').update({ completed_at: new Date().toISOString(), score }).eq('id', submission_id);

    // 4. Save to exam_submissions (the table frontend ExamDashboard queries)
    const { data: submission, error: subError } = await supabase
        .from('exam_submissions')
        .insert({
            user_id: user_id,
            mock_test_id: testId,
            score: score,
            total_questions: total_questions || questions?.length || 50
        })
        .select()
        .single();
    
    // We intentionally ignore subError here in case the table doesn't exist, we still want to return the score.
    if (subError) console.error("Error saving submission:", subError);

    // Return the score and populated questions
    return res.status(200).json({ 
        success: true, 
        score: score,
        questions: populatedQuestions
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
