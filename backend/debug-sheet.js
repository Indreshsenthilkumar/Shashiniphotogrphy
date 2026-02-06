const fetch = require('node-fetch');

// The NEW deployment URL from user
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwL3REAruQwojPkDr1AhCOzCGb18pTT7o1S0qX2nhv6rwEObuyYYJxzdiL6zivQAxG9/exec';

async function checkSheetData() {
    console.log('Fetching data from Google Sheet...');

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'GET',
            redirect: 'follow'
        });

        const data = await response.json();

        console.log('--- RAW DATA FROM SHEET ---');
        if (Array.isArray(data)) {
            data.forEach((msg, i) => {
                console.log(`[Row ${i + 2}] Mobile: "${msg.mobile}" | Text: "${msg.text}" | Status: "${msg.status}"`);
            });
        } else {
            console.log('Received non-array data:', data);
        }
    } catch (e) {
        console.error('Error fetching data:', e.message);
    }
}

checkSheetData();
