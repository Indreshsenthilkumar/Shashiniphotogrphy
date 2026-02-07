/**
 * SHASHINI STUDIO - CMS BACKEND (Standalone)
 * ------------------------------------------
 * Use this code if you want a dedicated Apps Script project JUST for the Studio CMS.
 *
 * instructions:
 * 1. Create a new Google Apps Script project.
 * 2. Paste this code.
 * 3. Deploy as Web App (Execute as: Me, Who has access: Anyone).
 */

const CMS_TAB_NAME = "studiocms";
const FOLDER_NAME = "Studio_Website_Media";

function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(30000); // 30 second lock for large uploads

    try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const sheet = ss.getSheetByName(CMS_TAB_NAME) || ss.insertSheet(CMS_TAB_NAME);

        // Ensure headers exist
        if (sheet.getLastRow() === 0) {
            sheet.appendRow(["ID", "Section", "Type", "Title", "URL"]);
        }

        const params = JSON.parse(e.postData.contents);
        const action = params.action;

        // 1. ADD MEDIA (Gallery, Hero, Graphics)
        if (action === "addMedia" || action === "saveGallery" || action === "saveHeroSlide" || action === "saveGraphic") {
            let finalUrl = params.url;
            const section = params.section || (action === 'saveHeroSlide' ? 'HeroSlide' : (action === 'saveGraphic' ? 'Graphic' : 'Gallery'));
            const type = params.type || 'image';
            const title = params.title || params.key || "";

            // Handle Base64 Uploads to Drive
            if (params.url && params.url.toString().startsWith("data:")) {
                const folder = getOrCreateFolder();
                const contentType = params.url.substring(5, params.url.indexOf(";"));
                const bytes = Utilities.base64Decode(params.url.split(",")[1]);
                const fileName = (title || "upload") + "_" + Date.now();

                const file = folder.createFile(Utilities.newBlob(bytes, contentType, fileName));
                file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
                finalUrl = "https://drive.google.com/uc?export=view&id=" + file.getId();
            }

            // Special handling for Graphics (Update existing row if key matches)
            if (section === "Graphic") {
                const data = sheet.getDataRange().getValues();
                for (let i = 1; i < data.length; i++) {
                    // Check if Section is Graphic and Title (Key) matches
                    if (data[i][1] === "Graphic" && data[i][3] === title) {
                        sheet.getRange(i + 1, 5).setValue(finalUrl);
                        return responseJSON({ success: true, url: finalUrl });
                    }
                }
            }

            sheet.appendRow([Date.now().toString(), section, type, title, finalUrl]);
            return responseJSON({ success: true, id: Date.now(), url: finalUrl });
        }

        // 2. DELETE MEDIA
        else if (action === "deleteMedia" || action === "deleteGallery" || action === "deleteHeroSlide") {
            const data = sheet.getDataRange().getValues();
            for (let i = 1; i < data.length; i++) {
                if (String(data[i][0]) === String(params.id)) {
                    sheet.deleteRow(i + 1);
                    return responseJSON({ success: true });
                }
            }
            return responseJSON({ success: false, error: "ID not found" });
        }

        // 3. SAVE CONFIG (Hero Interval)
        else if (action === "saveHeroConfig") {
            const data = sheet.getDataRange().getValues();
            let found = false;
            for (let i = 1; i < data.length; i++) {
                if (data[i][1] === "Config" && data[i][3] === "interval") {
                    sheet.getRange(i + 1, 5).setValue(params.interval);
                    found = true; break;
                }
            }
            if (!found) sheet.appendRow([Date.now().toString(), "Config", "number", "interval", params.interval]);
            return responseJSON({ success: true });
        }

    } catch (err) {
        return responseJSON({ success: false, error: err.toString() });
    } finally {
        lock.releaseLock();
    }
}

function doGet(e) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CMS_TAB_NAME);

    // Default structure if sheet is missing
    if (!sheet) return responseJSON({ items: [], hero: { slides: [], interval: 5 }, graphics: {} });

    const values = sheet.getDataRange().getValues();
    values.shift(); // Remove headers

    const response = { items: [], hero: { slides: [], interval: 5 }, graphics: {} };

    values.forEach(row => {
        const [id, section, type, title, url] = row;
        if (section === "Gallery") response.items.push({ id, type, title, url });
        else if (section === "HeroSlide") response.hero.slides.push({ id, type, title, url });
        else if (section === "Config" && title === "interval") response.hero.interval = parseInt(url) || 5;
        else if (section === "Graphic") response.graphics[title] = url; // Title is the Key for graphics
    });

    return responseJSON(response);
}

function getOrCreateFolder() {
    const folders = DriveApp.getFoldersByName(FOLDER_NAME);
    if (folders.hasNext()) return folders.next();
    return DriveApp.createFolder(FOLDER_NAME);
}

function responseJSON(obj) {
    return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
