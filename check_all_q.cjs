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
    
    const res = await client.query('SELECT mock_test_id, COUNT(*) FROM mock_questions GROUP BY mock_test_id ORDER BY mock_test_id ASC');
    console.log('QUESTION COUNTS PER TEST:');
    res.rows.forEach(r => console.log(`ID ${r.mock_test_id}: ${r.count} questions`));
    
    const res2 = await client.query('SELECT id, title FROM mock_tests ORDER BY id ASC');
    console.log('\nALL TESTS IN DB:');
    res2.rows.forEach(r => {
        const qcount = res.rows.find(row => row.mock_test_id == r.id)?.count || 0;
        console.log(`ID ${r.id}: ${qcount} questions | Title: ${r.title}`);
    });

    await client.end();
}

run();
