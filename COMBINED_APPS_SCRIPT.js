/**
 * DEFINITIVE COMBINED GOOGLE APPS SCRIPT
 * -------------------------------------
 * This script combines EVERYTHING: Bookings, Vaults, CMS (Gallery/Hero/Graphics), 
 * Messages, and Client Profiles into one powerful backend.
 * 
 * Includes Google Drive Image Storage for CMS.
 * 
 * 1. Copy this entire code.
 * 2. Delete EVERYTHING in your current Apps Script Editor.
 * 3. Paste this code.
 * 4. Ensure you have tabs named: "vaults", "booking", "message", "clientlogin", "studiocms".
 * 5. Click "Deploy" > "New Deployment" > "Web App".
 */

const CMS_TAB_NAME = "studiocms";
const MEDIA_FOLDER_NAME = "Studio_Website_Media";

function doGet(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);
    try {
        var action = e.parameter.action;
        if (action === 'getVaults') return getVaults();
        if (action === 'getBookings') return getBookings();
        if (action === 'getCMS') return getCMS();
        if (action === 'getProfile') return getClientProfile(e.parameter.mobile);
        return getMessages(); // Default
    } catch (e) {
        return responseJSON({ 'error': e.toString() });
    } finally {
        lock.releaseLock();
    }
}

function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(30000); // 30 second lock for large uploads
    try {
        var data = JSON.parse(e.postData.contents);
        var action = data.action;

        // VAULT ACTIONS
        if (action === 'addVault' || action === 'updateVault') return handleVault(data, action);
        if (action === 'deleteVault') return deleteVault(data.id);

        // BOOKING ACTIONS
        if (action === 'addBooking') return addBooking(data);
        if (action === 'updateBooking') return updateBooking(data);
        if (action === 'deleteBooking') return deleteBooking(data.id);

        // CMS ACTIONS - Using New Logic
        if (action === 'addMedia' || action === 'saveGallery' || action === 'saveHeroSlide' || action === 'saveGraphic') {
            return saveCMSMedia(data);
        }
        if (action === 'deleteMedia' || action === 'deleteGallery' || action === 'deleteHeroSlide') {
            return deleteCMSMedia(data.id);
        }
        if (action === 'saveHeroConfig') return saveHeroConfig(data);

        // PROFILE & LOGIN
        if (action === 'updateProfile') return updateClientProfile(data);
        if (action === 'logLogin') return logClientLogin(data);
        if (action === 'updateMessage') return updateMessage(data);

        return addMessage(data); // Default
    } catch (e) {
        return responseJSON({ 'result': 'error', 'error': e.toString() });
    } finally {
        lock.releaseLock();
    }
}

function responseJSON(data) {
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

// --- NEW CMS LOGIC (With Google Drive) ---

function getCMS() {
    var sheet = getOrCreateSheet(CMS_TAB_NAME);
    var rows = sheet.getDataRange().getValues();
    rows.shift(); // Remove headers

    var cms = { items: [], hero: { slides: [], interval: 5 }, graphics: {} };

    rows.forEach(function (row) {
        var id = row[0];
        var section = row[1];
        var type = row[2];
        var title = row[3];
        var url = row[4];

        if (section === "Gallery") cms.items.push({ id: id, type: type, title: title, url: url });
        else if (section === "HeroSlide") cms.hero.slides.push({ id: id, type: type, title: title, url: url });
        else if (section === "Config" && title === "interval") cms.hero.interval = parseInt(url) || 5;
        else if (section === "Graphic") cms.graphics[type] = url; // For graphics, we store key in 'type' column for simplicity or mapping
    });
    return responseJSON(cms);
}

function getOrCreateMediaFolder() {
    const folders = DriveApp.getFoldersByName(MEDIA_FOLDER_NAME);
    if (folders.hasNext()) return folders.next();
    return DriveApp.createFolder(MEDIA_FOLDER_NAME);
}

function saveCMSMedia(data) {
    var sheet = getOrCreateSheet(CMS_TAB_NAME);
    var finalUrl = data.url;
    var section = data.section;

    // Normalize section names
    if (data.action === 'saveHeroSlide') section = "HeroSlide";
    if (data.action === 'saveGallery') section = "Gallery";
    if (data.action === 'saveGraphic') section = "Graphic";

    // Base64 Upload to Drive
    if (data.url && data.url.toString().startsWith("data:")) {
        try {
            var folder = getOrCreateMediaFolder();
            var contentType = data.url.substring(5, data.url.indexOf(";"));
            var bytes = Utilities.base64Decode(data.url.split(",")[1]);
            var fileName = (data.title || data.key || "upload") + "_" + new Date().getTime();

            var file = folder.createFile(Utilities.newBlob(bytes, contentType, fileName));
            file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

            finalUrl = "https://drive.google.com/uc?export=view&id=" + file.getId();
        } catch (e) {
            return responseJSON({ success: false, error: "Drive Upload Failed: " + e.toString() });
        }
    }

    // Handle Graphics Updates (Overwrite existing key)
    if (section === "Graphic") {
        var key = data.key || data.type; // frontend sends key
        var rows = sheet.getDataRange().getValues();
        for (var i = 1; i < rows.length; i++) {
            if (rows[i][1] === "Graphic" && rows[i][2] === key) {
                sheet.getRange(i + 1, 5).setValue(finalUrl);
                return responseJSON({ success: true, url: finalUrl });
            }
        }
        // If not found, append
        sheet.appendRow([new Date().getTime().toString(), "Graphic", key, "Graphic Image", finalUrl]);
        return responseJSON({ success: true, url: finalUrl });
    }

    // Append standard media (Gallery/Hero)
    var newId = data.id || new Date().getTime().toString();
    sheet.appendRow([newId, section, data.type || 'image', data.title || '', finalUrl]);
    return responseJSON({ success: true, id: newId, url: finalUrl });
}

function deleteCMSMedia(id) {
    var sheet = getOrCreateSheet(CMS_TAB_NAME);
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(id)) {
            sheet.deleteRow(i + 1);
            return responseJSON({ success: true });
        }
    }
    return responseJSON({ success: false, error: 'ID not found' });
}

