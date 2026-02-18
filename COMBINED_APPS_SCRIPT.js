/**
 * SUPREME COMBINED GOOGLE APPS SCRIPT - SHASHINI STUDIO
 * -----------------------------------------------------
 * Features:
 * 1. HIGH SPEED: Uses in-memory processing for rapid data retrieval.
 * 2. CASE INSENSITIVE: "getCMS" or "getcms" both work perfectly.
 * 3. MASTER SYNC: Real-time synchronization between Google Sheets and Web.
 * 4. ALL-IN-ONE: Vaults, Bookings, CMS, Messages, and Client Profiles.
 * 5. DRIVE STORAGE: Automatically handles base64 image uploads to Google Drive.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Apps Script Editor.
 * 2. Delete ALL existing code (Ensure you have NO other .gs files).
 * 3. Paste this entire script.
 * 4. Ensure your Sheet has these tabs: "studiocms", "vaults", "booking", "message", "clientlogin".
 * 5. Deploy as Web App -> Execute as: "Me" -> Who has access: "Anyone".
 */

// --- CONFIGURATION ---
const TABS = {
    CMS: "studiocms",
    VAULTS: "vaults",
    BOOKINGS: "booking",
    MESSAGES: "message",
    CLIENTS: "clientlogin"
};
const DRIVE_FOLDER_NAME = "Studio_Website_Media";

// --- MAIN ENTRY POINTS ---

/**
 * Handle GET requests (Fetching data)
 * Note: Do NOT run this function directly in the editor. use 'testDoGet' instead.
 */
function doGet(e) {
    // Prevent error if running manually without parameters
    if (!e || !e.parameter) {
        return ContentService.createTextOutput("Error: This script must be run as a Web App. Use the 'testDoGet' function for debugging.");
    }

    const action = (e.parameter.action || "").toLowerCase();

    try {
        if (action === 'getcms') return getCMSData();
        if (action === 'getvaults') return getVaultsData();
        if (action === 'getbookings') return getBookingsData();
        if (action === 'getmessages') return getMessagesData();
        if (action === 'getprofile') return getProfileData(e.parameter.mobile);

        // Default fallback
        return responseJSON({ status: "online", message: "Shashini Studio Backend is Active" });
    } catch (err) {
        return responseJSON({ success: false, error: err.toString() });
    }
}

/**
 * Handle POST requests (Saving data)
 */
function doPost(e) {
    if (!e || !e.postData) {
        return ContentService.createTextOutput("Error: No POST data received.");
    }

    const lock = LockService.getScriptLock();
    lock.tryLock(30000); // 30s lock for safety

    try {
        const data = JSON.parse(e.postData.contents);
        const action = (data.action || "").toLowerCase();

        // CMS Actions
        if (['addmedia', 'savegallery', 'saveheroslide', 'savegraphic'].includes(action)) return saveCMSMedia(data);
        if (['deletemedia', 'deletegallery', 'deleteheroslide'].includes(action)) return deleteCMSMedia(data.id);
        if (action === 'saveheroconfig') return saveHeroConfig(data);

        // Vault Actions
        if (action === 'addvault' || action === 'updatevault') return handleVault(data);
        if (action === 'deletevault') return deleteVault(data.id);

        // Booking Actions
        if (action === 'addbooking') return addBooking(data);
        if (action === 'updatebooking') return updateBooking(data);
        if (action === 'deletebooking') return deleteBooking(data.id);

        // Message Actions
        if (action === 'addmessage' || !action) return addMessage(data); // Default POST is message
        if (action === 'updatemessage') return updateMessage(data);

        // Client/Profile Actions
        if (action === 'updateprofile') return updateProfile(data);
        if (action === 'loglogin') return logLogin(data);

        return responseJSON({ success: false, error: "Action not recognized" });
    } catch (err) {
        return responseJSON({ success: false, error: err.toString() });
    } finally {
        lock.releaseLock();
    }
}

// --- CMS LOGIC ---

function getCMSData() {
    const sheet = getSheet(TABS.CMS);
    const rows = sheet.getDataRange().getValues();
    const headers = rows.shift();

    const result = { items: [], hero: { slides: [], interval: 5 }, graphics: {} };

    rows.forEach(row => {
        const [id, section, type, title, url] = row;
        if (!section) return;

        const s = section.toString().toLowerCase();
        if (s === 'gallery') result.items.push({ id: String(id), type, title, url });
        else if (s === 'heroslide') result.hero.slides.push({ id: String(id), type, title, url });
        else if (s === 'config' && String(title).toLowerCase() === 'interval') result.hero.interval = parseInt(url) || 5;
        else if (s === 'graphic') result.graphics[title] = url;
    });

    return responseJSON(result);
}

