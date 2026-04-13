
const https = require('https');
const API_KEY = 'cal_live_82cc72c8ac1ec02b20a64b5412c51852';
// Cal.com API v2 or v1 with correct params. Trying v1/event-types correctly.
// Query param apiKey is correct for v1.
const url = `https://api.cal.com/v1/event-types?apiKey=${API_KEY}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        if (res.statusCode >= 400) {
            console.error(`Status Code: ${res.statusCode}`);
            console.error('Response Body:', data);
            return;
        }
        try {
            console.log(JSON.parse(data));
        } catch (e) {
            console.log('Parse Error:', e.message);
            console.log('Raw data:', data);
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
