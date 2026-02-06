const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const keyPath = path.join(__dirname, 'credentials.json');
const fileId = '13EfiRlnmgGkHsE7U4JQmcwSuFbX9t3AP';
const destinationFolderId = '1YR4fMAOeClxeCN9BtQxyDI3rGFqwZLh4';

async function testShortcut() {
    console.log(`Testing shortcut for file: ${fileId} to destination: ${destinationFolderId}`);
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
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
        const drive = google.drive({ version: 'v3', auth });

        console.log('1. Attempting to get file metadata...');
        const file = await drive.files.get({
            fileId: fileId,
            fields: 'id, name'
        });
        console.log('Metadata found:', file.data);

        console.log('2. Attempting to create shortcut...');
        const shortcutMetadata = {
            name: file.data.name,
            mimeType: 'application/vnd.google-apps.shortcut',
            shortcutDetails: {
                targetId: fileId
            },
            parents: [destinationFolderId]
        };

        const response = await drive.files.create({
            requestBody: shortcutMetadata,
            fields: 'id, name'
        });

        console.log('SUCCESS! Shortcut created.');
        console.log('Shortcut ID:', response.data.id);

    } catch (e) {
        console.error('FAILED!');
        console.error('Error Message:', e.message);
    }
}

testShortcut();