function saveCMSMedia(data) {
    const sheet = getSheet(TABS.CMS);
    let section = data.section || "Gallery";
    const action = (data.action || "").toLowerCase();

    // Normalize Section
    if (action === 'saveheroslide') section = "HeroSlide";
    if (action === 'savegraphic') section = "Graphic";

    let finalUrl = data.url;

    // Handle Base64 Drive Upload
    if (finalUrl && finalUrl.toString().startsWith("data:")) {
        const folder = getOrCreateFolder(DRIVE_FOLDER_NAME);
        const contentType = finalUrl.substring(5, finalUrl.indexOf(";"));
        const bytes = Utilities.base64Decode(finalUrl.split(",")[1]);
        const fileName = (data.title || data.key || "upload") + "_" + Date.now();
        const file = folder.createFile(Utilities.newBlob(bytes, contentType, fileName));
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        finalUrl = "https://drive.google.com/uc?export=view&id=" + file.getId();
    }

    // Handle Graphics (Update existing key)
    if (section.toLowerCase() === "graphic") {
        const key = data.key || data.title;
        const values = sheet.getDataRange().getValues();
        for (let i = 1; i < values.length; i++) {
            // Col 1=Section, Col 3=Title(Key)
            if (String(values[i][1]).toLowerCase() === "graphic" && String(values[i][3]).toLowerCase() === key.toLowerCase()) {
                sheet.getRange(i + 1, 5).setValue(finalUrl);
                return responseJSON({ success: true, url: finalUrl });
            }
        }
    }

    const newId = data.id || Date.now().toString();
    sheet.appendRow([newId, section, data.type || "image", data.title || "", finalUrl]);
    return responseJSON({ success: true, id: newId, url: finalUrl });
}

function deleteCMSMedia(id) {
    const sheet = getSheet(TABS.CMS);
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
        if (String(values[i][0]) === String(id)) {
            sheet.deleteRow(i + 1);
            return responseJSON({ success: true });
        }
    }
    return responseJSON({ success: false, error: "Media ID not found" });
}

function saveHeroConfig(data) {
    const sheet = getSheet(TABS.CMS);
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
        if (String(values[i][1]).toLowerCase() === "config" && String(values[i][3]).toLowerCase() === "interval") {
            sheet.getRange(i + 1, 5).setValue(data.interval);
            return responseJSON({ success: true });
        }
    }
    sheet.appendRow([Date.now().toString(), "Config", "number", "interval", data.interval]);
    return responseJSON({ success: true });
}

// --- VAULT LOGIC ---

function getVaultsData() {
    const sheet = getSheet(TABS.VAULTS);
    const rows = sheet.getDataRange().getValues();
    const headers = rows.shift();
    const vaults = rows.map(r => ({
        id: String(r[0]), vaultId: r[1], sessionTitle: r[2], customerName: r[3],
        customerMobile: String(r[4]), sessionType: r[5], status: r[6], createdAt: r[7], workflowStatus: r[8] || 'pending'
    })).filter(v => v.id);
    return responseJSON(vaults);
}

function handleVault(data) {
    const sheet = getSheet(TABS.VAULTS);
    const rows = sheet.getDataRange().getValues();
    let foundRow = -1;
    for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.id)) { foundRow = i + 1; break; }
    }

    if (foundRow === -1) {
        sheet.appendRow([
            data.id || Date.now().toString(), data.vaultId || "", data.sessionTitle || "",
            data.customerName || "", data.customerMobile || "", data.sessionType || "",
            data.status || "active", new Date().toISOString(), data.workflowStatus || "pending"
        ]);
    } else {
        // Correctly updating columns based on their index (1-based)
        if (data.vaultId) sheet.getRange(foundRow, 2).setValue(data.vaultId);
        if (data.sessionTitle) sheet.getRange(foundRow, 3).setValue(data.sessionTitle);
        if (data.customerName) sheet.getRange(foundRow, 4).setValue(data.customerName);
        if (data.status) sheet.getRange(foundRow, 7).setValue(data.status);
        if (data.workflowStatus) sheet.getRange(foundRow, 9).setValue(data.workflowStatus);
    }
    return responseJSON({ success: true });
}

function deleteVault(id) {
    const sheet = getSheet(TABS.VAULTS);
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(id)) { sheet.deleteRow(i + 1); return responseJSON({ success: true }); }
    }
    return responseJSON({ success: false });
}

// --- BOOKING LOGIC ---

