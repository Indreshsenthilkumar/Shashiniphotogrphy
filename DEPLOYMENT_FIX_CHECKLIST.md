# 🚨 DEPLOYMENT FIX CHECKLIST

## Problem
Your deployed website's vault history, messages, and client pages don't work because they're trying to connect to `localhost:5001` which only exists on your computer.

## Solution Steps

### ✅ Step 1: Deploy Your Backend (Choose ONE platform)

#### Option A: Render.com (Easiest - RECOMMENDED)

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Select repository: `Indreshsenthilkumar/Shashiniphotogrphy`
5. Configure:
   ```
   Name: shashini-backend
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```
6. Add Environment Variables (click "Advanced"):
   ```
   PORT=10000
   MASTER_FOLDER_ID=your_master_folder_id_here
   DELIVERY_FOLDER_ID=1SvnOWqKVPGMlZBKhriYLsI3fHDUcCv9z
   CALCOM_API_KEY=cal_live_82cc72c8ac1ec02b20a64b5412c51852
   CALCOM_WEBHOOK_SECRET=calcom_secret_placeholder
   ```
   
7. **IMPORTANT**: Extract Google Credentials
   - Open `backend/credentials.json`
   - Copy `client_email` value
   - Copy `private_key` value (including BEGIN/END lines)
   - Add these as environment variables:
     ```
     GOOGLE_CLIENT_EMAIL=<paste client_email>
     GOOGLE_PRIVATE_KEY=<paste entire private_key>
     ```

8. Click "Create Web Service"
9. Wait 3-5 minutes
10. **Copy your URL**: `https://shashini-backend-xxxx.onrender.com`

#### Option B: Railway.app (Fast)

1. Go to https://railway.app
2. Sign in with GitHub
3. "Deploy from GitHub repo"
4. Select your repository
5. Settings → Root Directory: `backend`
6. Variables → Add all environment variables (same as Render)
7. Generate Domain
8. **Copy your URL**: `https://shashini-backend-xxxx.up.railway.app`

---

### ✅ Step 2: Update Frontend with Backend URL

**Option 1: Using the new config.js (Recommended)**

1. Open `frontend/config.js`
2. Replace line 7:
   ```javascript
   const PRODUCTION_API_URL = 'https://your-actual-backend-url.onrender.com/api';
   ```
   Example:
   ```javascript
   const PRODUCTION_API_URL = 'https://shashini-backend-abc123.onrender.com/api';
   ```

3. Update `frontend/admin.html` - Add this BEFORE the closing `</body>` tag:
   ```html
   <script type="module">
     import { API_URL, GOOGLE_SCRIPT_URL, CMS_SHEET_URL } from './config.js';
     window.API_URL = API_URL;
     window.GOOGLE_SCRIPT_URL = GOOGLE_SCRIPT_URL;
     window.CMS_SHEET_URL = CMS_SHEET_URL;
   </script>
   <script src="admin.js"></script>
   ```

4. Update `frontend/admin.js` - Change lines 1-3:
   ```javascript
   const API_URL = window.API_URL || 'http://127.0.0.1:5001/api';
   const GOOGLE_SCRIPT_URL = window.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbz5mtk_rdyaeXB5_YTIXO12NvqlXaSYNKiREsIMJ3FsDDMEmg2aiOc9ExlNYxH03u8k/exec';
   const CMS_SHEET_URL = window.CMS_SHEET_URL || 'https://script.google.com/macros/s/AKfycbwQTkkUUH6KSrajQCD4WLJ3uRT8ddBDqr-dQFIDwMAkFsAB9PXBZxnYmzo6SaHMP9iF/exec';
   ```

5. Do the same for `frontend/index.html` and `frontend/main.js`

**Option 2: Direct Update (Simpler but less flexible)**

1. Open `frontend/admin.js`
2. Change line 1 from:
   ```javascript
   const API_URL = 'http://127.0.0.1:5001/api';
   ```
   To:
   ```javascript
   const API_URL = 'https://your-backend-url.onrender.com/api';
   ```

3. Open `frontend/main.js`
4. Change line 1 the same way

---

### ✅ Step 3: Push Changes to GitHub

```bash
cd d:\photographybyag
git add .
git commit -m "Update API URLs for production deployment"
git push origin main
```

---

### ✅ Step 4: Redeploy Frontend on Netlify

Your Netlify site should auto-deploy when you push to GitHub. If not:

1. Go to https://app.netlify.com
2. Find your site
3. Click "Trigger deploy" → "Deploy site"
4. Wait 1-2 minutes

---

### ✅ Step 5: Test Everything

Visit your deployed website and test:

- [ ] Admin login works
- [ ] Vault history loads
- [ ] Messages load
- [ ] Client vault page works
- [ ] Profile page works

---

## 🐛 Troubleshooting

### "Failed to fetch" or "Network Error"

**Problem**: Backend isn't deployed or URL is wrong

**Solution**:
1. Visit your backend URL directly: `https://your-backend-url.onrender.com`
2. You should see: `{"status":"Photography Studio API is secure and running."}`
3. If not, check Render/Railway logs

### "CORS Error"

**Problem**: Backend needs to allow requests from your Netlify domain

**Solution**: Update `backend/server.js` line 38:
```javascript
app.use(cors({
  origin: ['https://your-netlify-site.netlify.app', 'http://localhost:3000'],
  credentials: true
}));
```

### "Google Drive authentication failed"

**Problem**: Environment variables not set correctly

**Solution**:
1. Check Render/Railway environment variables
2. Ensure `GOOGLE_PRIVATE_KEY` includes BEGIN/END lines
3. Ensure no extra spaces or quotes

---

## 📊 Quick Reference

| Component | Local Development | Production |
|-----------|------------------|------------|
| **Frontend** | `http://localhost:3000` | `https://your-site.netlify.app` |
| **Backend** | `http://localhost:5001` | `https://your-backend.onrender.com` |
| **Google Scripts** | Same URL everywhere | Same URL everywhere |

---

## 🎯 Summary

1. ✅ Deploy backend to Render/Railway
2. ✅ Get backend URL
3. ✅ Update frontend API URLs
4. ✅ Push to GitHub
5. ✅ Netlify auto-deploys
6. ✅ Test everything

**Estimated Time**: 15-20 minutes

---

## 🆘 Need Help?

If you're stuck:
1. Check backend logs on Render/Railway
2. Check browser console for errors (F12)
3. Verify all environment variables are set
4. Test backend URL directly in browser

---

**Ready to fix it? Start with Step 1!** 🚀
