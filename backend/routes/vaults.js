const express = require('express');
const router = express.Router();
const googleDrive = require('../services/googleDrive');
const { fetchVaultsFromSheet, addVaultToSheet, updateVaultInSheet, deleteVaultFromSheet } = require('../services/googleSheets');
const fs = require('fs');
const path = require('path');

const VAULTS_PATH = path.join(__dirname, '../data/vaults.json');
const SELECTIONS_PATH = path.join(__dirname, '../data/selections.json');

const writeFileAtomic = require('write-file-atomic');
const validator = require('validator');

const readJSON = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return [];
        let content = fs.readFileSync(filePath, 'utf8');
        // Handle UTF-8 BOM if present
        if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
        if (!content.trim()) return [];
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error(`[Vaults] Critical read error for ${filePath}:`, e.message);
        return []; // Return empty array to prevent code from breaking downstream
    }
};

const writeJSON = async (p, d) => {
    try {
        const data = JSON.stringify(d, null, 2);
        await writeFileAtomic(p, data);
    } catch (e) {
        console.error(`[Vaults] Atomic write failed for ${p}:`, e.stack);
    }
};

// --- ROUTES ---

// Get all vaults (Admin) or specific vaults (Client)
router.get('/', async (req, res) => {
    const { mobile } = req.query;

    if (req.query.sync === 'true') {
        try {
            const fetchWithTimeout = (ms) => Promise.race([
                fetchVaultsFromSheet(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Sheet fetch timed out')), ms))
            ]);

            let sheetVaults = null;
            try {
                // Increased timeout to 18s (Frontend waits 20s)
                sheetVaults = await fetchWithTimeout(18000);
            } catch (err) {
                console.warn('[Vaults] Google Sheet sync timed out (18s). Using local cache.');
            }

            if (Array.isArray(sheetVaults)) {
                const localVaults = readJSON(VAULTS_PATH);
                const newVaultsList = [];

                if (sheetVaults.length > 0) {
                    sheetVaults.forEach(sv => {
                        let driveFolderId = sv.vaultId;
                        if (!driveFolderId) {
                            const existing = localVaults.find(lv => lv.id === sv.id);
                            if (existing) driveFolderId = existing.vaultId;
                        }

                        newVaultsList.push({
                            id: sv.id,
                            vaultId: driveFolderId || 'MISSING_DRIVE_ID',
                            customerName: sv.customerName || '',
                            customerMobile: String(sv.customerMobile || ''),
                            sessionTitle: sv.sessionTitle || '',
                            sessionType: sv.sessionType || 'Portrait',
                            createdAt: sv.createdAt || new Date().toISOString(),
                            status: (sv.status || 'active').toLowerCase(),
                            workflowStatus: (sv.workflowStatus || 'pending').toLowerCase(),
                            finalizedAt: sv.finalizedAt || undefined
                        });
                    });
                }
                await writeJSON(VAULTS_PATH, newVaultsList);
                return res.json(newVaultsList);
            }
        } catch (e) {
            console.error('Failed to fetch from sheets on GET /:', e);
        }
    }

    const allVaults = readJSON(VAULTS_PATH);

    if (mobile) {
        // Simple normalization for mobile comparison
        const cleanMobile = mobile.replace(/\D/g, '');
        const filtered = allVaults.filter(v => {
            const vMobile = (v.customerMobile || '').replace(/\D/g, '');
            return vMobile === cleanMobile;
        });
        return res.json(filtered);
    }

    res.json(allVaults);
});

// Link/Create a new vault
router.post('/link', async (req, res, next) => {
    try {
        let { folderLink, mobile, customerName, sessionTitle } = req.body;

        // SANITIZATION & VALIDATION
        if (!folderLink || !mobile) {
            return res.status(400).json({ error: 'Folder link and mobile number are required' });
        }

        // Clean input to prevent injection or malformed strings
        mobile = validator.escape(String(mobile)).replace(/[^\d+]/g, '');
        customerName = validator.escape(String(customerName || 'N/A')).trim();
        sessionTitle = validator.escape(String(sessionTitle || 'Untitled Session')).trim();

        // Extract ONLY the Folder ID from the link
        let folderId = folderLink.trim();

        // Robust Extraction
        if (folderId.includes('drive.google.com') || folderId.includes('https://')) {
            const m = folderId.match(/\/folders\/([a-zA-Z0-9-_]+)/);
            if (m && m[1]) folderId = m[1];
            else {
                const idParam = folderId.match(/id=([a-zA-Z0-9_-]+)/);
                if (idParam) folderId = idParam[1];
            }
        }

        // Security check: ensure folderId doesn't contain suspicious characters
        if (!/^[a-zA-Z0-9_-]+$/.test(folderId) || folderId.length < 20) {
            return res.status(400).json({
                error: 'Invalid folder ID or link structure detected.'
            });
        }

        const allVaults = readJSON(VAULTS_PATH);

        const newVault = {
            id: Date.now().toString(),
            vaultId: folderId,
            customerMobile: mobile,
            customerName: customerName,
            sessionTitle: sessionTitle,
            sessionType: validator.escape(String(req.body.sessionType || 'Wedding')),
            createdAt: new Date().toISOString(),
            status: 'active',
            workflowStatus: 'pending'
        };

        allVaults.push(newVault);
        await writeJSON(VAULTS_PATH, allVaults);

        // Background Sync (Error-shielded)
        addVaultToSheet(newVault).catch(err => console.error('[SheetSync] Failed:', err.message));

        try {
            await googleDrive.makePublic(folderId);
        } catch (err) {
            console.warn(`[Vaults] Permission auto-set failed for ${folderId}`);
        }

        res.json(newVault);

    } catch (err) {
        next(err); // Pass to global error handler
    }
});

// Toggle Lock
router.patch('/:id/toggle-lock', async (req, res) => {
    const { id } = req.params;
    const allVaults = readJSON(VAULTS_PATH);
    const idx = allVaults.findIndex(v => String(v.id) === String(id));

    if (idx === -1) return res.status(404).json({ error: 'Vault not found' });

    allVaults[idx].status = allVaults[idx].status === 'locked' ? 'active' : 'locked';
    await writeJSON(VAULTS_PATH, allVaults);

    // Sync to Google Sheet
    try { await updateVaultInSheet(allVaults[idx]); } catch (e) { console.error('Sheet sync failed:', e); }

    res.json(allVaults[idx]);
});

// Update Vault Details
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { customerName, customerMobile, sessionTitle, sessionType, createdAt, vaultId } = req.body;
    const allVaults = readJSON(VAULTS_PATH);
    const idx = allVaults.findIndex(v => String(v.id) === String(id));

    if (idx === -1) return res.status(404).json({ error: 'Vault not found' });

    if (customerName) allVaults[idx].customerName = customerName;
    if (customerMobile) allVaults[idx].customerMobile = customerMobile;
    if (sessionTitle) allVaults[idx].sessionTitle = sessionTitle;
    if (sessionType) allVaults[idx].sessionType = sessionType;
    if (createdAt) allVaults[idx].createdAt = createdAt;
    if (vaultId !== undefined) allVaults[idx].vaultId = vaultId;

    await writeJSON(VAULTS_PATH, allVaults);

    // Sync to Google Sheet
    try { await updateVaultInSheet(allVaults[idx]); } catch (e) { console.error('Sheet sync failed:', e); }

    res.json(allVaults[idx]);
});

