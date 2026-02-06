# Photo Selection Finalization Feature

## Overview
This feature automatically creates a Google Drive delivery folder and copies selected photos when clients finalize their photo selections.

## How It Works

### Client Flow

1. **Login & Access Vault**
   - Client logs in with their mobile number
   - Accesses their photo vault

2. **Select Photos**
   - Client browses and selects photos they want
   - Can use the lightbox for better viewing
   - Selection count is shown in real-time

3. **Save Selection (Optional)**
   - Click "💾 SAVE SELECTION" to temporarily save choices
   - Can continue making changes
   - Vault remains unlocked

4. **Finalize Selection**
   - Click "✓ FINALIZE & SUBMIT" when done
   - Confirmation dialog explains what will happen:
     - Creates delivery folder: `{MOBILE}_selected_pics`
     - Copies selected photos to that folder
     - Locks the vault (no more changes)
   
5. **Confirmation**
   - Success message shows:
     - Delivery folder name
     - Number of photos copied
     - Any failures (if applicable)
   - Vault is now locked

### Admin Flow

1. **View Vaults Dashboard**
   - Navigate to "Vaults" tab in admin panel
   - See all client vaults

2. **Check Selection Status**
   - **PENDING SELECTION**: Client hasn't selected photos yet
   - **✓ SELECTION READY**: Client saved selections (not finalized)
   - **✓ FINALIZED**: Client finalized selection
     - Shows delivery folder link
     - Click to open folder in Google Drive

3. **Access Delivery Folder**
   - Click the folder link to view selected photos
   - Folder is in the same parent as the original vault
   - Contains copies of selected photos

4. **Unlock if Needed**
   - Admin can unlock vault using "UNLOCK" button
   - Client can then make new selections

## Technical Implementation

### Backend (Node.js + Express)

#### New Google Drive Service Methods

**`googleDrive.getParentFolderId(folderId)`**
- Gets the parent folder ID of a given folder
- Used to create delivery folder in same location

**`googleDrive.findFolderByName(folderName, parentId)`**
- Searches for a folder by name within a parent
- Prevents duplicate folder creation

**`googleDrive.createFolder(folderName, parentId)`**
- Creates a new folder in Google Drive
- Returns folder ID and name

**`googleDrive.copyFile(fileId, destinationFolderId)`**
- Copies a single file to destination folder
- Preserves original filename and quality

**`googleDrive.copyMultipleFiles(fileIds, destinationFolderId)`**
- Copies multiple files in batch
- Returns success/failure counts

#### New API Endpoint

**POST `/api/vaults/finalize`**

Request body:
```json
{
  "mobile": "9159515252",
  "vaultId": "1ABC...XYZ",
  "selections": ["fileId1", "fileId2", "fileId3"],
  "customerId": "9159515252"
}
```

Response:
```json
{
  "success": true,
  "message": "Selection finalized successfully",
  "deliveryFolder": {
    "id": "1DEF...ABC",
    "name": "9159515252_selected_pics",
    "url": "https://drive.google.com/drive/folders/1DEF...ABC"
  },
  "copyResults": {
    "total": 15,
    "copied": 15,
    "failed": 0,
    "failedFiles": []
  }
}
```

#### Process Flow

1. Validate input (mobile, vaultId, selections)
2. Get parent folder ID of vault
3. Check if delivery folder already exists
4. Create folder if it doesn't exist
5. Copy all selected photos to delivery folder
6. Update selection record with finalization data
7. Lock the vault
8. Return success response

### Frontend (JavaScript)

#### UI Changes

**Vault Photo View**
- Two buttons instead of one:
  - "💾 SAVE SELECTION" - Temporary save
  - "✓ FINALIZE & SUBMIT" - Final submission
- Info banner explaining the difference
- Updated status badge: "SELECTION FINALIZED" when locked

**Admin Vault View**
- Enhanced status display:
  - Shows finalization status
  - Displays delivery folder link
  - Visual distinction for finalized selections

#### New Functions

**`saveSelection()`**
- Saves selection temporarily
- Does NOT lock vault
- Client can continue editing

