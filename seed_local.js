const testData = [
    {
        folderLink: 'https://drive.google.com/drive/folders/1mNruZnpDcydlrSyhzFGtMNANCoMHcFED',
        customerName: 'Aarav Mehta',
        mobile: '9876543210',
        sessionType: 'Wedding',
        sessionTitle: 'Mehta & Kapoor Wedding Highlights'
    },
    {
        folderLink: 'https://drive.google.com/drive/folders/drive_id_maternity_001',
        customerName: 'Ishani Roy',
        mobile: '9123456780',
        sessionType: 'Maternity',
        sessionTitle: 'Golden Hour Maternity Shoot'
    },
    {
        folderLink: 'https://drive.google.com/drive/folders/drive_id_event_002',
        customerName: 'Vikram Singh',
        mobile: '9988776655',
        sessionType: 'Event',
        sessionTitle: 'Tech Summit 2024 - Bangalore'
    }
];

async function seedLocal() {
    console.log('🚀 Seeding local backend (which will sync to Google Sheets)...');

    for (const data of testData) {
        try {
            console.log(`📡 Sending to local API: ${data.sessionTitle}...`);
            const response = await fetch('http://localhost:5001/api/vaults/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            console.log(`✅ Backend response:`, result.customerName || 'Success');
        } catch (error) {
            console.error(`❌ Failed:`, error.message);
        }
    }

    console.log('\n✨ Done! Check your Google Sheet now.');
}

seedLocal();
