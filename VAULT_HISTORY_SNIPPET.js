// ---------------------------------------------------------
// PASTE THIS INTO YOUR EXISTING doGet FUNCTION
// ---------------------------------------------------------
/*
function doGet(e) {
  // ... existing code ...
  const action = e.parameter.action;

  if (action === 'getVaults') {
     return getVaults();
  }
  // ... existing code ...
}
*/

// ---------------------------------------------------------
// PASTE THIS INTO YOUR EXISTING doPost FUNCTION
// ---------------------------------------------------------
/*
function doPost(e) {
  // ... existing code ...
  const data = JSON.parse(e.postData.contents);
  const action = data.action;

  if (action === 'addVault') {
    return addVault(data);
  } else if (action === 'updateVault') {
    return updateVault(data);
  } else if (action === 'deleteVault') {
    return deleteVault(data);
  }
  // ... existing code ...
}
*/

// ---------------------------------------------------------
// ADD THESE FUNCTIONS TO THE BOTTOM OF YOUR SCRIPT
// ---------------------------------------------------------

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
