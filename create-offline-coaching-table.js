import { query } from './api/_lib/db.js';

async function createTable() {
  try {
    console.log("Creating offline_coaching_centers table...");
    await query(`
      CREATE TABLE IF NOT EXISTS offline_coaching_centers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        map_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table offline_coaching_centers created successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error creating table:", err);
    process.exit(1);
  }
}

createTable();