function saveHeroConfig(data) {
    var sheet = getOrCreateSheet(CMS_TAB_NAME);
    var rows = sheet.getDataRange().getValues();
    var found = false;
    for (var i = 1; i < rows.length; i++) {
        if (rows[i][1] === "Config" && rows[i][3] === "interval") {
            sheet.getRange(i + 1, 5).setValue(data.interval);
            found = true; break;
        }
    }
    if (!found) sheet.appendRow([new Date().getTime(), "Config", "number", "interval", data.interval]);
    return responseJSON({ success: true });
}


// --- VAULT LOGIC ---
function getVaults() {
    var sheet = getOrCreateSheet('vaults');
    var rows = sheet.getDataRange().getValues();
    var headers = rows.shift();
    var colMap = {};
    headers.forEach(function (h, i) { colMap[h.toString().trim()] = i; });
    var vaults = rows.map(function (row) {
        return {
            id: row[colMap['ID']], customerName: row[colMap['Customer Name']],
            customerMobile: row[colMap['Customer Mobile']], sessionTitle: row[colMap['Session Title']],
            sessionType: row[colMap['Session Type']], createdAt: row[colMap['Created At']],
            status: row[colMap['Status']], workflowStatus: row[colMap['Workflow Status']],
            vaultId: row[colMap['Vault ID']]
        };
    }).filter(function (v) { return v.id; });
    return responseJSON(vaults);
}

function handleVault(data, action) {
    var sheet = getOrCreateSheet('vaults');
    var rows = sheet.getDataRange().getValues();
    var headers = rows[0];
    var colMap = {};
    headers.forEach(function (h, i) { colMap[h.toString().trim()] = i; });

    var rowIndex = -1;
    for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][colMap['ID']]) === String(data.id)) { rowIndex = i + 1; break; }
    }

    if (rowIndex === -1) {
        var newRow = headers.map(function () { return ""; });
        newRow[colMap['ID']] = data.id || new Date().getTime().toString();
        newRow[colMap['Vault ID']] = data.vaultId;
        newRow[colMap['Session Title']] = data.sessionTitle;
        newRow[colMap['Customer Name']] = data.customerName;
        newRow[colMap['Customer Mobile']] = data.customerMobile;
        newRow[colMap['Session Type']] = data.sessionType;
        newRow[colMap['Status']] = data.status || 'active';
        newRow[colMap['Created At']] = new Date().toISOString();
        newRow[colMap['Workflow Status']] = data.workflowStatus || 'pending';
        sheet.appendRow(newRow);
    } else {
        var range = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn());
        var rowValues = range.getValues()[0];
        if (data.vaultId) rowValues[colMap['Vault ID']] = data.vaultId;
        if (data.sessionTitle) rowValues[colMap['Session Title']] = data.sessionTitle;
        if (data.customerName) rowValues[colMap['Customer Name']] = data.customerName;
        if (data.status) rowValues[colMap['Status']] = data.status;
        if (data.workflowStatus) rowValues[colMap['Workflow Status']] = data.workflowStatus;
        range.setValues([rowValues]);
    }
    return responseJSON({ result: 'success' });
}

