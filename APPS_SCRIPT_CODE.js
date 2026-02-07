/**
 * GOOGLE APPS SCRIPT CODE
 * -----------------------
 * Copy and paste this ENTIRE code into your Google Apps Script project.
 * linked to the spreadsheet: shashiniclientmessage
 *
 * IMPORTANT:
 * 1. Ensure your spreadsheet has two tabs (sheets):
 *    - "message" (for inquiries)
 *    - "booking" (for session bookings)
 * 2. In the "booking" sheet, create the following headers in Row 1:
 *    A1: ID
 *    B1: Client Name
 *    C1: Mobile
 *    D1: Email
 *    E1: Event Type
 *    F1: Date
 *    G1: Status
 *    H1: Notes
 *    I1: Created At
 * 3. After pasting, click "Deploy" > "New deployment" > Select type "Web app".
 * 4. Set "Execute as" to "Me".
 * 5. Set "Who has access" to "Anyone".
 * 6. Click "Deploy" and copy the Web App URL.
 */

function doGet(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        const action = e.parameter.action;

        if (action === 'getBookings') {
            return getBookings();
        } else if (action === 'getVaults') {
            return getVaults();
        } else if (action === 'getCMS') {
            return getCMS();
        } else {
            // Default to getMessages for backward compatibility or explicit action
            return getMessages();
        }

    } catch (e) {
        return ContentService.createTextOutput(JSON.stringify({ 'error': e.toString() })).setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        const data = JSON.parse(e.postData.contents);
        const action = data.action;

        if (action === 'addBooking') {
            return addBooking(data);
        } else if (action === 'updateBooking') {
            return updateBooking(data);
        } else if (action === 'deleteBooking') {
            return deleteBooking(data);
        } else if (action === 'addVault') {
            return addVault(data);
        } else if (action === 'updateVault') {
            return updateVault(data);
        } else if (action === 'deleteVault') {
            return deleteVault(data);
        } else if (action === 'updateMessage') {
            return updateMessage(data);
        } else if (action === 'saveGallery') {
            return saveCMS('items', data.item);
        } else if (action === 'deleteGallery') {
            return deleteCMS('items', data.id);
        } else if (action === 'saveHeroSlide') {
            return saveCMS('heroSlides', data.slide);
        } else if (action === 'deleteHeroSlide') {
            return deleteCMS('heroSlides', data.id);
        } else if (action === 'saveHeroConfig') {
            return saveCMS('heroConfig', data.config);
        } else if (action === 'saveGraphic') {
            return saveCMS('graphics', { key: data.key, url: data.url });
        } else {
            return addMessage(data); // Default to addMessage
        }
    } catch (e) {
        return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': e.toString() })).setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

// --- VAULT FUNCTIONS ---

function getVaults() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('vaults');
    if (!sheet) return responseJSON([]);

    const rows = sheet.getDataRange().getValues();
    const headers = rows.shift(); // Remove headers

    if (rows.length === 0) return responseJSON([]);

    // Columns: 
    // A: ID, B: VaultID, C: Title, D: Name, E: Mobile, F: Type, G: Status, H: CreatedAt, I: Workflow
    const vaults = rows.map(row => ({
        id: String(row[0]),
        vaultId: row[1],
        sessionTitle: row[2],
        customerName: row[3],
        customerMobile: String(row[4]),
        sessionType: row[5],
        status: row[6],
        createdAt: row[7],
        workflowStatus: row[8] || 'pending'
    }));

    return responseJSON(vaults);
}

function addVault(data) {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('vaults');
    if (!sheet) {
        // Auto-create if missing
        sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('vaults');
        sheet.appendRow(['ID', 'Vault ID', 'Session Title', 'Customer Name', 'Customer Mobile', 'Session Type', 'Status', 'Created At', 'Workflow Status']);
    }

    const newRow = [
        data.id || new Date().getTime().toString(),
        data.vaultId,
        data.sessionTitle,
        data.customerName,
        data.customerMobile,
        data.sessionType,
        data.status || 'active',
        new Date().toISOString(),
        data.workflowStatus || 'pending'
    ];

    sheet.appendRow(newRow);
    return responseJSON({ 'result': 'success', 'id': newRow[0] });
}

