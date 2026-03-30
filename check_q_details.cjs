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
    
    // Get all mock tests
    const tests = await client.query('SELECT id, title FROM mock_tests ORDER BY id ASC');
    console.log(`\n--- ALL MOCK TESTS (${tests.rows.length}) ---`);
    const testMap = {};
    tests.rows.forEach(t => {
        testMap[t.id] = t.title;
    });

    // Get question counts per test
    const mapped = await client.query('SELECT mock_test_id, COUNT(*) as qcount FROM mock_questions GROUP BY mock_test_id ORDER BY mock_test_id ASC');
    
    console.log(`\n--- QUESTION DISTRIBUTION ---`);
    mapped.rows.forEach(row => {
        const title = testMap[row.mock_test_id] || "!!! ORPHANED (Test Missing) !!!";
        console.log(`Test ID ${row.mock_test_id}: ${row.qcount} questions | Title: ${title}`);
    });

    await client.end();
}

run();