// Update Workflow Status
router.patch('/:id/workflow-status', async (req, res) => {
    const { id } = req.params;
    const { workflowStatus } = req.body;
    const allVaults = readJSON(VAULTS_PATH);
    const idx = allVaults.findIndex(v => String(v.id) === String(id));

    if (idx === -1) return res.status(404).json({ error: 'Vault not found' });

    allVaults[idx].workflowStatus = workflowStatus;
    await writeJSON(VAULTS_PATH, allVaults);

    // Sync to Google Sheet
    try { await updateVaultInSheet(allVaults[idx]); } catch (e) { console.error('Sheet sync failed:', e); }

    res.json(allVaults[idx]);
});

// Remove Vault
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`[Vaults] Deleting vault with ID: ${id}`);

    let allVaults = readJSON(VAULTS_PATH);
    const initialLength = allVaults.length;

    // Use String comparison to ensure we catch both number and string IDs
    allVaults = allVaults.filter(v => String(v.id) !== String(id));

    if (allVaults.length === initialLength) {
        return res.status(404).json({ error: 'Vault not found' });
    }

    await writeJSON(VAULTS_PATH, allVaults);

    // Sync to Google Sheet (Delete)
    try {
        await deleteVaultFromSheet(id);
        console.log(`[Vaults] Successfully deleted vault from Google Sheet: ${id}`);
    } catch (err) {
        console.error('[Vaults] Google Sheet deletion failed:', err);
        // We still return success because the local delete worked, but log the error
    }

    res.json({ success: true });
});

