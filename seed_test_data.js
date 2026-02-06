// Use native fetch (Node 18+)

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwL3REAruQwojPkDr1AhCOzCGb18pTT7o1S0qX2nhv6rwEObuyYYJxzdiL6zivQAxG9/exec';

const testData = [
    {
        vaultId: '1mNruZnpDcydlrSyhzFGtMNANCoMHcFED',
        customerName: 'Aarav Mehta',
        customerMobile: '9876543210',
        sessionType: 'Wedding',
        sessionTitle: 'Mehta & Kapoor Wedding Highlights',
        workflowStatus: 'finalized',
        status: 'active',
        createdAt: new Date('2024-01-15').toISOString()
    },
    {
        vaultId: 'drive_id_maternity_001',
        customerName: 'Ishani Roy',
        customerMobile: '9123456780',
        sessionType: 'Maternity',
        sessionTitle: 'Golden Hour Maternity Shoot',
        workflowStatus: 'pending',
        status: 'active',
        createdAt: new Date('2024-01-20').toISOString()
    },
    {
        vaultId: 'drive_id_event_002',
        customerName: 'Vikram Singh',
        customerMobile: '9988776655',
        sessionType: 'Event',
        sessionTitle: 'Tech Summit 2024 - Bangalore',
        workflowStatus: 'delivered',
        status: 'locked',
        createdAt: new Date('2023-12-10').toISOString()
    },
    {
        vaultId: 'drive_id_portrait_003',
        customerName: 'Zoya Khan',
        customerMobile: '9445566778',
        sessionType: 'Portrait',
        sessionTitle: 'Professional Portfolio - Zoya',
        workflowStatus: 'pending',
        status: 'active',
        createdAt: new Date('2024-01-28').toISOString()
    }
];

async function seedData() {
    console.log('🚀 Starting to populate Google Sheet with test data...');

    for (const data of testData) {
        try {
            console.log(`📡 Sending vault: ${data.sessionTitle}...`);
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, action: 'addVault' }),
                redirect: 'follow'
            });
            const result = await response.json();
            console.log(`✅ Success: ${data.sessionTitle}`);
        } catch (error) {
            console.error(`❌ Failed to send ${data.sessionTitle}:`, error.message);
        }
    }

    console.log('\n✨ Done! Your Google Sheet is now populated with professional test data.');
}

seedData();
