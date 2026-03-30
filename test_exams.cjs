const https = require('https');

function testEndpoint(path, payload) {
    const data = JSON.stringify(payload);
    const options = {
        hostname: 'agri-backend-plux.vercel.app',
        port: 443,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, res => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => console.log(`[${path}] STATUS: ${res.statusCode} | BODY:`, body));
    });

    req.on('error', error => console.error(`[${path}] ERROR:`, error));
    req.write(data);
    req.end();
}

testEndpoint('/api/mock-tests', { activeOnly: false });
testEndpoint('/api/mock-questions', { test_id: 1 }); // Testing with a dummy ID 1
