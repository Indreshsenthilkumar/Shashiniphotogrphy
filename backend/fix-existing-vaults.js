require('dotenv').config();
const googleDrive = require('./services/googleDrive');
const fs = require('fs');
const path = require('path');

const VAULTS_PATH = path.join(__dirname, 'data/vaults.json');

async function fix() {
    try {
        if (!fs.existsSync(VAULTS_PATH)) return console.log('No vaults found');
        const vaults = JSON.parse(fs.readFileSync(VAULTS_PATH, 'utf8'));

        console.log(`Fixing permissions for ${vaults.length} vaults...`);

        for (const vault of vaults) {
            console.log(`Ensuring vault ${vault.sessionTitle} (${vault.vaultId}) and its contents are public...`);
            await googleDrive.makeFolderAndFilesPublic(vault.vaultId);
        }

        console.log('Done! All vault files should now be accessible.');
    } catch (err) {
        console.error('Fix failed:', err);
    }
}

fix();
