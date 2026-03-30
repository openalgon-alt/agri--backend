const { Client } = require('pg');

async function run() {
    const client = new Client({
        host: '34.93.188.35',
        port: 5432,
        user: 'postgres',
        password: 'Combride@123',
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();
    
    const count = await client.query('SELECT COUNT(*) FROM mock_questions');
    console.log(`TOTAL QUESTIONS IN DB: ${count.rows[0].count}`);
    
    const firstQ = await client.query('SELECT * FROM mock_questions LIMIT 1');
    if (firstQ.rows.length > 0) {
        console.log(`SAMPLE QUESTION:`, firstQ.rows[0]);
    }
    
    // Check which mock tests actually have questions
    const mapped = await client.query('SELECT mock_test_id, COUNT(*) as qcount FROM mock_questions GROUP BY mock_test_id');
    console.log(`MOCK TESTS WITH QUESTIONS:`);
    console.log(mapped.rows);

    await client.end();
}

run();
