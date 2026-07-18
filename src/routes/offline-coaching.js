import { query } from '../../api/_lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { rows } = await query('SELECT * FROM offline_coaching_centers ORDER BY created_at ASC');
    
    // Map snake_case to camelCase
    const centers = rows.map(row => ({
      id: row.id,
      name: row.name,
      address: row.address,
      mapUrl: row.map_url
    }));
    
    return res.status(200).json(centers);
  } catch (error) {
    console.error("Error (admin/offline-coaching - GET):", error);
    return res.status(500).json({ error: error.message });
  }
}
