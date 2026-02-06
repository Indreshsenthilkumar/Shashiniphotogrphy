const testMessages = [
    {
        sender: 'Amara Singh',
        mobile: '9811223344',
        email: 'amara.s@example.com',
        text: 'Hi, I saw your wedding portfolio and absolutely loved the Shashini Studio style! Are you available for a 3-day wedding shoot in Jaipur this December?',
        timestamp: new Date().toISOString()
    },
    {
        sender: 'Ishaan Verma',
        mobile: '9566778899',
        email: 'iverma@techcorp.in',
        text: 'Interested in booking a professional headshot session for our leadership team (12 people). Do you do studio visits or should we come to you?',
        timestamp: new Date(Date.now() - 86400000).toISOString()
    },
    {
        sender: 'Kavita Rai',
        mobile: '9433221100',
        email: 'kavita.rai@gmail.com',
        text: 'I was looking for newborn photography packages. Could you share your pricing for a 2-hour home session?',
        timestamp: new Date(Date.now() - 172800000).toISOString()
    }
];

async function seedMessages() {
    console.log('✉️ Seeding Studio Enquiries...');

    for (const msg of testMessages) {
        try {
            console.log(`📡 Sending enquiry from: ${msg.sender}...`);
            const response = await fetch('http://localhost:5001/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msg)
            });
            const result = await response.json();
            console.log(`✅ Message saved: ${result.sender}`);
        } catch (error) {
            console.error(`❌ Failed:`, error.message);
        }
    }

    console.log('\n✨ Messages populated! Refresh your Admin Dashboard to see them.');
}

seedMessages();
