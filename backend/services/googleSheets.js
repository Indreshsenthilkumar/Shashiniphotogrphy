const fetch = require('node-fetch');

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwL3REAruQwojPkDr1AhCOzCGb18pTT7o1S0qX2nhv6rwEObuyYYJxzdiL6zivQAxG9/exec';

const postToSheet = async (payload) => {
    try {
        console.log(`[GoogleSheets] Sending ${payload.action}...`);
        console.log(`[GoogleSheets] Data:`, JSON.stringify(payload, null, 2));
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            redirect: 'follow'
        });

        const text = await response.text();
        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            console.error('[GoogleSheets] Invalid JSON:', text);
            throw new Error('Invalid JSON response from Apps Script: ' + text.substring(0, 100));
        }

        if (result.result === 'success') {
            console.log(`[GoogleSheets] ${payload.action} successful`);
            return true;
        } else {
            const msg = result.message || result.error || 'Unknown Error';
            console.error(`[GoogleSheets] ${payload.action} failed:`, msg);
            throw new Error(msg);
        }
    } catch (error) {
        console.error(`[GoogleSheets] Network/Script error (${payload.action}):`, error.message);
        throw error;
    }
};

const addVaultToSheet = async (vault) => {
    return postToSheet({ ...vault, action: 'addVault' });
};

const updateVaultInSheet = async (vault) => {
    return postToSheet({ ...vault, action: 'updateVault' });
};

const deleteVaultFromSheet = async (id) => {
    return postToSheet({ id, action: 'deleteVault' });
};

const fetchMessagesFromSheet = async () => {
    try {
        console.log('[GoogleSheets] Fetching messages from sheet...');
        const response = await fetch(`${SCRIPT_URL}?action=getMessages`, {
            method: 'GET',
            redirect: 'follow'
        });
        const result = await response.json();
        return Array.isArray(result) ? result : [];
    } catch (error) {
        console.error('[GoogleSheets] Fetch Messages error:', error.message);
        return [];
    }
};

const fetchVaultsFromSheet = async () => {
    try {
        console.log('[GoogleSheets] Fetching vaults from sheet...');
        const response = await fetch(`${SCRIPT_URL}?action=getVaults`, {
            method: 'GET',
            redirect: 'follow'
        });
        const result = await response.json();
        return Array.isArray(result) ? result : [];
    } catch (error) {
        console.error('[GoogleSheets] Fetch Vaults error:', error.message);
        return [];
    }
};

const addMessageToSheet = async (msg) => {
    return postToSheet({ ...msg, action: 'addMessage' });
};

const updateMessageInSheet = async (msg) => {
    return postToSheet({ ...msg, action: 'updateMessage' });
};

module.exports = {
    postToSheet,
    addVaultToSheet,
    updateVaultInSheet,
    addMessageToSheet,
    updateMessageInSheet,
    deleteVaultFromSheet,
    fetchVaultsFromSheet,
    fetchMessagesFromSheet
};
