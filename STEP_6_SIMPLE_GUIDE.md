# 🎯 STEP 6 EXPLAINED - Adding Environment Variables (Super Simple Version)

## What You're Doing

You're giving Render the **secret passwords and settings** your backend needs to work.

Think of it like this:
- Your backend needs to talk to Google Drive → It needs Google credentials
- Your backend needs to know which folders to use → It needs folder IDs
- Your backend needs to connect to Cal.com → It needs API keys

---

## 🚀 The Easy Way (Use the Helper Script)

### **Step 1: Run the Extraction Script**

Open PowerShell in your project folder and run:

```powershell
cd d:\photographybyag
node extract-env-vars.js
```

**What this does:**
- ✅ Reads your `credentials.json` file
- ✅ Reads your `.env` file
- ✅ Extracts all 7 variables you need
- ✅ Saves them to `render-env-vars.txt`
- ✅ Shows them in the terminal

### **Step 2: Open the Generated File**

1. Look in your project folder: `d:\photographybyag\`
2. Find the file: `render-env-vars.txt`
3. Open it with Notepad
4. **Keep this file open** - you'll copy from it

---

## 📝 Adding Variables to Render (The Actual Step 6)

Now you're on the Render website, creating your web service.

### **What You See on Render:**

After filling in Name, Root Directory, etc., you'll see:

```
┌─────────────────────────────────────────┐
│  Advanced                        [▼]    │  ← Click this to expand
└─────────────────────────────────────────┘
```

Click **"Advanced"** and you'll see:

```
┌─────────────────────────────────────────────────────────┐
│  Environment Variables                                   │
│                                                          │
│  [+ Add Environment Variable]  ← Click this button      │
└─────────────────────────────────────────────────────────┘
```

---

## 🔢 Adding Each Variable (Repeat 7 Times)

### **The Pattern:**

For EACH of the 7 variables, do this:

1. Click **"+ Add Environment Variable"**
2. You'll see two boxes:
   ```
   Key:   [____________]
   Value: [____________]
   ```
3. Look at your `render-env-vars.txt` file
4. Copy the **KEY** → Paste into the Key box
5. Copy the **VALUE** → Paste into the Value box
6. The variable appears in the list ✅

---

## 📋 The 7 Variables (In Order)

### **Variable 1: PORT**
```
Key:   PORT
Value: 10000
```
**Just type these** - no need to copy from file.

---

### **Variable 2: MASTER_FOLDER_ID**
```
Key:   MASTER_FOLDER_ID
Value: [Your Google Drive folder ID]
```

**How to get your folder ID:**
1. Open Google Drive in browser
2. Go to your main photos folder
3. Look at the URL: `https://drive.google.com/drive/folders/1ABC123XYZ`
4. Copy the part after `/folders/`: `1ABC123XYZ`
5. Paste that as the Value

**⚠️ Important:** Replace `your_master_folder_id_here` with your actual ID!

---

### **Variable 3: DELIVERY_FOLDER_ID**
```
Key:   DELIVERY_FOLDER_ID
Value: 1SvnOWqKVPGMlZBKhriYLsI3fHDUcCv9z
```
**Copy from `render-env-vars.txt`** (or use the value shown above).

---

### **Variable 4: CALCOM_API_KEY**
```
Key:   CALCOM_API_KEY
Value: cal_live_82cc72c8ac1ec02b20a64b5412c51852
```
**Copy from `render-env-vars.txt`**.

---

### **Variable 5: CALCOM_WEBHOOK_SECRET**
```
Key:   CALCOM_WEBHOOK_SECRET
Value: calcom_secret_placeholder
```
**Copy from `render-env-vars.txt`**.

---

### **Variable 6: GOOGLE_CLIENT_EMAIL**
```
Key:   GOOGLE_CLIENT_EMAIL
Value: drive-backend@studio-drive-api.iam.gserviceaccount.com
```

**From your terminal output**, you saw:
```
GOOGLE_CLIENT_EMAIL: drive-backend@studio-drive-api.iam.gserviceaccount.com
```

**Copy that email** and paste it as the Value.

**⚠️ Common Mistakes:**
- ❌ Don't include quotes
- ❌ Don't add spaces
- ✅ Just the email address

