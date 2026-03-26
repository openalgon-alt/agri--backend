const { Client } = require('pg');
const fs = require('fs');

const connectionString = "postgresql://neondb_owner:npg_LsmlEoK2Nvw4@ep-small-queen-a11zogcl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function executeSql() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log("Connected to Neon DB successfully.");
    
    // Read the SQL file
    const sql = fs.readFileSync('D:/agricatalogues/agricatagolues/neon_init.sql', 'utf8');
    
    // Execute the SQL
    await client.query(sql);
    console.log("Tables created successfully.");
    
  } catch (error) {
    console.error("Error executing SQL:", error);
  } finally {
    await client.end();
  }
}

executeSql();
