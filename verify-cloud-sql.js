import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function checkDatabase() {
  const client = new Client({
    connectionString: process.env.CLOUD_SQL_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  console.log(`\n🔍 Checking Google Cloud SQL database...`);
  await client.connect();

  try {
    const result = await client.query(`SELECT * FROM student_profiles ORDER BY created_at DESC;`);
    console.log(`\n✅ Successfully connected to the 'student_profiles' table!`);
    console.log(`📊 Total Registered Students: ${result.rowCount}\n`);
    
    if (result.rowCount > 0) {
      console.table(result.rows.map(r => ({
        Name: r.name,
        Email: r.email,
        Mobile: r.mobile,
        College: r.college,
        RegistrationDate: new Date(r.created_at).toLocaleString()
      })));
    } else {
      console.log('No students have registered yet. Table is empty but ready!');
    }
  } catch (err) {
    if (err.message.includes('relation "student_profiles" does not exist')) {
       console.error('\n❌ Error: The student_profiles table does NOT exist in the database.');
    } else {
       console.error('\n❌ Error:', err.message);
    }
  } finally {
    await client.end();
  }
}

checkDatabase().catch(console.error);