**`finalizeSelection()`**
- Shows confirmation dialog
- Calls `/api/vaults/finalize` endpoint
- Displays detailed success/error messages
- Locks vault and refreshes view

## Folder Naming Convention

Format: `{CUSTOMER_ID}_selected_pics`

Examples:
- `9159515252_selected_pics`
- `9876543210_selected_pics`

The customer ID is the mobile number by default.

## Error Handling

### Common Errors

1. **No photos selected**
   - Alert: "Please select at least one photo"

2. **Parent folder not found**
   - Error: "Could not determine parent folder for vault"

3. **Folder creation failed**
   - Error: "Failed to create delivery folder"
   - Details in response

4. **File copy failed**
   - Partial success possible
   - Shows: "15 of 20 photos copied, 5 failed"
   - Lists failed file IDs

5. **Network/API errors**
   - Error: "Failed to finalize selection"
   - Suggests contacting studio

### Recovery

- Admin can unlock vault if needed
- Client can re-finalize if unlock
- Existing delivery folder is reused (no duplicates)

## Google Drive Permissions

### Required Scopes

The service account needs:
- `https://www.googleapis.com/auth/drive` (full access)

Changed from `drive.readonly` to support:
- Folder creation
- File copying
- Permission management

### Service Account Setup

1. Service account must have access to:
   - Original vault folders
   - Parent folder (to create delivery folders)

2. Folders are created with same permissions as parent

## Database Schema

### selections.json

Updated structure:
```json
{
  "mobile": "9159515252",
  "vaultId": "1ABC...XYZ",
  "vaultName": "Wedding Session",
  "selections": ["fileId1", "fileId2"],
  "timestamp": "2026-01-24T05:40:00.000Z",
  "finalized": true,
  "deliveryFolderId": "1DEF...ABC",
  "deliveryFolderName": "9159515252_selected_pics",
  "copyResults": {
    "total": 15,
    "success": 15,
    "failed": 0
  }
}
```

### vaults.json

Updated structure:
```json
{
  "id": "1706000000000",
  "vaultId": "1ABC...XYZ",
  "customerMobile": "9159515252",
  "sessionTitle": "Wedding Session",
  "createdAt": "2026-01-20T10:00:00.000Z",
  "status": "locked",
  "finalizedAt": "2026-01-24T05:40:00.000Z"
}
```

## Testing Checklist

### Client Side
- [ ] Can select photos
- [ ] Can save selection temporarily
- [ ] Can continue editing after save
- [ ] Finalize shows confirmation dialog
- [ ] Finalize creates delivery folder
- [ ] Success message shows correct details
- [ ] Vault locks after finalization
- [ ] Cannot edit locked vault

### Admin Side
- [ ] Can see pending selections
- [ ] Can see finalized selections
- [ ] Delivery folder link works
- [ ] Can unlock vault
- [ ] Can view selected photos

### Backend
- [ ] Folder created in correct location
- [ ] Folder name follows convention
- [ ] All photos copied successfully
- [ ] No duplicate folders created
- [ ] Error handling works
- [ ] Database updated correctly

## Production Deployment

### Pre-deployment
1. Ensure service account has full Drive access
2. Update `.env` with correct credentials
3. Test with sample vault

### Deployment
1. Deploy backend changes
2. Deploy frontend changes
3. Restart backend server
4. Clear browser cache

### Post-deployment
1. Test with real client vault
2. Verify folder creation
3. Check photo copying
4. Confirm admin can access folders

## Troubleshooting

### "Could not determine parent folder"
- Check service account has access to vault
- Verify vault ID is correct

### "Failed to copy files"
- Check Drive API quota
- Verify file IDs are valid
- Check service account permissions

### "Folder already exists"
- This is normal - folder is reused
- Photos are still copied

### Admin can't see delivery folder
- Check folder permissions
- Verify service account shared folder
- Check folder ID in database

## Future Enhancements

Potential improvements:
1. Email notification on finalization
2. Download all selected photos as ZIP
3. Custom folder naming
4. Move instead of copy option
5. Batch finalization for multiple clients
6. Automatic folder sharing with client
7. Progress indicator for large selections
8. Thumbnail generation for delivery folder
