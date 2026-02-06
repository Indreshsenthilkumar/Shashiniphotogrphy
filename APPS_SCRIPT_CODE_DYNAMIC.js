function doGet(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        var action = e.parameter.action;

        // --- VAULTS LOGIC (Matches your requested format) ---
        if (action === 'getVaults') {
            var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('vaults');
            if (!sheet) return responseJSON([]);

            var rows = sheet.getDataRange().getValues();
            var headers = rows[0];
            var data = rows.slice(1);

            var colMap = {};
            headers.forEach(function (h, i) { colMap[h.toString().trim()] = i; });

            var vaults = data.map(function (row) {
                return {
                    id: row[colMap['ID']],
                    customerName: row[colMap['Customer Name']],
                    customerMobile: row[colMap['Customer Mobile']],
                    sessionTitle: row[colMap['Session Title']],
                    sessionType: row[colMap['Session Type']],
                    createdAt: row[colMap['Created At']],
                    status: row[colMap['Status']],
                    workflowStatus: row[colMap['Workflow Status']],
                    vaultId: row[colMap['Vault ID']] // Maps to Drive ID
                };
            }).filter(function (v) { return v.id && v.id !== ""; }); // Filter empty

            return responseJSON(vaults); // Return Array directly to match Frontend expectation
        }

        // --- CLIENT PROFILE LOGIC ---
        if (action === 'getProfile') {
            return getClientProfile(e.parameter.mobile);
        }

        // --- MESSAGES LOGIC ---
        return getMessages();

    } catch (e) {
        return ContentService.createTextOutput(JSON.stringify({ 'error': e.toString() })).setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        var data = JSON.parse(e.postData.contents);
        var action = data.action;

        // --- VAULT ACTIONS ---
        if (action === 'addVault' || action === 'updateVault') {
            var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('vaults');
            if (!sheet) {
                // Auto-create 'vaults' sheet if missing
                sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('vaults');
                sheet.appendRow(['ID', 'Vault ID', 'Drive Link', 'Session Title', 'Customer Name', 'Customer Mobile', 'Session Type', 'Status', 'Created At', 'Workflow Status']);
            }

            var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
            var colMap = {};
            headers.forEach(function (h, i) { colMap[h.toString().trim()] = i; });

            var rows = sheet.getDataRange().getValues();
            var rowIndex = -1;

            // Find by ID
            for (var i = 1; i < rows.length; i++) {
                if (String(rows[i][colMap['ID']]) === String(data.id)) {
                    rowIndex = i + 1;
                    break;
                }
            }

            if (rowIndex === -1) {
                if (action === 'updateVault') return responseJSON({ 'result': 'error', 'message': 'ID not found for update' });

                // Add New
                var newRow = [];
                headers.forEach(function (h) { newRow.push(""); });

                newRow[colMap['ID']] = data.id;
                newRow[colMap['Vault ID']] = data.vaultId;
                newRow[colMap['Drive Link']] = 'https://drive.google.com/drive/folders/' + data.vaultId; // Auto-generate
                newRow[colMap['Session Title']] = data.sessionTitle;
                newRow[colMap['Customer Name']] = data.customerName;
                newRow[colMap['Customer Mobile']] = data.customerMobile;
                newRow[colMap['Session Type']] = data.sessionType;
                newRow[colMap['Status']] = data.status || 'active';
                newRow[colMap['Created At']] = new Date().toISOString();
                newRow[colMap['Workflow Status']] = data.workflowStatus || 'pending';

                sheet.appendRow(newRow);
                return responseJSON({ 'result': 'success', 'id': data.id });

            } else {
                // Update Existing
                var range = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn());
                var rowValues = range.getValues()[0];

                if (data.vaultId) {
                    rowValues[colMap['Vault ID']] = data.vaultId;
                    rowValues[colMap['Drive Link']] = 'https://drive.google.com/drive/folders/' + data.vaultId;
                }
                if (data.sessionTitle) rowValues[colMap['Session Title']] = data.sessionTitle;
                if (data.customerName) rowValues[colMap['Customer Name']] = data.customerName;
                if (data.customerMobile) rowValues[colMap['Customer Mobile']] = data.customerMobile;
                if (data.sessionType) rowValues[colMap['Session Type']] = data.sessionType;
                if (data.status) rowValues[colMap['Status']] = data.status;
                if (data.workflowStatus) rowValues[colMap['Workflow Status']] = data.workflowStatus;

                range.setValues([rowValues]);
                return responseJSON({ 'result': 'success', 'updated': true });
            }
        }

        // --- VAULT DELETE ---
        if (action === 'deleteVault') {
            var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('vaults');
            if (!sheet) return responseJSON({ 'result': 'error', 'message': 'Sheet not found' });
            var rows = sheet.getDataRange().getValues();
            var colMap = {};
            sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].forEach(function (h, i) { colMap[h.toString().trim()] = i; });

            for (var i = 1; i < rows.length; i++) {
                if (String(rows[i][colMap['ID']]) === String(data.id)) {
                    sheet.deleteRow(i + 1);
                    return responseJSON({ 'result': 'success', 'deleted': true });
                }
            }
            return responseJSON({ 'result': 'error', 'message': 'ID not found' });
        }

        if (action === 'updateProfile') return updateClientProfile(data);
        if (action === 'logLogin') return logClientLogin(data);

        return addMessage(data); // Default

    } catch (e) {
        return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': e.toString() })).setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

// --- HELPER ---
function responseJSON(data) {
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

// --- BOOKING FUNCTIONS (Keep existing) ---
function getBookings() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('booking');
    if (!sheet) return responseJSON([]);
    const rows = sheet.getDataRange().getValues();
    const headers = rows.shift();
    if (rows.length === 0) return responseJSON([]);
    const bookings = rows.map(row => ({
        id: row[0], clientName: row[1], mobile: row[2], email: row[3], eventType: row[4], date: row[5], status: row[6], notes: row[7], createdAt: row[8]
    }));
    return responseJSON(bookings);
}
function addBooking(data) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('booking');
    if (!sheet) throw new Error("Sheet 'booking' not found");
    const newRow = [data.id || new Date().getTime().toString(), data.clientName, data.mobile, data.email, data.eventType, data.date, data.status || 'pending', data.notes, new Date().toISOString()];
    sheet.appendRow(newRow);
    return responseJSON({ 'result': 'success', 'id': newRow[0] });
}
function updateBooking(data) {
    // ... (Your existing updateBooking logic) ...
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('booking');
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.id)) {
            if (data.status) sheet.getRange(i + 1, 7).setValue(data.status);
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

// --- MESSAGE FUNCTIONS ---
function getMessages() {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('message'); // Try "message"
    if (!sheet) sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Message'); // Try "Message"

    if (!sheet) return responseJSON([]);
    const rows = sheet.getDataRange().getValues();
    const headers = rows.shift();

    // Robust Column Mapping
    var colMap = {};
    headers.forEach(function (h, i) { colMap[h.toString().trim()] = i; });

    const messages = rows.map(row => {
        // Helper to get value
        const getVal = (names) => {
            if (!Array.isArray(names)) names = [names];
            for (var name of names) {
                if (colMap[name] !== undefined) return row[colMap[name]];
            }
            return "";
        };

        // Parse replies safely
        let replies = [];
        try {
            const rawReplies = getVal(['Replies', 'replies']);
            if (rawReplies) replies = JSON.parse(rawReplies);
        } catch (e) { }

        return {
            timestamp: getVal(['Timestamp', 'timestamp']) || row[0],
            sender: getVal(['Name', 'Sender', 'Client Name']) || row[1],
            mobile: getVal(['Mobile', 'Phone', 'Cell']) || row[2],
            email: getVal(['Email', 'E-mail']) || row[3],
            text: getVal(['Message', 'Text', 'Inquiry']) || row[4],
            replies: replies,
            status: getVal(['Status', 'status']) || row[6] || 'received'
        };
    });
    return responseJSON(messages);
}
function addMessage(data) {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('message');
    if (!sheet) sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Message');

    const status = data.status || 'received';
    sheet.appendRow([
        data.timestamp || new Date().toISOString(),
        data.sender,
        data.mobile,
        data.email,
        data.text,
        '[]',
        status
    ]);

    const lastRow = sheet.getLastRow();
    const cell = sheet.getRange(lastRow, 7);

    // Add Dropdown
    const rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(['received', 'in progress', 'cleared'], true)
        .setAllowInvalid(true)
        .build();
    cell.setDataValidation(rule);

    // Add Color
    if (status === 'cleared') cell.setBackground('#d9f7be'); // Green
    else if (status === 'in progress') cell.setBackground('#ffe7ba'); // Orange
    else if (status === 'received') cell.setBackground('#ffccc7'); // Red
    else cell.setBackground('white');

    SpreadsheetApp.flush();
    return responseJSON({ 'result': 'success' });
}

function updateMessage(data) {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('message');
    if (!sheet) sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Message');

    if (!sheet) return responseJSON({ 'result': 'error', 'message': 'Sheet "message" or "Message" not found' });

    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];

    // Ensure Status header exists at Col 7
    if (headers.length < 7 || String(headers[6]).toLowerCase() !== 'status') {
        sheet.getRange(1, 7).setValue('Status');
    }

    // Aggressive cleaning function to match formats
    const clean = function (str) {
        return String(str || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
    };

    const targetMobile = clean(data.mobile);
    const targetText = clean(data.text);
    const status = data.status;

    console.log("Searching for: " + targetMobile + " / " + targetText);

    let targetRowIndex = -1;
    let fallbackRowIndex = -1; // Match by mobile only as backup

    for (let i = 1; i < rows.length; i++) {
        const rowMobile = clean(rows[i][2]); // Col 3 is Mobile
        const rowText = clean(rows[i][4]);   // Col 5 is Text

        if (rowMobile === targetMobile && rowText === targetText) {
            targetRowIndex = i + 1;
            break; // Found exact match
        }
        if (rowMobile === targetMobile && fallbackRowIndex === -1) {
            fallbackRowIndex = i + 1; // Use first mobile match if exact fails
        }
    }

    const rowToUpdate = targetRowIndex !== -1 ? targetRowIndex : fallbackRowIndex;

    if (rowToUpdate !== -1) {
        // MATCH FOUND
        console.log("Match found at row: " + rowToUpdate);

        if (status) {
            const cell = sheet.getRange(rowToUpdate, 7);
            cell.setValue(status);

            // Add Dropdown (Data Validation)
            const rule = SpreadsheetApp.newDataValidation()
                .requireValueInList(['received', 'in progress', 'cleared'], true)
                .setAllowInvalid(true)
                .build();
            cell.setDataValidation(rule);

            // Add Visual Colors
            if (status === 'cleared') cell.setBackground('#d9f7be'); // Green
            else if (status === 'in progress') cell.setBackground('#ffe7ba'); // Orange
            else if (status === 'received') cell.setBackground('#ffccc7'); // Red
            else cell.setBackground('white');
        }

        if (data.replies) {
            sheet.getRange(rowToUpdate, 6).setValue(JSON.stringify(data.replies));
        }

        SpreadsheetApp.flush();
        return responseJSON({ 'result': 'success', 'updated': true, 'row': rowToUpdate, 'matchType': targetRowIndex !== -1 ? 'exact' : 'fallback' });
    }

    return responseJSON({ 'result': 'error', 'message': 'No match for ' + data.mobile });
}

// --- CLIENT PROFILE FUNCTIONS ---

function getClientProfile(mobile) {
    if (!mobile) return responseJSON({ 'error': 'Mobile required' });
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('clientlogin') || ss.insertSheet('clientlogin');

    // Ensure Headers
    if (sheet.getLastColumn() === 0) {
        sheet.appendRow(['Mobile', 'Name', 'Email', 'Created At', 'Last Login', 'Login Count']);
    }

    var rows = sheet.getDataRange().getValues();
    var headers = rows[0];
    var colMap = {};
    headers.forEach(function (h, i) { colMap[h.toString().trim()] = i; });

    var userRow = null;
    for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][colMap['Mobile']]) === String(mobile)) {
            userRow = rows[i];
            break;
        }
    }

    // Vault count for collection summary
    var vaultSheet = ss.getSheetByName('vaults');
    var vaultCount = 0;
    if (vaultSheet) {
        var vRows = vaultSheet.getDataRange().getValues();
        var vHeaders = vRows[0];
        var mobileIdx = vHeaders.indexOf('Customer Mobile');
        if (mobileIdx !== -1) {
            vaultCount = vRows.slice(1).filter(function (r) { return String(r[mobileIdx]) === String(mobile); }).length;
        }
    }

    if (!userRow) {
        return responseJSON({
            'found': false,
            'mobile': mobile,
            'collectionSummary': vaultCount + ' Sessions'
        });
    }

    return responseJSON({
        'found': true,
        'name': userRow[colMap['Name']],
        'email': userRow[colMap['Email']],
        'mobile': userRow[colMap['Mobile']],
        'createdAt': userRow[colMap['Created At']],
        'lastLogin': userRow[colMap['Last Login']],
        'loginCount': userRow[colMap['Login Count']],
        'collectionSummary': vaultCount + ' Sessions'
    });
}

