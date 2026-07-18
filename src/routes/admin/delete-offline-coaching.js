import { query } from '../../../api/_lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.body;

    if (!id) {
       return res.status(400).json({ error: "Missing id" });
    }

    await query("DELETE FROM offline_coaching_centers WHERE id = $1", [id]);
    
    return res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting coaching center:", error);
    return res.status(500).json({ error: error.message });
  }
}
