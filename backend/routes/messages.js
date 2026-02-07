const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const MESSAGES_PATH = path.join(__dirname, '../data/messages.json');

const readJSON = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return [];
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
        if (!content.trim()) return [];
        return JSON.parse(content);
    } catch (e) {
        console.error(`[Messages] Error reading ${filePath}:`, e.message);
        return [];
    }
};

const writeJSON = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

router.get('/', async (req, res) => {
    const { sync, mobile } = req.query;
    let messages = readJSON(MESSAGES_PATH) || [];

    if (sync === 'true') {
        try {
            const { fetchMessagesFromSheet } = require('../services/googleSheets');
            console.log('[Messages] Initiating sheet sync...');

            const fetchWithTimeout = (ms) => Promise.race([
                fetchMessagesFromSheet(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Sheet fetch timed out')), ms))
            ]);

            let sheetMessages = [];
            try {
                sheetMessages = await fetchWithTimeout(18000);
            } catch (err) {
                console.warn('[Messages] Sync timed out (18s), using local cache.');
            }

            if (Array.isArray(sheetMessages)) {
                const localMessages = readJSON(MESSAGES_PATH) || [];
                const mergedMessages = [];

                sheetMessages.forEach(sm => {
                    const smTime = sm.timestamp ? new Date(sm.timestamp).toISOString() : null;
                    const smMobile = String(sm.mobile || '').replace(/\D/g, '');

                    const existing = localMessages.find(m => {
                        const mTime = m.timestamp ? new Date(m.timestamp).toISOString() : null;
                        const mMobile = String(m.mobile || '').replace(/\D/g, '');
                        return mTime === smTime && mMobile === smMobile;
                    });

                    if (existing) {
                        mergedMessages.push({
                            ...existing,
                            sender: sm.sender || existing.sender,
                            text: sm.text || existing.text,
                            email: sm.email || existing.email,
                            status: sm.status || existing.status || 'received'
                        });
                    } else {
                        mergedMessages.push({
                            id: Date.now().toString() + Math.floor(Math.random() * 1000),
                            sender: sm.sender || 'Unknown',
                            mobile: String(sm.mobile || ''),
                            email: sm.email || '',
                            text: sm.text || '',
                            timestamp: sm.timestamp || new Date().toISOString(),
                            read: false,
                            status: sm.status || 'received',
                            replies: sm.replies || []
                        });
                    }
                });

                writeJSON(MESSAGES_PATH, mergedMessages);
                console.log(`[Messages] Sheet sync complete. ${mergedMessages.length} messages processed.`);
                return res.json(mergedMessages);
            }
        } catch (e) {
            console.error('[Messages] Sheet sync failed:', e.message);
        }
    }

    if (mobile) {
        messages = messages.filter(m => m.mobile === mobile);
    }
    res.json(messages);
});

router.post('/', (req, res) => {
    const { sender, mobile, email, text } = req.body;
    console.log(`[Messages] Receiving new enquiry from ${sender}...`);
    const messages = readJSON(MESSAGES_PATH) || [];

    const newMessage = {
        id: Date.now().toString(),
        sender,
        mobile,
        email: email || '',
        text,
        timestamp: new Date().toISOString(),
        read: false,
        status: 'received',
        replies: []
    };

    messages.push(newMessage);
    writeJSON(MESSAGES_PATH, messages);
    console.log(`[Messages] New message added locally: ${newMessage.id}`);

    const { addMessageToSheet } = require('../services/googleSheets');
    addMessageToSheet({
        id: newMessage.id,
        sender: newMessage.sender,
        mobile: newMessage.mobile,
        email: newMessage.email,
        text: newMessage.text,
        status: newMessage.status
    }).catch(err => console.error('[Messages] Sheet sync failed:', err.message));

    res.json(newMessage);
});

router.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    console.log(`[PATCH /messages/:id/status] Received update request for ID: ${id}, Status: ${status}`);
    const messages = readJSON(MESSAGES_PATH) || [];

    const index = messages.findIndex(m => m.id === id);
    if (index === -1) {
        console.warn(`[PATCH /messages/:id/status] Message with ID ${id} not found in local JSON.`);
        return res.status(404).json({ error: 'Message not found' });
    }

    messages[index].status = status;
    writeJSON(MESSAGES_PATH, messages);
    console.log(`[Messages] Local status updated for ${messages[index].mobile} to ${status}`);

    try {
        const { updateMessageInSheet } = require('../services/googleSheets');
        console.log(`[Messages] Syncing status update to sheet: ${messages[index].mobile} -> ${status}`);

        // Await the sync so it finishes before the process potentially restarts or responds
        await updateMessageInSheet({
            mobile: messages[index].mobile,
            text: messages[index].text,
            status: status
        });
        console.log(`[Messages] Sheet sync successful for ${messages[index].mobile}`);
    } catch (err) {
        console.error(`[Messages] Sheet sync failed:`, err.message);
        // Revert local change if sync fails? 
        // For now, let's return error so UI matches Sheet
        return res.status(500).json({ error: 'Sheet sync failed', details: err.message });
    }

    res.json(messages[index]);
});

router.post('/:id/reply', (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    const messages = readJSON(MESSAGES_PATH) || [];

    const index = messages.findIndex(m => m.id === id);
    if (index === -1) return res.status(404).json({ error: 'Message not found' });

    messages[index].replies.push({
        text,
        timestamp: new Date().toISOString()
    });
    messages[index].read = true;
    if (messages[index].status === 'received') {
        messages[index].status = 'in progress';
    }

    writeJSON(MESSAGES_PATH, messages);

    const { postToSheet } = require('../services/googleSheets');
    postToSheet({
        action: 'reply',
        id: messages[index].id,
        mobile: messages[index].mobile,
        text: text
    }).catch(err => console.error('[Messages] Reply sync failed:', err.message));

    res.json(messages[index]);
});

module.exports = router;
