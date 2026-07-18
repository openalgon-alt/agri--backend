import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.CLOUD_SQL_URL,
  ssl: false
});

export const query = (text, params) => pool.query(text, params);
export default pool;
