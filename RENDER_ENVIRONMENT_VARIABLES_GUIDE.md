# 🔐 Step 6: Adding Environment Variables on Render (Detailed Guide)

## What Are Environment Variables?

Environment variables are **secret configuration settings** that your backend needs to work properly. They include:
- Google Drive credentials (to access your photos)
- API keys (for Cal.com integration)
- Folder IDs (where your photos are stored)

**Important**: Never put these directly in your code because they're secrets!

---

## 📋 Before You Start

### ✅ Prerequisites

You need to have these ready:

1. **Your Google Drive credentials** from `backend/credentials.json`
2. **Your folder IDs** from `backend/.env`
3. **Your Cal.com API key** from `backend/.env`

---

## 🎯 Micro-Step Instructions

### **Step 6.1: Open the Environment Variables Section**

After configuring your service on Render (Name, Root Directory, etc.):

1. **Scroll down** on the "New Web Service" page
2. Look for a section that says **"Environment"** or **"Advanced"**
3. Click the **"Advanced"** button to expand it
4. You'll see a section titled **"Environment Variables"**

**What you'll see:**
```
┌─────────────────────────────────────────────┐
│  Advanced                                    │
│  ▼ Environment Variables                     │
│                                              │
│  [+ Add Environment Variable]                │
└─────────────────────────────────────────────┘
```

---

### **Step 6.2: Prepare Your Credentials**

Before adding variables, let's extract the Google credentials:

#### **6.2.1: Open credentials.json**

1. Open File Explorer
2. Navigate to: `d:\photographybyag\backend\`
3. Find the file: `credentials.json`
4. Right-click → Open with → Notepad (or VS Code)

#### **6.2.2: Find client_email**

In the JSON file, look for a line like this:
```json
"client_email": "your-service-account@project-id.iam.gserviceaccount.com",
```

1. **Copy ONLY the email address** (the part between the quotes)
2. Example: `shashini-studio@my-project-123456.iam.gserviceaccount.com`
3. **Paste it into Notepad temporarily** (we'll use it in Step 6.3)

#### **6.2.3: Find private_key**

In the same JSON file, look for:
```json
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n",
```

1. **Copy the ENTIRE value** including:
   - The opening quote `"`
   - `-----BEGIN PRIVATE KEY-----`
   - All the random letters/numbers
   - `-----END PRIVATE KEY-----`
   - The closing quote `"`
   
2. **Important**: Copy everything between the quotes, including `\n` characters
3. **Paste it into Notepad temporarily**

**Example of what you should copy:**
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7xKq1...
(many more lines)
...vQxKzJ8kF2wE=
-----END PRIVATE KEY-----
```

---

### **Step 6.3: Add Each Environment Variable**

Now we'll add variables one by one. For EACH variable:

#### **The Process (Repeat for each variable below)**

1. Click **"+ Add Environment Variable"** button
2. You'll see two fields:
   ```
   Key:   [____________]
   Value: [____________]
   ```
3. Type the **Key** (exact name, case-sensitive)
4. Type or paste the **Value**
5. The variable will be added to the list

---

### **Step 6.4: Add Variable #1 - PORT**

```
Key:   PORT
Value: 10000
```

**What to type:**
- In the **Key** field: Type exactly `PORT` (all caps)
- In the **Value** field: Type `10000`

**Why**: Tells Render which port your app runs on

---

### **Step 6.5: Add Variable #2 - MASTER_FOLDER_ID**

```
Key:   MASTER_FOLDER_ID
Value: [Your Google Drive folder ID]
```

**How to find your folder ID:**

1. Open `backend/.env` file in Notepad
2. Find the line: `MASTER_FOLDER_ID=your_master_folder_id_here`
3. Copy the value after the `=` sign

**If you don't have it yet:**
1. Open Google Drive in your browser
2. Navigate to your master photos folder
3. Look at the URL: `https://drive.google.com/drive/folders/1ABC123XYZ456`
4. Copy the part after `/folders/`: `1ABC123XYZ456`
5. That's your folder ID!

**What to type:**
- **Key**: `MASTER_FOLDER_ID`
- **Value**: Your folder ID (e.g., `1ABC123XYZ456`)

---

### **Step 6.6: Add Variable #3 - DELIVERY_FOLDER_ID**

```
Key:   DELIVERY_FOLDER_ID
Value: 1SvnOWqKVPGMlZBKhriYLsI3fHDUcCv9z
```