// Get photos for a specific vault (Client & Admin)
router.get('/:vaultId/photos', async (req, res) => {
    let { vaultId } = req.params;

    // Fix: If vaultId is a full URL, extract the ID
    if (vaultId.includes('drive.google.com') || vaultId.includes('https://')) {
        const match = vaultId.match(/\/folders\/([a-zA-Z0-9-_]+)/);
        if (match && match[1]) {
            vaultId = match[1];
            console.log(`[Vaults] Extracted Folder ID from URL: ${vaultId}`);
        }
    }

    try {
        const rawPhotos = await googleDrive.listFiles(vaultId);

        // Transform photo objects to use our local proxy to ensure they always work
        const photos = rawPhotos.map(p => ({
            ...p,
            googleUrl: p.url, // Original direct GDrive link
            // Use local proxy but append filename for better browser handling
            url: `/vaults/photo/${p.id}`,
            thumbnail: p.thumbnail // keep the smaller one if available
        }));

        res.json({
            vaultId,
            photos
        });
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ error: error.message || 'Could not fetch photos.' });
    }
});

// Image Proxy - Serve Drive images through backend to avoid permission/CORS issues
router.get('/photo/:fileId', async (req, res) => {
    const { fileId } = req.params;
    try {
        const stream = await googleDrive.getFileStream(fileId);

        // Basic caching and content type
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
        res.setHeader('Content-Type', 'image/jpeg'); // Generic but works for most Drive previews

        stream.on('error', (err) => {
            console.error('[Proxy Stream Error]', err.message);
            if (!res.headersSent) res.status(500).end();
        });

        stream.pipe(res);
    } catch (error) {
        console.error(`[Proxy] Error serving file ${fileId}:`, error.message);
        res.status(404).json({ error: 'Image not found or inaccessible' });
    }
});

// Submit/Update photo selection (Client)
router.post('/select', (req, res) => {
    const { mobile, vaultId, selections, vaultName } = req.body;

    const allSelections = readJSON(SELECTIONS_PATH);
    const existingIdx = allSelections.findIndex(s => s.mobile === mobile && s.vaultId === vaultId);

    const selectionData = {
        mobile,
        vaultId,
        vaultName,
        selections,
        timestamp: new Date().toISOString()
    };

    if (existingIdx > -1) {
        allSelections[existingIdx] = selectionData;
    } else {
        allSelections.push(selectionData);
    }

    writeJSON(SELECTIONS_PATH, allSelections);
    res.json({ success: true });
});

// Get all selections (Admin)
router.get('/selections', (req, res) => {
    res.json(readJSON(SELECTIONS_PATH));
});

