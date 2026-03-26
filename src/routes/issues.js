import { supabase } from './_lib/supabase.js';

export default async function handler(req, res) {
  
  
  
  

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { status } = req.query;
    let query = supabase.from('issues').select('*, articles(*)').order('year', { ascending: false }).order('month', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: issues, error } = await query;

    if (error) {
       return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(issues || []);
  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
