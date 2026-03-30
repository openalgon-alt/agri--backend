const https = require('https');

const data = JSON.stringify({
    firebase_uid: 'test_123',
    name: 'Test Network',
    mobile: '1234567890',
    email: 'test@example.com',
    college: 'Test College',
    district: 'Test District',
    guardian_name: 'Guardian',
    guardian_profession: 'Job',
    guardian_contact: '0987654321'
});

const options = {
    hostname: 'agri-backend-plux.vercel.app',
    port: 443,
    path: '/api/save-profile',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => console.log('BODY:', body));
});

req.on('error', error => console.error('ERROR:', error));
req.write(data);
req.end();