**What to type:**
- **Key**: `DELIVERY_FOLDER_ID`
- **Value**: `1SvnOWqKVPGMlZBKhriYLsI3fHDUcCv9z` (or your custom folder ID from `.env`)

**Note**: This is the folder where finalized client photos are stored.

---

### **Step 6.7: Add Variable #4 - CALCOM_API_KEY**

```
Key:   CALCOM_API_KEY
Value: cal_live_82cc72c8ac1ec02b20a64b5412c51852
```

**What to type:**
- **Key**: `CALCOM_API_KEY`
- **Value**: `cal_live_82cc72c8ac1ec02b20a64b5412c51852` (or your actual Cal.com API key)

**How to find your Cal.com API key:**
1. Open `backend/.env`
2. Find: `CALCOM_API_KEY=cal_live_...`
3. Copy the value

---

### **Step 6.8: Add Variable #5 - CALCOM_WEBHOOK_SECRET**

```
Key:   CALCOM_WEBHOOK_SECRET
Value: calcom_secret_placeholder
```

**What to type:**
- **Key**: `CALCOM_WEBHOOK_SECRET`
- **Value**: `calcom_secret_placeholder` (or your actual webhook secret)

---

### **Step 6.9: Add Variable #6 - GOOGLE_CLIENT_EMAIL** ⚠️ IMPORTANT

```
Key:   GOOGLE_CLIENT_EMAIL
Value: [The email you copied in Step 6.2.2]
```

**What to type:**
- **Key**: `GOOGLE_CLIENT_EMAIL`
- **Value**: Paste the email from your Notepad (from Step 6.2.2)

**Example value:**
```
shashini-studio@my-project-123456.iam.gserviceaccount.com
```

**⚠️ Common Mistakes:**
- ❌ Don't include quotes `"`
- ❌ Don't include spaces before/after
- ✅ Just the email address

---

### **Step 6.10: Add Variable #7 - GOOGLE_PRIVATE_KEY** ⚠️ MOST IMPORTANT

```
Key:   GOOGLE_PRIVATE_KEY
Value: [The private key you copied in Step 6.2.3]
```

**What to type:**
- **Key**: `GOOGLE_PRIVATE_KEY`
- **Value**: Paste the ENTIRE private key from your Notepad

**⚠️ CRITICAL INSTRUCTIONS:**

#### **Option A: If you see the key with \n in it**

Your key might look like this:
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n
```

**Do this:**
1. Paste it EXACTLY as is
2. Include the `-----BEGIN PRIVATE KEY-----` part
3. Include the `-----END PRIVATE KEY-----` part
4. Keep all the `\n` characters (they represent line breaks)

#### **Option B: If you see the key on multiple lines**

Your key might look like this:
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7xKq1
(many lines)
vQxKzJ8kF2wE=
-----END PRIVATE KEY-----
```

**Do this:**
1. Copy the ENTIRE block
2. Paste it into the Value field
3. Render will handle the formatting

**⚠️ Common Mistakes:**
- ❌ Don't remove the BEGIN/END lines
- ❌ Don't add extra quotes
- ❌ Don't remove the `\n` characters
- ✅ Copy and paste exactly as it appears in credentials.json

---

### **Step 6.11: Verify All Variables**

After adding all 7 variables, you should see this list:

```
┌─────────────────────────────────────────────────────────┐
│  Environment Variables                                   │
├─────────────────────────────────────────────────────────┤
│  PORT                        10000                       │
│  MASTER_FOLDER_ID            1ABC123XYZ456              │
│  DELIVERY_FOLDER_ID          1SvnOWqKVPGMl...           │
│  CALCOM_API_KEY              cal_live_82cc...           │
│  CALCOM_WEBHOOK_SECRET       calcom_secret...           │
│  GOOGLE_CLIENT_EMAIL         shashini-studio@...        │
│  GOOGLE_PRIVATE_KEY          -----BEGIN PRIVATE...      │
└─────────────────────────────────────────────────────────┘
```

**Checklist:**
- [ ] All 7 variables are listed
- [ ] No typos in the Key names
- [ ] GOOGLE_PRIVATE_KEY shows `-----BEGIN PRIVATE...`
- [ ] GOOGLE_CLIENT_EMAIL ends with `.iam.gserviceaccount.com`

---

### **Step 6.12: Save and Continue**

1. **Scroll down** to the bottom of the page
2. Click the big **"Create Web Service"** button
3. Render will now:
   - Install your dependencies (`npm install`)
   - Start your server (`npm start`)
   - Deploy your backend

