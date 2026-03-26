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
    const { data: sections, error } = await supabase
      .from('editorial_sections')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
       return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(sections || []);
  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
