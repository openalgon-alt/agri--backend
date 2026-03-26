import { query } from '../../../api/_lib/neon.js';

export default async function handler(req, res) {
        
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, mockTestId, question, options, correctOptionIndex, image, marks, topic } = req.body;

    if (!mockTestId || !question || !options || correctOptionIndex === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    let savedQuestion;

    if (id) {
        // Update
        const { rows } = await query(
            `UPDATE mock_questions 
             SET mock_test_id = $1, question_text = $2, options = $3, correct_option_index = $4, image_url = $5, marks = $6, topic = $7
             WHERE id = $8 RETURNING *`,
            [mockTestId, question, JSON.stringify(options), correctOptionIndex, image || null, marks || 4, topic || null, id]
        );
        savedQuestion = rows[0];
    } else {
        // Insert
        const { rows } = await query(
            `INSERT INTO mock_questions (mock_test_id, question_text, options, correct_option_index, image_url, marks, topic)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [mockTestId, question, JSON.stringify(options), correctOptionIndex, image || null, marks || 4, topic || null]
        );
        savedQuestion = rows[0];
    }

    // Convert back from snake_case
    const formattedQuestion = {
        id: savedQuestion.id,
        mockTestId: savedQuestion.mock_test_id,
        question: savedQuestion.question_text,
        options: savedQuestion.options,
        correctOptionIndex: savedQuestion.correct_option_index,
        image: savedQuestion.image_url,
        marks: savedQuestion.marks,
        topic: savedQuestion.topic
    };

    return res.status(200).json(formattedQuestion);

  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