// Finalize selection - Create delivery folder and copy selected photos
router.post('/finalize', async (req, res) => {
    const { mobile, vaultId, selections, customerId } = req.body;

    // Validate input
    if (!mobile || !vaultId || !selections || !Array.isArray(selections) || selections.length === 0) {
        return res.status(400).json({
            error: 'Missing required fields: mobile, vaultId, selections array'
        });
    }

    // Use mobile as customer ID if not provided
    const customerIdToUse = customerId || mobile;

    console.log(`[Finalize] Starting finalization for customer: ${customerIdToUse}`);
    console.log(`[Finalize] Vault ID: ${vaultId}`);
    console.log(`[Finalize] Selected photos: ${selections.length}`);

    try {
        // 1. Determine where to create the delivery folder
        // Option 1: Use environment variable for a dedicated delivery folder
        // Option 2: Try to get parent folder
        // Option 3: Create inside the vault folder itself

        let parentFolderId = process.env.DELIVERY_FOLDER_ID; // Check env variable first

        if (!parentFolderId) {
            console.log(`[Finalize] No DELIVERY_FOLDER_ID set, attempting to get parent folder...`);
            try {
                parentFolderId = await googleDrive.getParentFolderId(vaultId);
                console.log(`[Finalize] Parent folder ID from API: ${parentFolderId}`);

                // If parent is null or undefined, use vault folder itself
                if (!parentFolderId) {
                    console.log(`[Finalize] Parent folder is null, using vault folder itself as parent`);
                    parentFolderId = vaultId;
                } else {
                    console.log(`[Finalize] Using parent folder: ${parentFolderId}`);
                }
            } catch (error) {
                console.log(`[Finalize] Error getting parent folder: ${error.message}, using vault folder itself as parent`);
                parentFolderId = vaultId; // Use vault folder as parent
            }
        } else {
            console.log(`[Finalize] Using configured DELIVERY_FOLDER_ID: ${parentFolderId}`);
        }

        // Final safety check
        if (!parentFolderId) {
            console.error(`[Finalize] CRITICAL: parentFolderId is still null after all attempts!`);
            return res.status(500).json({
                error: 'Could not determine parent folder for delivery. Please set DELIVERY_FOLDER_ID in environment variables.'
            });
        }

        // 2. Define delivery folder name
        const deliveryFolderName = `${customerIdToUse}_selected_pics`;

        // 3. Check if folder already exists
        let deliveryFolder = await googleDrive.findFolderByName(deliveryFolderName, parentFolderId);

        if (deliveryFolder) {
            console.log(`[Finalize] Delivery folder already exists: ${deliveryFolder.id}`);
        } else {
            // 4. Create new delivery folder
            deliveryFolder = await googleDrive.createFolder(deliveryFolderName, parentFolderId);
            console.log(`[Finalize] Created new delivery folder: ${deliveryFolder.id}`);
        }

        // 5. Copy selected photos to delivery folder
        const copyResults = await googleDrive.copyMultipleFiles(selections, deliveryFolder.id);

        // 6. Update selection status in database
        const allSelections = readJSON(SELECTIONS_PATH);
        const existingIdx = allSelections.findIndex(s => s.mobile === mobile && s.vaultId === vaultId);

        const selectionData = {
            mobile,
            vaultId,
            selections,
            timestamp: new Date().toISOString(),
            finalized: true,
            deliveryFolderId: deliveryFolder.id,
            deliveryFolderName: deliveryFolderName,
            copyResults: {
                total: copyResults.total,
                success: copyResults.success, // Now storing full list of { originalId, copiedId, name }
                failed: copyResults.failed
            }
        };

        if (existingIdx > -1) {
            allSelections[existingIdx] = selectionData;
        } else {
            allSelections.push(selectionData);
        }

        writeJSON(SELECTIONS_PATH, allSelections);

        // 7. Update vault status to locked
        const allVaults = readJSON(VAULTS_PATH);
        const vaultIdx = allVaults.findIndex(v => v.vaultId === vaultId && v.customerMobile === mobile);

        if (vaultIdx > -1) {
            allVaults[vaultIdx].status = 'locked';
            allVaults[vaultIdx].workflowStatus = 'finalized';
            allVaults[vaultIdx].finalizedAt = new Date().toISOString();
            await writeJSON(VAULTS_PATH, allVaults);
        }

        // 8. Return success response
        res.json({
            success: true,
            message: 'Selection finalized successfully',
            deliveryFolder: {
                id: deliveryFolder.id,
                name: deliveryFolderName,
                url: `https://drive.google.com/drive/folders/${deliveryFolder.id}`
            },
            copyResults: {
                total: copyResults.total,
                copied: copyResults.success.length,
                failed: copyResults.failed.length,
                successDetails: copyResults.success,
                failedFiles: copyResults.failed
            }
        });

    } catch (error) {
        console.error('[Finalize] Error during finalization:', error);
        res.status(500).json({
            error: 'Failed to finalize selection',
            details: error.message
        });
    }
});