function updateVault(data) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('vaults');
    if (!sheet) return responseJSON({ 'result': 'error', 'message': 'Sheet not found' });
    const rows = sheet.getDataRange().getValues();

    for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.id)) {
            if (data.vaultId) sheet.getRange(i + 1, 2).setValue(data.vaultId);
            if (data.sessionTitle) sheet.getRange(i + 1, 3).setValue(data.sessionTitle);
            if (data.customerName) sheet.getRange(i + 1, 4).setValue(data.customerName);
            if (data.customerMobile) sheet.getRange(i + 1, 5).setValue(data.customerMobile);
            if (data.sessionType) sheet.getRange(i + 1, 6).setValue(data.sessionType);
            if (data.status) sheet.getRange(i + 1, 7).setValue(data.status);
            if (data.workflowStatus) sheet.getRange(i + 1, 9).setValue(data.workflowStatus);
            return responseJSON({ 'result': 'success', 'updated': true });
        }
    }
    return responseJSON({ 'result': 'error', 'message': 'ID not found' });
}

function deleteVault(data) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('vaults');
    if (!sheet) return responseJSON({ 'result': 'error', 'message': 'Sheet not found' });
    const rows = sheet.getDataRange().getValues();

    for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.id)) {
            sheet.deleteRow(i + 1);
            return responseJSON({ 'result': 'success', 'deleted': true });
        }
    }
    return responseJSON({ 'result': 'error', 'message': 'ID not found' });
}

// --- BOOKING FUNCTIONS ---

function getBookings() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('booking');
    if (!sheet) return responseJSON([]);

    const rows = sheet.getDataRange().getValues();
    const headers = rows.shift(); // Remove headers

    if (rows.length === 0) return responseJSON([]);

    // Map rows to objects based on fixed column order matched to headers
    // ID, Client Name, Mobile, Email, Event Type, Date, Status, Notes, Created At
    const bookings = rows.map(row => ({
        id: row[0],
        clientName: row[1],
        mobile: row[2],
        email: row[3],
        eventType: row[4],
        date: row[5],
        status: row[6],
        notes: row[7],
        createdAt: row[8]
    }));

    return responseJSON(bookings);
}

function addBooking(data) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('booking');
    if (!sheet) throw new Error("Sheet 'booking' not found");

    const newRow = [
        data.id || new Date().getTime().toString(), // Generate ID if missing
        data.clientName,
        data.mobile,
        data.email,
        data.eventType,
        data.date,         // YYYY-MM-DD
        data.status || 'pending',
        data.notes,
        new Date().toISOString()
    ];

    sheet.appendRow(newRow);
    return responseJSON({ 'result': 'success', 'id': newRow[0] });
}

function updateBooking(data) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('booking');
    const rows = sheet.getDataRange().getValues();

    // Find row by ID (Column A / Index 0)
    for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.id)) {
            // Update specific fields if provided
            if (data.status) sheet.getRange(i + 1, 7).setValue(data.status); // Status is Col G (7)
            if (data.clientName) sheet.getRange(i + 1, 2).setValue(data.clientName);
            if (data.mobile) sheet.getRange(i + 1, 3).setValue(data.mobile);
            if (data.email) sheet.getRange(i + 1, 4).setValue(data.email);
            if (data.eventType) sheet.getRange(i + 1, 5).setValue(data.eventType);
            if (data.date) sheet.getRange(i + 1, 6).setValue(data.date);
            if (data.notes) sheet.getRange(i + 1, 8).setValue(data.notes);

            return responseJSON({ 'result': 'success', 'updated': true });
        }
    }
    return responseJSON({ 'result': 'error', 'message': 'ID not found' });
}

function deleteBooking(data) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('booking');
    const rows = sheet.getDataRange().getValues();

    for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.id)) {
            sheet.deleteRow(i + 1);
            return responseJSON({ 'result': 'success', 'deleted': true });
        }
    }
    return responseJSON({ 'result': 'error', 'message': 'ID not found' });
}


// --- MESSAGE FUNCTIONS (Existing) ---

function getMessages() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('message');
    if (!sheet) return responseJSON([]);
    const rows = sheet.getDataRange().getValues();
    const headers = rows.shift();
    const messages = rows.map(row => ({
        timestamp: row[0],
        sender: row[1],
        mobile: row[2],
        email: row[3],
        text: row[4],
        replies: row[5] ? JSON.parse(row[5]) : [] // Assuming replies are stored as JSON string in Col F
    }));
    return responseJSON(messages);
}

