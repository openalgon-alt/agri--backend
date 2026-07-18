import { query } from '../../../api/_lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, name, address, mapUrl } = req.body;

    if (!name || !address) {
      return res.status(400).json({ error: "Missing required fields: name and address" });
    }

    let savedCenter;

    if (id) {
      const { rows } = await query(
        `UPDATE offline_coaching_centers 
         SET name = $1, address = $2, map_url = $3
         WHERE id = $4 RETURNING *`,
        [name, address, mapUrl || null, id]
      );
      savedCenter = rows[0];
    } else {
      const { rows } = await query(
        `INSERT INTO offline_coaching_centers (name, address, map_url)
         VALUES ($1, $2, $3) RETURNING *`,
        [name, address, mapUrl || null]
      );
      savedCenter = rows[0];
    }

    const formattedCenter = {
      id: savedCenter.id,
      name: savedCenter.name,
      address: savedCenter.address,
      mapUrl: savedCenter.map_url
    };

    return res.status(200).json(formattedCenter);

  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
