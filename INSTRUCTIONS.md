# Shashini Studio Setup Instructions

To get your photography studio portal running with REAL data from Google Drive, follow these steps:

## 1. Google Drive Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Enable the **Google Drive API**.
4. Create a **Service Account** under "Credentials".
5. Generate a **JSON Key** for the Service Account and download it.
6. Rename the file to `service-account.json` and place it in the `backend/` directory of this project.

## 2. Shared Folder
1. Create a folder in your personal Google Drive to act as the "Master Storage".
2. Share this folder with the `client_email` found in your `service-account.json`.
3. Copy the Folder ID from the URL (the string after `folders/`).
4. Paste this ID into `backend/.env` as `MASTER_FOLDER_ID`.

## 3. Organizing Photos
1. Inside the Master folder, create sub-folders for each client session.
2. Include the client's mobile number in the folder name (e.g., "Wedding - Priya - 9159515252").
3. Upload images directly into these sub-folders.

## 4. Running the System
1. Open a terminal in the root directory.
2. Run `npm install` in both `backend/` and `frontend/` folders.
3. Start the backend: `cd backend && npm start`
4. Start the frontend: `cd frontend && npm run dev`

The system will now automatically:
- Let clients log in with their phone number.
- Show only the folders matching their number.
- Allow them to select photos.
- Allow you (Admin) to see their selections in the admin dashboard (`/admin.html`).
