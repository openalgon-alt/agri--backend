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
    // Test 1: The decoded special characters password
    const decoded = 'H{L6j|7kds[gbBRt';
    const s1 = await testPassword(decoded);
    
    // Test 2: The literal URL encoded string
    if (!s1) {
        const encoded = 'H%7BL6j%7C7kds%5BgbBRt';
        await testPassword(encoded);
    }
}

run();
