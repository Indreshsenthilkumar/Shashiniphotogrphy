const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const googleDrive = require('./services/googleDrive');

async function testUrls() {
    const folderId = '16rR1YrYSUeYsTHohGySYoAKldM6pESPi';
    try {
        const photos = await googleDrive.listFiles(folderId);
        console.log('Photos found:', photos.length);
        photos.forEach(p => {
            console.log(`- Name: ${p.name}`);
            console.log(`  ID: ${p.id}`);
            console.log(`  URL: ${p.url}`);
        });
    } catch (e) {
        console.error('Error:', e);
    }
}

testUrls();