function getBookingsData() {
    const sheet = getSheet(TABS.BOOKINGS);
    const rows = sheet.getDataRange().getValues();
    rows.shift();
    const bookings = rows.map(r => ({
        id: String(r[0]), clientName: r[1], mobile: String(r[2]), email: r[3], eventType: r[4], date: r[5], status: r[6]
    }));
    return responseJSON(bookings);
}

function addBooking(data) {
    const sheet = getSheet(TABS.BOOKINGS);
    sheet.appendRow([
        data.id || Date.now().toString(), data.clientName, data.mobile, data.email,
        data.eventType, data.date, "pending", data.notes || "", new Date().toISOString()
    ]);
    return responseJSON({ success: true });
}

function updateBooking(data) {
    const sheet = getSheet(TABS.BOOKINGS);
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.id)) {
            if (data.status) sheet.getRange(i + 1, 7).setValue(data.status);
            return responseJSON({ success: true });
        }
    }
    return responseJSON({ success: false });
}

function deleteBooking(id) {
    const sheet = getSheet(TABS.BOOKINGS);
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.id)) { sheet.deleteRow(i + 1); return responseJSON({ success: true }); }
    }
    return responseJSON({ success: false });
}

// --- MESSAGE LOGIC ---

function getMessagesData() {
    const sheet = getSheet(TABS.MESSAGES);
    const rows = sheet.getDataRange().getValues();
    rows.shift();
    const msgs = rows.map(r => ({
        timestamp: r[0], sender: r[1], mobile: String(r[2]), email: r[3], text: r[4], status: r[6]
    }));
    return responseJSON(msgs);
}

function addMessage(data) {
    const sheet = getSheet(TABS.MESSAGES);
    sheet.appendRow([new Date().toISOString(), data.sender, data.mobile, data.email, data.text, "[]", "received"]);
    return responseJSON({ success: true });
}

function updateMessage(data) {
    const sheet = getSheet(TABS.MESSAGES);
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][2]) === String(data.mobile)) {
            if (data.status) sheet.getRange(i + 1, 7).setValue(data.status);
            return responseJSON({ success: true });
        }
    }
    return responseJSON({ success: false });
}

// --- PROFILE LOGIC ---

function getProfileData(mobile) {
    const sheet = getSheet(TABS.CLIENTS);
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(mobile)) {
            return responseJSON({ found: true, name: rows[i][1], email: rows[i][2], loginCount: rows[i][5], lastLogin: rows[i][4] });
        }
    }
    return responseJSON({ found: false });
}

function updateProfile(data) {
    const sheet = getSheet(TABS.CLIENTS);
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.mobile)) {
            sheet.getRange(i + 1, 2).setValue(data.name);
            sheet.getRange(i + 1, 3).setValue(data.email);
            return responseJSON({ success: true });
        }
    }
    sheet.appendRow([data.mobile, data.name, data.email, new Date().toISOString(), new Date().toISOString(), 1]);
    return responseJSON({ success: true });
}

function logLogin(data) {
    const sheet = getSheet(TABS.CLIENTS);
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.mobile)) {
            sheet.getRange(i + 1, 5).setValue(new Date().toISOString());
            const currentCount = parseInt(rows[i][5] || 0);
            sheet.getRange(i + 1, 6).setValue(currentCount + 1);
            return responseJSON({ success: true });
        }
    }
    return updateProfile(data); // Create profile if logging login for new user
}

// --- GLOBAL HELPERS ---

function getSheet(name) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
        sheet = ss.insertSheet(name);
        // Initialize headers if creating for the first time
        if (name === TABS.CMS) sheet.appendRow(["ID", "Section", "Type", "Title", "URL"]);
        if (name === TABS.VAULTS) sheet.appendRow(["ID", "Vault ID", "Session Title", "Customer Name", "Customer Mobile", "Session Type", "Status", "Created At", "Workflow Status"]);
        if (name === TABS.BOOKINGS) sheet.appendRow(["ID", "Client Name", "Mobile", "Email", "Event Type", "Date", "Status", "Notes", "Created At"]);
        if (name === TABS.MESSAGES) sheet.appendRow(["Timestamp", "Sender", "Mobile", "Email", "Text", 'Replies', "Status"]);
        if (name === TABS.CLIENTS) sheet.appendRow(["Mobile", "Name", "Email", "Created At", "Last Login", "Login Count"]);
    }
    return sheet;
}

function getOrCreateFolder(name) {
    const folders = DriveApp.getFoldersByName(name);
    if (folders.hasNext()) return folders.next();
    return DriveApp.createFolder(name);
}

function responseJSON(data) {
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

// --- DEBUGGING UTILS ---
function testDoGet() {
    Logger.log(doGet({ parameter: { action: 'getcms' } }).getContent());
}
