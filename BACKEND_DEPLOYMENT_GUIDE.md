# 🚀 Backend Deployment Guide

This guide covers deploying your Node.js/Express backend separately from the frontend.

---

## 📋 **Pre-Deployment Checklist**

Before deploying to ANY platform, complete these steps:

### ✅ **1. Verify Your Backend Works Locally**

```bash
cd backend
npm install
npm start
```

Visit `http://localhost:5001` - you should see: `{"status":"Photography Studio API is secure and running."}`

### ✅ **2. Prepare Environment Variables**

Your backend needs these environment variables (from `backend/.env`):

- `PORT` - Will be set automatically by hosting platforms
- `MASTER_FOLDER_ID` - Your Google Drive master folder ID
- `DELIVERY_FOLDER_ID` - Your Google Drive delivery folder ID
- `CALCOM_API_KEY` - Your Cal.com API key
- `CALCOM_WEBHOOK_SECRET` - Your Cal.com webhook secret
- `GOOGLE_CLIENT_EMAIL` - From your `credentials.json`
- `GOOGLE_PRIVATE_KEY` - From your `credentials.json`

### ✅ **3. Extract Google Credentials**

Your `credentials.json` won't work on cloud platforms. You need to extract the values:

1. Open `backend/credentials.json`
2. Copy the `client_email` value
3. Copy the `private_key` value (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)

---

## 🎯 **Recommended Platforms (All FREE)**

| Platform | Free Tier | Best For | Difficulty |
|----------|-----------|----------|------------|
| **Render.com** | 750 hrs/month | Production apps | ⭐ Easy |
| **Railway.app** | $5 credit/month | Quick deploys | ⭐⭐ Medium |
| **Google Cloud Run** | 2M requests/month | Google integration | ⭐⭐⭐ Advanced |

---

## 🟢 **Option 1: Render.com (RECOMMENDED)**

### **Why Render?**
- ✅ Easiest setup
- ✅ Auto-deploys from GitHub
- ✅ Free SSL certificates
- ✅ 750 hours/month free (enough for 24/7)
- ✅ Automatic HTTPS

### **Step-by-Step Deployment**

#### **Step 1: Push Your Code to GitHub**

```bash
# From your project root (d:\photographybyag)
git add .
git commit -m "Prepare backend for deployment"
git push origin main
```

#### **Step 2: Sign Up for Render**

