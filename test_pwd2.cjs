const { Client } = require('pg');

async function testPassword(pwd) {
    console.log(`Testing password literal: ${pwd}`);
    const client = new Client({
        host: '34.93.188.35',
        port: 5432,
        user: 'postgres',
        password: pwd,
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        await client.connect();
        console.log(`SUCCESS! The correct password is: ${pwd}`);
        await client.end();
        return true;
    } catch (err) {
        console.log(`FAILED with password ${pwd}: ${err.message}`);
        return false;
    }
}

async function run() {
    await testPassword('Combride@123');
}

run();