**What happens next:**
```
Building...  ⏳
Installing dependencies...
Starting server...
Deployed! ✅
```

This takes **3-5 minutes**.

---

## 🔍 How to Check If It Worked

### **Step 6.13: Get Your Backend URL**

After deployment completes:

1. Look at the top of your Render dashboard
2. You'll see a URL like: `https://shashini-backend-abc123.onrender.com`
3. **Copy this URL** (you'll need it later)

### **Step 6.14: Test Your Backend**

1. Open a new browser tab
2. Paste your backend URL
3. You should see:
   ```json
   {"status":"Photography Studio API is secure and running."}
   ```

**If you see this** ✅ = Success! Your backend is deployed!

**If you see an error** ❌ = Check the logs (see troubleshooting below)

---

## 🐛 Troubleshooting

### **Error: "Application failed to respond"**

**Problem**: Backend crashed during startup

**Solution:**
1. Click **"Logs"** tab in Render
2. Look for error messages
3. Common issues:
   - Missing environment variable
   - Wrong GOOGLE_PRIVATE_KEY format

### **Error: "Google Drive authentication failed"**

**Problem**: Credentials are wrong

**Solution:**
1. Go to **"Environment"** tab in Render
2. Click **"Edit"** next to GOOGLE_PRIVATE_KEY
3. Make sure it includes:
   - `-----BEGIN PRIVATE KEY-----`
   - All the content
   - `-----END PRIVATE KEY-----`
4. Click **"Save Changes"**
5. Render will automatically redeploy

### **Error: "Module not found"**

**Problem**: Root directory is wrong

**Solution:**
1. Go to **"Settings"** tab
2. Find **"Root Directory"**
3. Make sure it says: `backend`
4. Save and redeploy

---

## 📸 Visual Reference

### What the Environment Variables Section Looks Like:

```
┌─────────────────────────────────────────────────────────────┐
│  New Web Service                                             │
├─────────────────────────────────────────────────────────────┤
│  Name:           shashini-backend                            │
│  Region:         Singapore                                   │
│  Branch:         main                                        │
│  Root Directory: backend                                     │
│  Build Command:  npm install                                 │
│  Start Command:  npm start                                   │
│                                                              │
│  ▼ Advanced                                                  │
│                                                              │
│  Environment Variables                                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Key                    Value                            │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ PORT                   10000                            │ │
│  │ MASTER_FOLDER_ID       1ABC...                          │ │
│  │ DELIVERY_FOLDER_ID     1Svn...                          │ │
│  │ CALCOM_API_KEY         cal_live...                      │ │
│  │ CALCOM_WEBHOOK_SECRET  calcom_secret...                 │ │
│  │ GOOGLE_CLIENT_EMAIL    shashini-studio@...              │ │
│  │ GOOGLE_PRIVATE_KEY     -----BEGIN PRIVATE KEY-----...   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [+ Add Environment Variable]                                │
│                                                              │
│                                    [Create Web Service]      │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Summary Checklist

Before clicking "Create Web Service":

- [ ] Added PORT = 10000
- [ ] Added MASTER_FOLDER_ID (your Google Drive folder)
- [ ] Added DELIVERY_FOLDER_ID
- [ ] Added CALCOM_API_KEY
- [ ] Added CALCOM_WEBHOOK_SECRET
- [ ] Added GOOGLE_CLIENT_EMAIL (from credentials.json)
- [ ] Added GOOGLE_PRIVATE_KEY (entire key with BEGIN/END)
- [ ] Verified all 7 variables are listed
- [ ] No typos in variable names
- [ ] Ready to click "Create Web Service"

---

## 🎯 Next Steps

After your backend is deployed:

1. **Copy your backend URL** (e.g., `https://shashini-backend-abc123.onrender.com`)
2. **Go to Step 2** in `DEPLOYMENT_FIX_CHECKLIST.md`
3. **Update your frontend** with the new backend URL
4. **Push to GitHub**
5. **Done!** 🎉

---

## 💡 Pro Tips

1. **Save your backend URL** in a text file - you'll need it multiple times
2. **Don't share your environment variables** - they're secrets!
3. **If deployment fails**, check the Logs tab for detailed error messages
4. **Render free tier** sleeps after 15 minutes of inactivity - first request might be slow

---

**Need more help?** Check the Render documentation or ask me! 🚀
