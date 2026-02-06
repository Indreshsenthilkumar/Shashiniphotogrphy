const fetch = require('node-fetch');

// UPDATED URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwL3REAruQwojPkDr1AhCOzCGb18pTT7o1S0qX2nhv6rwEObuyYYJxzdiL6zivQAxG9/exec';

const testGet = async () => {
    console.log('Testing Cloud Fetch (GET) with NEW URL...');
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'GET',
            redirect: 'follow'
        });

        const text = await response.text();
        console.log('Response Status:', response.status);
        console.log('Response Body:', text.substring(0, 500));

        try {
            const json = JSON.parse(text);
            if (json.status === 'success') {
                console.log('✅ SUCCESS! Connection established. Data:', json);
            } else {
                console.log('❌ Script returned error status:', json);
            }
        } catch (e) {
            console.log('⚠️ Response is not JSON.');
        }

    } catch (error) {
        console.error('Fetch Error:', error);
    }
};

testGet();
