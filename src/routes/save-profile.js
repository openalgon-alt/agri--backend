import { query } from '../../api/_lib/neon.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ── GET: fetch a profile by firebase_uid ──────────────────────────────────
  if (req.method === 'GET') {
    const { firebase_uid, email } = req.query;
    if (!firebase_uid && !email) {
      return res.status(400).json({ error: 'firebase_uid or email is required' });
    }

    try {
      let result;
      if (firebase_uid) {
        result = await query(
          'SELECT * FROM student_profiles WHERE firebase_uid = $1 LIMIT 1',
          [firebase_uid]
        );
      } else {
        result = await query(
          'SELECT * FROM student_profiles WHERE email = $1 LIMIT 1',
          [email]
        );
      }
      return res.status(200).json({ profile: result.rows[0] || null });
    } catch (err) {
      console.error('Error fetching profile:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST: create or update a profile ────────────────────────────────────
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      firebase_uid,
      name,
      mobile,
      email,
      college,
      district,
      guardian_name,
      guardian_profession,
      guardian_contact,
    } = req.body;

    if (!firebase_uid || !name || !mobile || !email || !college || !district || !guardian_name || !guardian_profession || !guardian_contact) {
      return res.status(400).json({ error: 'All profile fields are required.' });
    }

    // Upsert using ON CONFLICT on firebase_uid
    const result = await query(
      `INSERT INTO student_profiles
         (firebase_uid, name, mobile, email, college, district, guardian_name, guardian_profession, guardian_contact, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT (firebase_uid) DO UPDATE SET
         name               = EXCLUDED.name,
         mobile             = EXCLUDED.mobile,
         email              = EXCLUDED.email,
         college            = EXCLUDED.college,
         district           = EXCLUDED.district,
         guardian_name      = EXCLUDED.guardian_name,
         guardian_profession = EXCLUDED.guardian_profession,
         guardian_contact   = EXCLUDED.guardian_contact,
         updated_at         = NOW()
       RETURNING *`,
      [firebase_uid, name, mobile, email, college, district, guardian_name, guardian_profession, guardian_contact]
    );

    return res.status(200).json({ success: true, profile: result.rows[0] });

  } catch (err) {
    console.error('Error saving profile:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