function addMessage(data) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('message');
    sheet.appendRow([data.timestamp || new Date().toISOString(), data.sender, data.mobile, data.email, data.text, '[]', data.status || 'received']);
    return responseJSON({ 'result': 'success' });
}

function updateMessage(data) {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('message');
    if (!sheet) sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Message');

    if (!sheet) return responseJSON({ 'result': 'error', 'message': 'Sheet "message" or "Message" not found' });

    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];

    // Ensure Status header
    if (headers.length < 7 || String(headers[6]).toLowerCase() !== 'status') {
        sheet.getRange(1, 7).setValue('Status');
    }

    // Aggressive cleaning function
    const clean = function (str) {
        return String(str || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
    };

    const targetMobile = clean(data.mobile);
    const targetText = clean(data.text);

    for (let i = 1; i < rows.length; i++) {
        const rowMobile = clean(rows[i][2]);
        const rowText = clean(rows[i][4]);

        if (rowMobile === targetMobile && rowText === targetText) {
            if (data.status) sheet.getRange(i + 1, 7).setValue(data.status);
            if (data.replies) sheet.getRange(i + 1, 6).setValue(JSON.stringify(data.replies));
            SpreadsheetApp.flush();
            return responseJSON({ 'result': 'success', 'updated': true, 'row': i + 1 });
        }
    }
    return responseJSON({ 'result': 'error', 'message': 'No match for ' + data.mobile });
}

// --- HELPER ---

// --- CMS FUNCTIONS ---

function getCMS() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('cms');
    if (!sheet) return responseJSON({ items: [], hero: { slides: [], interval: 5 }, graphics: {} });

    const rows = sheet.getDataRange().getValues();
    const headers = rows.shift();

    const cms = { items: [], hero: { slides: [], interval: 5 }, graphics: {} };

    rows.forEach(row => {
        const type = row[0]; // 'gallery', 'heroSlide', 'heroConfig', 'graphic'
        const data = row[1] ? JSON.parse(row[1]) : null;
        if (!data) return;

        if (type === 'gallery') cms.items.push(data);
        else if (type === 'heroSlide') cms.hero.slides.push(data);
        else if (type === 'heroConfig') cms.hero = { ...cms.hero, ...data };
        else if (type === 'graphic') {
            cms.graphics[data.key] = data.url;
        }
    });

    return responseJSON(cms);
}

function saveCMS(type, data) {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('cms');
    if (!sheet) {
        sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('cms');
        sheet.appendRow(['Type', 'Data']);
    }

    const rows = sheet.getDataRange().getValues();

    if (type === 'graphics') {
        // Update existing key or add new
        for (let i = 1; i < rows.length; i++) {
            const rowType = rows[i][0];
            const rowData = rows[i][1] ? JSON.parse(rows[i][1]) : null;
            if (rowType === 'graphic' && rowData && rowData.key === data.key) {
                sheet.getRange(i + 1, 2).setValue(JSON.stringify(data));
                return responseJSON({ result: 'success' });
            }
        }
        sheet.appendRow(['graphic', JSON.stringify(data)]);
    } else if (type === 'heroConfig') {
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === 'heroConfig') {
                sheet.getRange(i + 1, 2).setValue(JSON.stringify(data));
                return responseJSON({ result: 'success' });
            }
        }
        sheet.appendRow(['heroConfig', JSON.stringify(data)]);
    } else {
        // Gallery or Hero Slides
        const rowType = type === 'items' ? 'gallery' : 'heroSlide';
        sheet.appendRow([rowType, JSON.stringify(data)]);
    }

    return responseJSON({ result: 'success' });
}

function deleteCMS(type, id) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('cms');
    if (!sheet) return responseJSON({ result: 'error' });

    const rows = sheet.getDataRange().getValues();
    const rowType = type === 'items' ? 'gallery' : 'heroSlide';

    for (let i = 1; i < rows.length; i++) {
        const data = rows[i][1] ? JSON.parse(rows[i][1]) : null;
        if (rows[i][0] === rowType && data && String(data.id) === String(id)) {
            sheet.deleteRow(i + 1);
            return responseJSON({ result: 'success' });
        }
    }
    return responseJSON({ result: 'error' });
}

function responseJSON(data) {
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function myFunction() {
    Logger.log("Apps Script is ready. Use 'Deploy' to update the Web App.");
}
