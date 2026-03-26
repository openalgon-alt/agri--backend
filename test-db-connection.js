import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

function parsePgUrl(url) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: parseInt(u.port || '5432'),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ''),
  };
}

const config = parsePgUrl(process.env.CLOUD_SQL_URL);

async function testConnection(sslConfig) {
  console.log(`Testing with SSL: ${JSON.stringify(sslConfig)}`);
  const client = new Client({ ...config, ssl: sslConfig });
  try {
    await client.connect();
    console.log('✅ Connected successfully!');
    await client.end();
    return true;
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    return false;
  }
}

async function runTests() {
  console.log('--- Test 1: ssl: false ---');
  let success = await testConnection(false);
  
  if (!success) {
    console.log('\n--- Test 2: ssl: { rejectUnauthorized: false } ---');
    success = await testConnection({ rejectUnauthorized: false });
  }

  if (!success) {
    console.log('\n--- Test 3: ssl: require ---');
    success = await testConnection('require');
  }
}

runTests();