function updateClientProfile(data) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('clientlogin') || ss.insertSheet('clientlogin');
    var rows = sheet.getDataRange().getValues();
    var headers = rows[0];
    var colMap = {};
    headers.forEach(function (h, i) { colMap[h.toString().trim()] = i; });

    var rowIndex = -1;
    for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][colMap['Mobile']]) === String(data.mobile)) {
            rowIndex = i + 1;
            break;
        }
    }

    if (rowIndex === -1) {
        // Create new
        var newRow = [
            data.mobile,
            data.name || '',
            data.email || '',
            new Date().toISOString(),
            new Date().toISOString(),
            1
        ];
        sheet.appendRow(newRow);
    } else {
        // Update
        if (data.name) sheet.getRange(rowIndex, colMap['Name'] + 1).setValue(data.name);
        if (data.email) sheet.getRange(rowIndex, colMap['Email'] + 1).setValue(data.email);
    }

    return responseJSON({ 'result': 'success' });
}

function logClientLogin(data) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('clientlogin') || ss.insertSheet('clientlogin');
    var rows = sheet.getDataRange().getValues();
    var headers = rows[0];
    var colMap = {};
    headers.forEach(function (h, i) { colMap[h.toString().trim()] = i; });

    for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][colMap['Mobile']]) === String(data.mobile)) {
            var rowIndex = i + 1;
            sheet.getRange(rowIndex, colMap['Last Login'] + 1).setValue(new Date().toISOString());
            var count = parseInt(rows[i][colMap['Login Count']] || 0) + 1;
            sheet.getRange(rowIndex, colMap['Login Count'] + 1).setValue(count);
            return responseJSON({ 'result': 'success', 'loginCount': count });
        }
    }

    // If not found, create new entry via update log
    return updateClientProfile(data);
}
