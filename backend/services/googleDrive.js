const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

class GoogleDriveService {
    constructor() {
        this.drive = null;
        this.authenticate();
    }

    authenticate() {
        try {
            const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

            let auth;
            if (credentialsPath && fs.existsSync(credentialsPath)) {
                const creds = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
                // Normalize and CLEAN private key
                if (creds.private_key) {
                    creds.private_key = creds.private_key
                        .replace(/\\n/g, '\n') // Solve escaped newlines
                        .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII (hidden characters)
                        .trim();
                }
                auth = new google.auth.GoogleAuth({
                    credentials: creds,
                    scopes: ['https://www.googleapis.com/auth/drive'],
                });
            } else if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
                // Robust initialization of private key
                let privateKey = process.env.GOOGLE_PRIVATE_KEY;

                // Remove surrounding quotes if they exist
                if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
                    privateKey = privateKey.substring(1, privateKey.length - 1);
                }
                if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
                    privateKey = privateKey.substring(1, privateKey.length - 1);
                }

                // Replace literal \n with actual newlines
                privateKey = privateKey.replace(/\\n/g, '\n');

                auth = new google.auth.GoogleAuth({
                    credentials: {
                        client_email: process.env.GOOGLE_CLIENT_EMAIL,
                        private_key: privateKey,
                    },
                    scopes: ['https://www.googleapis.com/auth/drive'],
                });
            } else {
                console.warn('Google Drive credentials not found. API calls will fail.');
                return;
            }

            this.drive = google.drive({ version: 'v3', auth });
            console.log('[GoogleDrive] Service initialized & authenticated successfully.');
        } catch (error) {
            console.error('Failed to authenticate with Google Drive:', error);
        }
    }

    /**
     * List all images in a folder and ensure they are accessible.
     */
    async listFiles(folderId) {
        if (!this.drive) throw new Error('Google Drive service not initialized');

        console.log(`[GoogleDrive] Listing files for folder: ${folderId}`);

        try {
            const response = await this.drive.files.list({
                q: `'${folderId}' in parents and trashed = false`,
                fields: 'files(id, name, mimeType, thumbnailLink, webViewLink, webContentLink)',
                pageSize: 1000
            });

            const allFiles = response.data.files || [];
            console.log(`[GoogleDrive] Raw API check: Found ${allFiles.length} total files in folder.`);

            const imageFiles = allFiles.filter(f => f.mimeType.includes('image/'));
            console.log(`[GoogleDrive] Filtered images: ${imageFiles.length} images.`);

            return imageFiles.map(file => {
                // Direct link via lh3.googleusercontent.com/d/ID is generally more stable than thumbnailLinks
                // if the file is shared as "Anyone with link can view".
                // We also keep the thumbnail for smaller previews if needed.
                const directUrl = `https://lh3.googleusercontent.com/d/${file.id}`;
                const highResThumbnail = file.thumbnailLink ? file.thumbnailLink.replace(/=s\d+/, '=s1000') : directUrl;

                return {
                    id: file.id,
                    name: file.name,
                    url: directUrl, // Primary URL
                    thumbnail: highResThumbnail,
                    originUrl: file.webViewLink,
                    downloadUrl: file.webContentLink
                };
            });
        } catch (error) {
            console.error('[GoogleDrive] Error listing files:', error.message);
            throw error;
        }
    }

    /**
     * Optional: Helper to make a folder/file public if needed
     */
    async makePublic(fileId) {
        if (!this.drive) return;
        try {
            await this.drive.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });
            console.log(`[GoogleDrive] Permission set: anyone can read ${fileId}`);
        } catch (error) {
            console.error(`Error making file ${fileId} public:`, error.message);
        }
    }

    /**
     * Recursive/Bulk version to ensure all images in a folder are public.
     */
    async makeFolderAndFilesPublic(folderId) {
        if (!this.drive) return;
        try {
            // 1. Make folder public
            await this.makePublic(folderId);

            // 2. List all files and make them public
            const response = await this.drive.files.list({
                q: `'${folderId}' in parents and trashed = false`,
                fields: 'files(id, name)',
                pageSize: 1000
            });

            const files = response.data.files || [];
            console.log(`[GoogleDrive] Making ${files.length} files in folder ${folderId} public...`);

            for (const file of files) {
                await this.makePublic(file.id);
            }
        } catch (error) {
            console.error(`Error in bulk public permissions for ${folderId}:`, error.message);
        }
    }

    /**
     * Find a folder by name within a parent folder
     * @param {string} folderName - Name of the folder to find
     * @param {string} parentId - Parent folder ID to search in
     * @returns {Object|null} - Folder object or null if not found
     */
    async findFolderByName(folderName, parentId) {
        if (!this.drive) throw new Error('Google Drive service not initialized');

        try {
            const query = `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;

            const response = await this.drive.files.list({
                q: query,
                fields: 'files(id, name)',
                pageSize: 1
            });

            const folders = response.data.files || [];
            return folders.length > 0 ? folders[0] : null;
        } catch (error) {
            console.error('[GoogleDrive] Error finding folder:', error.message);
            throw error;
        }
    }

    /**
     * Get parent folder ID of a given folder
     * @param {string} folderId - Folder ID to get parent of
     * @returns {string|null} - Parent folder ID or null
     */
    async getParentFolderId(folderId) {
        if (!this.drive) throw new Error('Google Drive service not initialized');

        try {
            const response = await this.drive.files.get({
                fileId: folderId,
                fields: 'parents'
            });

            const parents = response.data.parents || [];
            return parents.length > 0 ? parents[0] : null;
        } catch (error) {
            console.error('[GoogleDrive] Error getting parent folder:', error.message);
            throw error;
        }
    }

    /**
     * Create a new folder in Google Drive
     * @param {string} folderName - Name of the folder to create
     * @param {string} parentId - Parent folder ID
     * @returns {Object} - Created folder object with id and name
     */
    async createFolder(folderName, parentId) {
        if (!this.drive) throw new Error('Google Drive service not initialized');

        console.log(`[GoogleDrive] Creating folder "${folderName}" in parent: ${parentId}`);

        try {
            const fileMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentId]
            };

            const response = await this.drive.files.create({
                requestBody: fileMetadata,
                fields: 'id, name'
            });

            console.log(`[GoogleDrive] Folder created successfully: ${response.data.id}`);
            return response.data;
        } catch (error) {
            console.error('[GoogleDrive] Error creating folder:', error.message);
            throw error;
        }
    }

    /**
     * Create a shortcut to a file in a destination folder
     * @param {string} fileId - Target file ID
     * @param {string} destinationFolderId - Folder where shortcut will be created
     * @returns {Object} - Created shortcut object
     */
    async createShortcut(fileId, destinationFolderId) {
        if (!this.drive) throw new Error('Google Drive service not initialized');

        try {
            // First get the original file metadata for the name
            const originalFile = await this.drive.files.get({
                fileId: fileId,
                fields: 'name'
            });

            const shortcutMetadata = {
                name: originalFile.data.name,
                mimeType: 'application/vnd.google-apps.shortcut',
                shortcutDetails: {
                    targetId: fileId
                },
                parents: [destinationFolderId]
            };

            const response = await this.drive.files.create({
                requestBody: shortcutMetadata,
                fields: 'id, name'
            });

            console.log(`[GoogleDrive] Shortcut created: ${response.data.name} (${response.data.id})`);
            return response.data;
        } catch (error) {
            console.error(`[GoogleDrive] Error creating shortcut for file ${fileId}:`, error.message);
            throw error;
        }
    }

    /**
     * Copy a file to a destination folder (Now uses Shortcuts due to Service Account quota limits)
     * @param {string} fileId - Source file ID to copy
     * @param {string} destinationFolderId - Destination folder ID
     * @returns {Object} - Shortcut object (behaves like the copied file)
     */
    async copyFile(fileId, destinationFolderId) {
        // We use shortcuts because Service Accounts have 0 storage quota and cannot own actual file copies.
        return this.createShortcut(fileId, destinationFolderId);
    }

    /**
     * Adds multiple files to a folder using shortcuts
     * @param {Array<string>} fileIds - Array of file IDs
     * @param {string} destinationFolderId - Destination folder ID
     * @returns {Object} - Results with success and failure counts
     */
    async copyMultipleFiles(fileIds, destinationFolderId) {
        if (!this.drive) throw new Error('Google Drive service not initialized');

        console.log(`[GoogleDrive] Adding ${fileIds.length} file shortcuts to folder: ${destinationFolderId}`);

        const results = {
            success: [],
            failed: [],
            total: fileIds.length
        };

        for (const fileId of fileIds) {
            try {
                console.log(`[GoogleDrive] Attempting to create shortcut for: ${fileId}`);
                const shortcut = await this.createShortcut(fileId, destinationFolderId);
                results.success.push({
                    originalId: fileId,
                    copiedId: shortcut.id, // Using 'copiedId' to maintain compatibility with existing code
                    name: shortcut.name
                });
            } catch (error) {
                console.error(`[GoogleDrive] Failed to add file ${fileId}: ${error.message}`);
                results.failed.push({
                    fileId,
                    error: error.message
                });
            }
        }

        console.log(`[GoogleDrive] Process complete: ${results.success.length} succeeded, ${results.failed.length} failed`);
        return results;
    }

    /**
     * Get a file stream for proxying
     * @param {string} fileId - ID of the file to stream
     * @returns {Stream} - Image data stream
     */
    async getFileStream(fileId) {
        if (!this.drive) throw new Error('Google Drive service not initialized');

        try {
            const response = await this.drive.files.get({
                fileId: fileId,
                alt: 'media'
            }, { responseType: 'stream' });

            return response.data;
        } catch (error) {
            console.error(`[GoogleDrive] Error getting file stream for ${fileId}:`, error.message);
            throw error;
        }
    }

    /**
     * Delete a file from Google Drive
     * @param {string} fileId - ID of the file to delete
     */
    async deleteFile(fileId) {
        if (!this.drive) throw new Error('Google Drive service not initialized');

        try {
            await this.drive.files.delete({
                fileId: fileId
            });
            console.log(`[GoogleDrive] File deleted: ${fileId}`);
        } catch (error) {
            console.error(`[GoogleDrive] Error deleting file ${fileId}:`, error.message);
            throw error;
        }
    }
}

module.exports = new GoogleDriveService();