function deleteVault(id) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('vaults');
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(id)) { sheet.deleteRow(i + 1); return responseJSON({ result: 'success' }); }
    }
    return responseJSON({ result: 'error' });
}

// --- HELPERS ---
function getOrCreateSheet(name) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
        sheet = ss.insertSheet(name);
        if (name === 'vaults') sheet.appendRow(['ID', 'Vault ID', 'Session Title', 'Customer Name', 'Customer Mobile', 'Session Type', 'Status', 'Created At', 'Workflow Status']);
        if (name === 'studiocms') sheet.appendRow(['ID', 'Section', 'Type', 'Title', 'URL']);
        if (name === 'booking') sheet.appendRow(['ID', 'Client Name', 'Mobile', 'Email', 'Event Type', 'Date', 'Status', 'Notes', 'Created At']);
        if (name === 'message') sheet.appendRow(['Timestamp', 'Sender', 'Mobile', 'Email', 'Text', 'Replies', 'Status']);
        if (name === 'clientlogin') sheet.appendRow(['Mobile', 'Name', 'Email', 'Created At', 'Last Login', 'Login Count']);
    }
    return sheet;
}

// --- OTHER LOGIC (Bookings, Messages, Profiles) ---

function getBookings() {
    var sheet = getOrCreateSheet('booking');
    var rows = sheet.getDataRange().getValues();
    rows.shift();
    var bookings = rows.map(function (r) {
        return { id: r[0], clientName: r[1], mobile: r[2], eventType: r[4], date: r[5], status: r[6] };
    });
    return responseJSON(bookings);
}

function addBooking(data) {
    var sheet = getOrCreateSheet('booking');
    sheet.appendRow([data.id || new Date().getTime().toString(), data.clientName, data.mobile, data.email, data.eventType, data.date, 'pending', data.notes, new Date().toISOString()]);
    return responseJSON({ result: 'success' });
}

function updateBooking(data) {
    var sheet = getOrCreateSheet('booking');
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.id)) {
            if (data.status) sheet.getRange(i + 1, 7).setValue(data.status);
            return responseJSON({ result: 'success' });
        }
    }
}

function deleteBooking(id) {
    var sheet = getOrCreateSheet('booking');
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(id)) { sheet.deleteRow(i + 1); return responseJSON({ result: 'success' }); }
    }
}

function getMessages() {
    var sheet = getOrCreateSheet('message');
    var rows = sheet.getDataRange().getValues();
    rows.shift();
    var messages = rows.map(function (r) {
        return { timestamp: r[0], sender: r[1], mobile: r[2], text: r[4], status: r[6] };
    });
    return responseJSON(messages);
}

function addMessage(data) {
    var sheet = getOrCreateSheet('message');
    sheet.appendRow([new Date().toISOString(), data.sender, data.mobile, data.email, data.text, '[]', 'received']);
    return responseJSON({ result: 'success' });
}

function updateMessage(data) {
    var sheet = getOrCreateSheet('message');
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][2]) === String(data.mobile)) {
            if (data.status) sheet.getRange(i + 1, 7).setValue(data.status);
            return responseJSON({ result: 'success' });
        }
    }
}

function getClientProfile(mobile) {
    var sheet = getOrCreateSheet('clientlogin');
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(mobile)) {
            return responseJSON({ found: true, name: rows[i][1], email: rows[i][2] });
        }
    }
    return responseJSON({ found: false });
}

function updateClientProfile(data) {
    var sheet = getOrCreateSheet('clientlogin');
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.mobile)) {
            sheet.getRange(i + 1, 2).setValue(data.name);
            sheet.getRange(i + 1, 3).setValue(data.email);
            return responseJSON({ result: 'success' });
        }
    }
    sheet.appendRow([data.mobile, data.name, data.email, new Date().toISOString(), new Date().toISOString(), 1]);
    return responseJSON({ result: 'success' });
}

function logClientLogin(data) {
    var sheet = getOrCreateSheet('clientlogin');
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.mobile)) {
            sheet.getRange(i + 1, 5).setValue(new Date().toISOString());
            var count = parseInt(rows[i][5] || 0) + 1;
            sheet.getRange(i + 1, 6).setValue(count);
            return responseJSON({ result: 'success' });
        }
    }
    return updateClientProfile(data);
}
