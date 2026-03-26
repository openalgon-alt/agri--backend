import { query } from '../../../api/_lib/neon.js';

export default async function handler(req, res) {
  // CORS configuration
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
    const { id, title, description, category, price, imageUrl, isActive } = req.body;

    if (!title || price === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    let savedTest;

    if (id) {
        // Update
        const { rows } = await query(
            `UPDATE mock_tests 
             SET title = $1, description = $2, category = $3, price = $4, image_url = $5, is_active = $6
             WHERE id = $7 RETURNING *`,
            [title, description || null, category || 'Agriculture', price, imageUrl || null, isActive !== false, id]
        );
        savedTest = rows[0];
    } else {
        // Insert
        const { rows } = await query(
            `INSERT INTO mock_tests (title, description, category, price, image_url, is_active)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [title, description || null, category || 'Agriculture', price, imageUrl || null, isActive !== false]
        );
        savedTest = rows[0];
    }

    // Convert snake_case to camelCase for the frontend
    const formattedTest = {
        id: savedTest.id,
        title: savedTest.title,
        description: savedTest.description,
        category: savedTest.category,
        price: savedTest.price,
        imageUrl: savedTest.image_url,
        isActive: savedTest.is_active
    };

    return res.status(200).json(formattedTest);

  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