---

### **Variable 7: GOOGLE_PRIVATE_KEY** ⚠️ MOST IMPORTANT

```
Key:   GOOGLE_PRIVATE_KEY
Value: [The entire private key from render-env-vars.txt]
```

**How to do this:**

1. Open `render-env-vars.txt`
2. Find the section that says "GOOGLE_PRIVATE_KEY"
3. You'll see something like:
   ```
   -----BEGIN PRIVATE KEY-----
   MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7xKq1...
   (many more lines)
   ...vQxKzJ8kF2wE=
   -----END PRIVATE KEY-----
   ```

4. **Select and copy EVERYTHING** from `-----BEGIN` to `-----END`
5. Paste it into the Value box on Render

**⚠️ CRITICAL:**
- ✅ Include `-----BEGIN PRIVATE KEY-----`
- ✅ Include all the middle content
- ✅ Include `-----END PRIVATE KEY-----`
- ✅ Keep the `\n` characters (they're line breaks)
- ❌ Don't remove anything
- ❌ Don't add quotes

---

## ✅ After Adding All 7 Variables

You should see a list like this on Render:

```
┌─────────────────────────────────────────────────────────┐
│  Environment Variables                                   │
├─────────────────────────────────────────────────────────┤
│  PORT                        10000                       │
│  MASTER_FOLDER_ID            1ABC123XYZ                 │
│  DELIVERY_FOLDER_ID          1SvnOWqKVPGMl...           │
│  CALCOM_API_KEY              cal_live_82cc...           │
│  CALCOM_WEBHOOK_SECRET       calcom_secret...           │
│  GOOGLE_CLIENT_EMAIL         drive-backend@...          │
│  GOOGLE_PRIVATE_KEY          -----BEGIN PRIVATE...      │
└─────────────────────────────────────────────────────────┘
```

**Checklist:**
- [ ] 7 variables total
- [ ] All KEYs are spelled correctly (case-sensitive!)
- [ ] GOOGLE_PRIVATE_KEY shows `-----BEGIN PRIVATE...`
- [ ] GOOGLE_CLIENT_EMAIL ends with `.iam.gserviceaccount.com`

---

## 🎯 Final Step

1. **Scroll to the bottom** of the Render page
2. Click the big **"Create Web Service"** button
3. Wait 3-5 minutes while Render:
   - Downloads your code
   - Installs dependencies
   - Starts your server
   - Deploys it

**You'll see:**
```
Building...  ⏳
Installing dependencies...
Starting server...
Live ✅
```

---

## 🧪 Testing

After deployment:

1. **Copy your backend URL** from Render (top of the page)
   - Example: `https://shashini-backend-abc123.onrender.com`

2. **Open it in a browser**

3. **You should see:**
   ```json
   {"status":"Photography Studio API is secure and running."}
   ```

**If you see this** = ✅ SUCCESS! Your backend is deployed!

**If you see an error** = ❌ Check the Logs tab in Render

---

## 🐛 Quick Troubleshooting

### **"Application failed to respond"**
→ Click "Logs" tab, look for error messages
→ Usually means a variable is wrong

### **"Google Drive authentication failed"**
→ Check GOOGLE_PRIVATE_KEY includes BEGIN/END
→ Check GOOGLE_CLIENT_EMAIL is correct

### **"Module not found"**
→ Check Root Directory is set to `backend`

---

## 📚 More Help

- **Detailed guide**: `RENDER_ENVIRONMENT_VARIABLES_GUIDE.md`
- **Full deployment**: `BACKEND_DEPLOYMENT_GUIDE.md`
- **Overall fix**: `DEPLOYMENT_FIX_CHECKLIST.md`

---

## 🎉 Summary

**What you did:**
1. ✅ Ran `extract-env-vars.js` to get all variables
2. ✅ Added 7 environment variables to Render
3. ✅ Clicked "Create Web Service"
4. ✅ Waited for deployment
5. ✅ Tested the backend URL

**What's next:**
1. Update your frontend with the backend URL
2. Push to GitHub
3. Netlify auto-deploys
4. Everything works! 🎊

---

**You're almost done! Just need to update the frontend URLs next.** 🚀