// Admin: Add a photo to an existing delivery folder
router.post('/delivery/add', async (req, res) => {
    const { vaultId, mobile, photoId } = req.body;

    if (!vaultId || !mobile || !photoId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const allSelections = readJSON(SELECTIONS_PATH);
        const selectionIdx = allSelections.findIndex(s => s.vaultId === vaultId && s.mobile === mobile);

        if (selectionIdx === -1 || !allSelections[selectionIdx].finalized) {
            return res.status(404).json({ error: 'Finalized selection not found' });
        }

        const selection = allSelections[selectionIdx];

        // Ensure copyResults structure exists
        if (!selection.copyResults) selection.copyResults = { total: 0, success: [], failed: [] };
        if (!Array.isArray(selection.copyResults.success)) {
            console.log('[DeliveryAdd] success was not an array, resetting to empty array');
            selection.copyResults.success = [];
        }

        // Check if already in delivery
        if (selection.selections.includes(photoId)) {
            return res.status(400).json({ error: 'Photo already in delivery' });
        }

        // Create shortcut in delivery folder
        const shortcut = await googleDrive.createShortcut(photoId, selection.deliveryFolderId);

        // Update local data
        selection.selections.push(photoId);
        selection.copyResults.success.push({
            originalId: photoId,
            copiedId: shortcut.id,
            name: shortcut.name
        });
        selection.copyResults.total = selection.selections.length;

        allSelections[selectionIdx] = selection;
        await writeJSON(SELECTIONS_PATH, allSelections);

        res.json({ success: true, shortcut });
    } catch (error) {
        console.error('[DeliveryAdd] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Remove a photo from an existing delivery folder
router.post('/delivery/remove', async (req, res) => {
    const { vaultId, mobile, photoId } = req.body;

    if (!vaultId || !mobile || !photoId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const allSelections = readJSON(SELECTIONS_PATH);
        const selectionIdx = allSelections.findIndex(s => s.vaultId === vaultId && s.mobile === mobile);

        if (selectionIdx === -1 || !allSelections[selectionIdx].finalized) {
            return res.status(404).json({ error: 'Finalized selection not found' });
        }

        const selection = allSelections[selectionIdx];

        // Ensure copyResults structure exists
        if (!selection.copyResults || !Array.isArray(selection.copyResults.success)) {
            // If we don't have the shortcut ID, we can't delete from Drive, but we can update local state
            console.warn(`[DeliveryRemove] Cannot find shortcut ID for ${photoId} (success is not an array). Removing local reference only.`);
            selection.selections = selection.selections.filter(id => id !== photoId);
            if (!selection.copyResults) selection.copyResults = { total: 0, success: [], failed: [] };
            selection.copyResults.success = []; // Reset if malformed
            selection.copyResults.total = selection.selections.length;

            allSelections[selectionIdx] = selection;
            writeJSON(SELECTIONS_PATH, allSelections);
            return res.json({ success: true, message: 'Removed locally (Drive sync could not be verified)' });
        }

        // Find the shortcut ID
        const resultIdx = selection.copyResults.success.findIndex(r => r.originalId === photoId);
        if (resultIdx === -1) {
            console.warn(`[DeliveryRemove] Photo ${photoId} not found in success array. Removing local reference.`);
            selection.selections = selection.selections.filter(id => id !== photoId);
            selection.copyResults.total = selection.selections.length;

            allSelections[selectionIdx] = selection;
            writeJSON(SELECTIONS_PATH, allSelections);
            return res.json({ success: true, message: 'Removed locally' });
        }

        const shortcutId = selection.copyResults.success[resultIdx].copiedId;

        // Delete from Google Drive
        try {
            await googleDrive.deleteFile(shortcutId);
        } catch (driveErr) {
            console.error(`[DeliveryRemove] Drive deletion failed for ${shortcutId}:`, driveErr.message);
            // Continue with local removal even if Drive delete fails (maybe file already gone)
        }

        // Update local data
        selection.selections = selection.selections.filter(id => id !== photoId);
        selection.copyResults.success.splice(resultIdx, 1);
        selection.copyResults.total = selection.selections.length;

        allSelections[selectionIdx] = selection;
        await writeJSON(SELECTIONS_PATH, allSelections);

        res.json({ success: true });
    } catch (error) {
        console.error('[DeliveryRemove] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Sync FROM Google Sheets (Admin triggers this)
router.post('/sync-from-sheets', async (req, res) => {
    try {
        const { fetchVaultsFromSheet } = require('../services/googleSheets');
        const sheetVaults = await fetchVaultsFromSheet();

        if (!sheetVaults || sheetVaults.length === 0) {
            return res.status(500).json({ error: 'No data received from Google Sheet' });
        }

        const allVaults = readJSON(VAULTS_PATH);
        let updates = 0;
        let creates = 0;

        sheetVaults.forEach(sheetVault => {
            // Find existing vault by ID or VaultID
            const idx = allVaults.findIndex(v => v.vaultId === sheetVault.vaultId);

            if (idx > -1) {
                // Update existing
                const v = allVaults[idx];
                let changed = false;

                // Map fields from Sheet to Vault Object
                if (sheetVault.customerName && v.customerName !== sheetVault.customerName) { v.customerName = sheetVault.customerName; changed = true; }
                if (sheetVault.customerMobile && v.customerMobile !== String(sheetVault.customerMobile)) { v.customerMobile = String(sheetVault.customerMobile); changed = true; }
                if (sheetVault.sessionTitle && v.sessionTitle !== sheetVault.sessionTitle) { v.sessionTitle = sheetVault.sessionTitle; changed = true; }
                if (sheetVault.sessionType && v.sessionType !== sheetVault.sessionType) { v.sessionType = sheetVault.sessionType; changed = true; }
                if (sheetVault.status && v.status !== sheetVault.status.toLowerCase()) { v.status = sheetVault.status.toLowerCase(); changed = true; }
                if (sheetVault.workflowStatus && v.workflowStatus !== sheetVault.workflowStatus.toLowerCase()) { v.workflowStatus = sheetVault.workflowStatus.toLowerCase(); changed = true; }
                if (sheetVault.finalizedAt && v.finalizedAt !== sheetVault.finalizedAt) { v.finalizedAt = sheetVault.finalizedAt; changed = true; }

                if (changed) updates++;
            } else {
                // Create new from Sheet (Only if it has a valid Vault ID that we generated previously, or manual entry)
                // Note: Creating entirely new vaults from Sheet without a folder ID structure might break things, 
                // but we will allow it for data restoration purposes.
                if (sheetVault.vaultId) {
                    allVaults.push({
                        id: Date.now().toString() + Math.floor(Math.random() * 100), // Generate a temp local ID
                        vaultId: sheetVault.vaultId,
                        customerName: sheetVault.customerName || 'Unknown',
                        customerMobile: String(sheetVault.customerMobile || ''),
                        sessionTitle: sheetVault.sessionTitle || 'Imported Session',
                        sessionType: sheetVault.sessionType || 'Portrait',
                        createdAt: sheetVault.createdAt || new Date().toISOString(),
                        status: (sheetVault.status || 'active').toLowerCase(),
                        workflowStatus: (sheetVault.workflowStatus || 'pending').toLowerCase(),
                        finalizedAt: sheetVault.finalizedAt || undefined
                    });
                    creates++;
                }
            }
        });

        await writeJSON(VAULTS_PATH, allVaults);
        res.json({ success: true, updates, creates, total: allVaults.length });

    } catch (error) {
        console.error('Sync ERROR:', error);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
