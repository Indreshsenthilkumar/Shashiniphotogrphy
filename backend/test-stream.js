const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const keyPath = path.join(__dirname, 'credentials.json');
const fileId = '1LwO9zRHEcHcsgjYBOYBIp02T8pPH4OpI'; // From previous output

async function testStream() {
    console.log(`Testing File Stream for ID: ${fileId}`);
    try {
        const creds = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        if (creds.private_key) {
            creds.private_key = creds.private_key
                .replace(/\\n/g, '\n')
                .replace(/[^\x00-\x7F]/g, "")
                .trim();
        }

        const auth = new google.auth.GoogleAuth({
            credentials: creds,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });
        const drive = google.drive({ version: 'v3', auth });

        console.log('Attempting to get file stream...');
        const res = await drive.files.get({
            fileId: fileId,
            alt: 'media'
        }, { responseType: 'stream' });

        console.log('Stream received successfully!');

        // Pipe to nowhere to simulate consumption? Or check status code?
        // Usually axios/gaxios returns a response object with .data as stream.

        if (res.status === 200 && res.data) {
            console.log('API returned 200 OK and a stream.');
            res.data.on('data', chunk => {
                // consume a bit
            });
            res.data.on('end', () => console.log('Stream ended successfully.'));
            res.data.on('error', err => console.error('Stream error:', err));
        } else {
            console.error('API returned status:', res.status);
        }

    } catch (e) {
        console.error('FAILED!');
        console.error('Error Message:', e.message);
        if (e.response) {
            console.error('Response Data:', e.response.data);
        }
    }
}

testStream();
