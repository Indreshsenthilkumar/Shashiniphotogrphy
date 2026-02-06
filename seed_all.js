const API_URL = 'http://localhost:5001/api';

const vaultData = [
    {
        folderLink: 'https://drive.google.com/drive/folders/1mNruZnpDcydlrSyhzFGtMNANCoMHcFED',
        customerName: 'Karan Malhotra',
        mobile: '9888776655',
        sessionType: 'Wedding',
        sessionTitle: 'Malhotra Grand Wedding'
    },
    {
        folderLink: 'https://drive.google.com/drive/folders/test_portrait_id',
        customerName: 'Sara Ali',
        mobile: '9777665544',
        sessionType: 'Portrait',
        sessionTitle: 'Sara Ali Portfolio'
    },
    {
        folderLink: 'https://drive.google.com/drive/folders/test_event_id',
        customerName: 'Rohan Joshi',
        mobile: '9666554433',
        sessionType: 'Event',
        sessionTitle: 'Annual Corporate Meet'
    }
];

const messageData = [
    {
        sender: 'Sneha Reddy',
        mobile: '9555443322',
        email: 'sneha@example.com',
        text: 'Hello Shashini Studio! I am interested in booking a pre-wedding shoot for next month. Can you share the details?'
    },
    {
        sender: 'Manish Pandey',
        mobile: '9444332211',
        email: 'manish.p@example.com',
        text: 'Great work on your latest portrait series! How much do you charge for a 1-hour solo session?'
    }
];

async function seedEverything() {
    console.log('🚀 INITIALIZING MASTER SEED... (Syncing to Google Sheet)');

    // 1. Seed Vaults
    console.log('\n--- 📂 Seeding Vaults ---');
    for (const vault of vaultData) {
        try {
            const res = await fetch(`${API_URL}/vaults/link`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vault)
            });
            const data = await res.json();
            console.log(`✅ Vault Created: ${vault.sessionTitle}`);
        } catch (e) {
            console.error(`❌ Vault Failed: ${vault.sessionTitle}`);
        }
    }

    // 2. Seed Messages
    console.log('\n--- ✉️ Seeding Enquiries ---');
    for (const msg of messageData) {
        try {
            const res = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msg)
            });
            const data = await res.json();
            console.log(`✅ Enquiry Created: ${msg.sender}`);
        } catch (e) {
            console.error(`❌ Enquiry Failed: ${msg.sender}`);
        }
    }

    console.log('\n✨ COMPLETE! Check your Google Sheet and Admin Dashboard.');
}

seedEverything();
