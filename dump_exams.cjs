const https = require('https');

function fetchJson(path, payload) {
    return new Promise((resolve) => {
        const data = JSON.stringify(payload);
        const options = {
            hostname: 'agri-backend-plux.vercel.app',
            port: 443,
            path: path,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
        };

        const req = https.request(options, res => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve(JSON.parse(body)));
        });

        req.write(data);
        req.end();
    });
}

async function run() {
    const tests = await fetchJson('/api/mock-tests', { activeOnly: false });
    console.log(`TOTAL TESTS: ${tests.length}`);
    if (tests.length > 0) {
        console.log(`FIRST TEST:`, tests[0]);
        const testId = tests[0].id;
        console.log(`\nFetching questions for Test ID ${testId}...`);
        
        const details = await fetchJson('/api/mock-questions', { test_id: testId });
        console.log(`QUESTIONS FOUND:`, details.questions?.length);
        if (details.questions?.length > 0) {
            console.log(`FIRST QUESTION STRUC:`, details.questions[0]);
        }
    }
}
run();
