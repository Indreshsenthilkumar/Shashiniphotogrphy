require('dotenv').config();
const googleDrive = require('./services/googleDrive');

async function test() {
    const folderId = '16rR1YrYSUeYsTHohGySYoAKldM6pESPi'; // One of the vaults from vaults.json
    try {
        const photos = await googleDrive.listFiles(folderId);
        console.log('Photos found:', photos.length);
        if (photos.length > 0) {
            console.log('First photo data:', JSON.stringify(photos[0], null, 2));
        }
    } catch (err) {
        console.error('Test failed:', err);
    }
}

test();
