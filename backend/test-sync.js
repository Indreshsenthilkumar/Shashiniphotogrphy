const fetch = require('node-fetch');

// The NEWEST deployment URL from user
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwL3REAruQwojPkDr1AhCOzCGb18pTT7o1S0qX2nhv6rwEObuyYYJxzdiL6zivQAxG9/exec';

async function testMobileMatch() {
    console.log('Testing Mobile-Only Fallback Matching...');

    // We send payload with "Text" that DOES NOT MATCH the sheet ("hloo" vs "hlooo new")
    // But Mobile DOES MATCH ("9445285507").
    // We expect the script to find it via fallback and update it.

    const payload = {
        action: 'updateMessage',
        mobile: '9445285507',
        text: 'hloo', // Intentionally wrong text
        status: 'cleared' // We want to see this turn GREEN in the sheet
    };

    try {
        console.log('Sending payload:', JSON.stringify(payload));
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            redirect: 'follow'
        });

        const text = await response.text();
        console.log('Response body:', text);
        console.log('---------------------------------------------------');
        if (text.includes('"result":"success"')) {
            console.log('✅ SUCCESS! The fallback logic worked.');
            console.log('Please check your Sheet. Row 2 should be GREEN and say "cleared".');
        } else {
            console.log('❌ FAILED. The script did not find the row.');
        }

    } catch (e) {
        console.error('Error:', e.message);
    }
}

testMobileMatch();
