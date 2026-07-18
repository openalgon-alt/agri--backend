import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.CLOUD_SQL_URL,
  max: 1, // Restrict pooling per serverless instance to prevent DB exhaustion limits
  ssl: {
    rejectUnauthorized: false
  }
});

export const query = (text, params) => pool.query(text, params);
export default pool;
