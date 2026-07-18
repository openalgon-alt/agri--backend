import { query } from '../../api/_lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId query param required' });

  try {
    // 1. Fetch submissions for this user
    let submissions = [];
    try {
        const result = await query(
          `SELECT id, user_id, mock_test_id, score, total_questions, answers
           FROM exam_submissions
           WHERE user_id = $1`,
          [userId]
        );
        submissions = result.rows;
    } catch (dbErr) {
        if (dbErr.message && dbErr.message.includes('mock_test_id')) {
            const resultFallback = await query(
              `SELECT id, user_id, test_id as mock_test_id, score, total_questions, answers
               FROM exam_submissions
               WHERE user_id = $1`,
              [userId]
            );
            submissions = resultFallback.rows;
        } else if (dbErr.message && dbErr.message.includes('relation "exam_submissions" does not exist')) {
            return res.status(200).json({
                totalAttempts: 0,
                averageScore: 0,
                bestScore: 0,
                subjectPerformance: []
            });
        } else {
            throw dbErr;
        }
    }

    // 0. Fetch ALL distinct mock tests to represent subjects
    const testsResult = await query(`SELECT id, title FROM mock_tests`);
    const mockTestsMap = {};
    for (const row of testsResult.rows) {
        mockTestsMap[row.id] = row.title;
    }
    const allTopics = Object.values(mockTestsMap);
    
    // Initialize topicStats with ALL topics set to 0
    const topicStats = {};
    for (const t of allTopics) {
        topicStats[t] = { earned: 0, possible: 0 };
    }

    if (submissions.length === 0) {
        return res.status(200).json({
            totalAttempts: 0,
            averageScore: 0,
            bestScore: 0,
            subjectPerformance: allTopics.map(topic => ({
                subject: topic,
                percentage: 0,
                earned: 0,
                possible: 0
            }))
        });
    }

    // 4. Calculate stats directly from submissions
    let totalAttempts = submissions.length;
    let sumScore = 0;
    let bestScore = 0;

    for (const sub of submissions) {
        sumScore += (sub.score || 0);
        if ((sub.score || 0) > bestScore) {
            bestScore = (sub.score || 0);
        }

        const testTitle = mockTestsMap[sub.mock_test_id] || `Test ${sub.mock_test_id}`;
        
        if (!topicStats[testTitle]) {
            topicStats[testTitle] = { earned: 0, possible: 0 };
        }

        // Calculate possible marks: score out of (total_questions * 4) assuming 4 marks per question
        const totalQ = sub.total_questions || 50;
        const possibleMarks = totalQ * 4;
        
        topicStats[testTitle].possible += possibleMarks;
        topicStats[testTitle].earned += (sub.score || 0);
    }

    const averageScore = Math.round(sumScore / totalAttempts);
    
    const subjectPerformance = Object.entries(topicStats).map(([topic, stats]) => {
        let percent = 0;
        if (stats.possible > 0) {
            percent = Math.round((stats.earned / stats.possible) * 100);
        }
        return {
            subject: topic,
            percentage: percent,
            earned: stats.earned,
            possible: stats.possible
        };
    }).sort((a, b) => a.subject.localeCompare(b.subject));

    return res.status(200).json({
        totalAttempts,
        averageScore,
        bestScore,
        subjectPerformance
    });

  } catch (err) {
    console.error('Error (user-performance):', err);
    return res.status(500).json({ error: err.message });
  }
}

function calculateBasicStats(submissions) {
    let sumScore = 0;
    let bestScore = 0;
    for (const sub of submissions) {
        sumScore += (sub.score || 0);
        if ((sub.score || 0) > bestScore) {
            bestScore = (sub.score || 0);
        }
    }
    return {
        totalAttempts: submissions.length,
        averageScore: submissions.length > 0 ? Math.round(sumScore / submissions.length) : 0,
        bestScore,
        subjectPerformance: []
    }
}
