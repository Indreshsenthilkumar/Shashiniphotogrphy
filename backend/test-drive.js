const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const keyPath = path.join(__dirname, 'credentials.json');
const folderId = '16rR1YrYSUeYsTHohGySYoAKldM6pESPi';

async function test() {
    console.log(`Testing Folder Access for: ${folderId}`);
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

        console.log('Attempting to list files in folder...');
        const res = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: 'files(id, name, mimeType)',
        });

        const files = res.data.files || [];
        console.log('SUCCESS! Folder reached.');
        console.log('Files count:', files.length);
        files.forEach(f => console.log(`- ${f.name} (${f.mimeType})`));

    } catch (e) {
        console.error('FAILED!');
        console.error('Error Message:', e.message);
        if (e.code === 404) console.log('TIP: Folder ID might be wrong or the Service Account has ZERO access to it.');
        if (e.code === 403) console.log('TIP: Permission denied. Make sure you shared the folder with the service account email.');
    }
}

test();
