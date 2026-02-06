const fs = require('fs');
const path = require('path');
const { updateVaultInSheet } = require('../services/googleSheets');

const VAULTS_PATH = path.join(__dirname, '../data/vaults.json');

const sync = async () => {
    try {
        if (!fs.existsSync(VAULTS_PATH)) {
            console.error('Vaults file not found');
            return;
        }

        const vaults = JSON.parse(fs.readFileSync(VAULTS_PATH, 'utf8'));
        console.log(`Found ${vaults.length} vaults to sync...`);

        for (const vault of vaults) {
            console.log(`Syncing vault: ${vault.sessionTitle} (${vault.id})...`);
            // We use updateVaultInSheet because our Apps Script logic handles "Insert if not exists" 
            // whithin the same block for add/update actions.
            // But wait, the Apps Script block checks: if (rowIndex === -1) -> if (action === 'updateVault') return error.
            // So 'updateVault' on a missing ID returns error!
            // 'addVault' on a missing ID adds it.
            // 'addVault' on an existing ID updates it? No, let's check the script.

            /* SCRIPT LOGIC:
               if (rowIndex === -1) {
                  if (action === 'updateVault') return ... error ...
                  // Add New
                  ...
               } else {
                  // Update Existing
                  ...
               }
            */

            // So we MUST use 'addVault' if we want to insert.
            // Does 'addVault' update if it exists?
            // "if (rowIndex === -1) { ... } else { // Update Existing ... }"
            // Yes! If rowIndex is found (ID exists), it goes to the 'else' block which updates.
            // So 'addVault' is actually an UPSERT. Great.

            // However, my service function `addVaultToSheet` sets action='addVault'.
            // I'll call a custom payload or just use addVaultToSheet.

            // Wait, I need to import addVaultToSheet, not updateVaultInSheet.
            const result = await require('../services/googleSheets').addVaultToSheet(vault);

            // Add a small delay to avoid hitting Google's rate limits too hard
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('Sync complete!');

    } catch (e) {
        console.error('Sync failed:', e);
    }
};

sync();