1. Go to [https://render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with your **GitHub account**

#### **Step 3: Create a New Web Service**

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `Indreshsenthilkumar/Shashiniphotogrphy`
3. Click **"Connect"** next to your repository

#### **Step 4: Configure the Service**

Fill in these settings:

| Field | Value |
|-------|-------|
| **Name** | `shashini-studio-backend` |
| **Region** | Choose closest to you (e.g., Singapore) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

#### **Step 5: Add Environment Variables**

Click **"Advanced"** → **"Add Environment Variable"** and add these:

```
PORT=10000
MASTER_FOLDER_ID=your_master_folder_id_here
DELIVERY_FOLDER_ID=1SvnOWqKVPGMlZBKhriYLsI3fHDUcCv9z
CALCOM_API_KEY=cal_live_82cc72c8ac1ec02b20a64b5412c51852
CALCOM_WEBHOOK_SECRET=calcom_secret_placeholder
GOOGLE_CLIENT_EMAIL=<paste from credentials.json>
GOOGLE_PRIVATE_KEY=<paste from credentials.json - include BEGIN/END lines>
```

⚠️ **IMPORTANT**: For `GOOGLE_PRIVATE_KEY`, paste the ENTIRE key including:
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQE...
-----END PRIVATE KEY-----
```

#### **Step 6: Deploy**

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. You'll get a URL like: `https://shashini-studio-backend.onrender.com`

#### **Step 7: Test Your Deployment**

Visit: `https://shashini-studio-backend.onrender.com`

You should see:
```json
{"status":"Photography Studio API is secure and running."}
```

#### **Step 8: Update Frontend**

Update your frontend API URLs to point to your new Render URL:

```javascript
// In frontend/admin.js or wherever you call the API
const API_BASE_URL = 'https://shashini-studio-backend.onrender.com/api';
```

---

## 🔵 **Option 2: Railway.app**

### **Why Railway?**
- ✅ Very fast deployments
- ✅ Great developer experience
- ✅ $5 free credit per month
- ✅ Easy GitHub integration

### **Step-by-Step Deployment**

#### **Step 1: Sign Up for Railway**

1. Go to [https://railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Sign in with **GitHub**

#### **Step 2: Deploy from GitHub**

1. Click **"Deploy from GitHub repo"**
2. Select your repository: `Indreshsenthilkumar/Shashiniphotogrphy`
3. Railway will detect it's a Node.js project

#### **Step 3: Configure Root Directory**

1. Click on your service
2. Go to **"Settings"** tab
3. Under **"Root Directory"**, enter: `backend`
4. Click **"Save"**

#### **Step 4: Add Environment Variables**

1. Go to **"Variables"** tab
2. Click **"+ New Variable"**
3. Add each variable:

```
PORT=3000
MASTER_FOLDER_ID=your_master_folder_id_here
DELIVERY_FOLDER_ID=1SvnOWqKVPGMlZBKhriYLsI3fHDUcCv9z
CALCOM_API_KEY=cal_live_82cc72c8ac1ec02b20a64b5412c51852
CALCOM_WEBHOOK_SECRET=calcom_secret_placeholder
GOOGLE_CLIENT_EMAIL=<from credentials.json>
GOOGLE_PRIVATE_KEY=<from credentials.json>
```

#### **Step 5: Generate Domain**

1. Go to **"Settings"** tab
2. Scroll to **"Networking"**
3. Click **"Generate Domain"**
4. You'll get a URL like: `https://shashini-studio-backend.up.railway.app`

#### **Step 6: Test**

Visit your Railway URL - you should see the API status message.

---

## 🟡 **Option 3: Google Cloud Run**

### **Why Cloud Run?**
- ✅ Best for Google Drive integration
- ✅ 2 million requests/month free
- ✅ Auto-scaling
- ✅ Pay only for what you use

### **Prerequisites**

- Google Cloud account
- `gcloud` CLI installed
- Docker installed (optional, Cloud Run can build for you)

### **Step-by-Step Deployment**

#### **Step 1: Create a Dockerfile**

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 8080

CMD ["node", "server.js"]
```

#### **Step 2: Create .dockerignore**

Create `backend/.dockerignore`:

```
node_modules
.env
credentials.json
data
*.md
```

#### **Step 3: Enable Cloud Run API**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Cloud Run API**
4. Enable **Container Registry API**

#### **Step 4: Deploy to Cloud Run**

```bash
cd backend

# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Deploy
gcloud run deploy shashini-backend \
  --source . \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars "MASTER_FOLDER_ID=your_id,DELIVERY_FOLDER_ID=your_id,CALCOM_API_KEY=your_key,GOOGLE_CLIENT_EMAIL=your_email,GOOGLE_PRIVATE_KEY=your_key"
```

#### **Step 5: Get Your URL**

After deployment, you'll get a URL like:
```
https://shashini-backend-xxxxx-as.a.run.app
```

---

## 🔧 **Post-Deployment: Update Frontend**

After deploying your backend, update your frontend to use the new URL:

### **Files to Update:**

1. **`frontend/admin.js`** - Update API endpoints
2. **`frontend/client.js`** - Update API endpoints
3. **Any other files calling the backend**

### **Example Update:**

```javascript
// OLD (local development)
const API_URL = 'http://localhost:5001/api';

// NEW (production)
const API_URL = 'https://your-backend-url.onrender.com/api';
```

---

## 🧪 **Testing Your Deployed Backend**

### **Test Endpoints:**

```bash
# Health check
curl https://your-backend-url.onrender.com/

# Test vaults endpoint
curl https://your-backend-url.onrender.com/api/vaults

# Test messages endpoint
curl https://your-backend-url.onrender.com/api/messages
```

---

## 🐛 **Troubleshooting**

### **Issue: "Application failed to respond"**

**Solution:**
- Make sure `PORT` environment variable is set
- Check that your app listens on `process.env.PORT`
- Review deployment logs

### **Issue: "Google Drive authentication failed"**

**Solution:**
- Verify `GOOGLE_CLIENT_EMAIL` is correct
- Ensure `GOOGLE_PRIVATE_KEY` includes BEGIN/END markers
- Check that your service account has access to the Drive folders

### **Issue: "Module not found"**

**Solution:**
- Ensure `package.json` is in the `backend` folder
- Set **Root Directory** to `backend` in platform settings
- Check that all dependencies are in `dependencies`, not `devDependencies`

### **Issue: "CORS errors"**

**Solution:**
- Update CORS settings in `backend/server.js`:
```javascript
app.use(cors({
  origin: ['https://your-frontend-url.netlify.app', 'http://localhost:3000'],
  credentials: true
}));
```

---

## 📊 **Cost Comparison**

| Platform | Free Tier | Overage Cost | Best For |
|----------|-----------|--------------|----------|
| **Render** | 750 hrs/month | $7/month for always-on | Small-medium apps |
| **Railway** | $5 credit/month | ~$5-10/month | Hobby projects |
| **Cloud Run** | 2M requests/month | Pay per request | High-traffic apps |

---

## 🎯 **My Recommendation**

**Start with Render.com** because:
1. ✅ Easiest setup (5 minutes)
2. ✅ Free tier is generous
3. ✅ Auto-deploys from GitHub
4. ✅ Great for beginners
5. ✅ Can upgrade easily if needed

---

## 📝 **Next Steps**

1. Choose a platform (I recommend Render)
2. Follow the step-by-step guide above
3. Test all endpoints
4. Update your frontend URLs
5. Deploy your frontend to Netlify

---

## 🆘 **Need Help?**

If you encounter issues:
1. Check the deployment logs on your platform
2. Verify all environment variables are set correctly
3. Test locally first with `npm start`
4. Review the troubleshooting section above

---

**Ready to deploy? Let me know which platform you choose, and I can help you through the process!** 🚀
