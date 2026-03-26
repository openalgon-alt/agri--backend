import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function createTable() {
  const client = new Client({
    connectionString: process.env.CLOUD_SQL_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  console.log(`🔧 Connecting to Cloud SQL...`);
  await client.connect();
  console.log('✅ Connected.');

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS student_profiles (
        id                  SERIAL PRIMARY KEY,
        firebase_uid        TEXT UNIQUE NOT NULL,
        name                TEXT NOT NULL,
        mobile              TEXT NOT NULL,
        email               TEXT NOT NULL,
        college             TEXT NOT NULL,
        district            TEXT NOT NULL,
        guardian_name       TEXT NOT NULL,
        guardian_profession TEXT NOT NULL,
        guardian_contact    TEXT NOT NULL,
        created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ student_profiles table created (or already exists).');

    await client.query(`CREATE INDEX IF NOT EXISTS idx_sp_firebase_uid ON student_profiles(firebase_uid);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_sp_email ON student_profiles(email);`);
    console.log('✅ Indexes created.');
    console.log('\n🎉 Done! Deploy the backend and profile saving will work.');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

createTable().catch(console.error);
