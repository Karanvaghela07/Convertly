# Deployment Guide for Convertly

## Architecture Overview

```
┌─────────────────────┐     API Calls      ┌─────────────────────┐
│   FRONTEND          │ ─────────────────► │   BACKEND           │
│   (Netlify)         │                    │   (Render.com)      │
│                     │                    │                     │
│   - HTML/CSS/JS     │                    │   - Node.js/Express │
│   - Static files    │                    │   - File conversions│
│   - Free hosting    │                    │   - API endpoints   │
└─────────────────────┘                    └─────────────────────┘
```

---

## Step 1: Deploy Backend to Render.com

### 1.1 Create GitHub Repository

First, push your code to GitHub:

```bash
# In your project folder
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/convertlyyy-api.git
git push -u origin main
```

### 1.2 Sign Up on Render.com

1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Click "New +" → "Web Service"

### 1.3 Connect Repository

1. Select your GitHub repository
2. Configure settings:
   - **Name**: `convertlyyy-api`
   - **Region**: Oregon (US West) - closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

### 1.4 Environment Variables

Add these in Render dashboard → Environment:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `MONGO_URI` | `your_mongodb_connection_string` |
| `JWT_SECRET` | `your_secret_key` |
| `GOOGLE_CLIENT_ID` | `your_google_oauth_client_id` (optional) |

### 1.5 Deploy

Click "Create Web Service" - Render will automatically deploy.

Your API URL will be: `https://convertlyyy-api.onrender.com`

---

## Step 2: Update Frontend for Production

### 2.1 Update API URL

Edit `public/js/app.js` line 4-6:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? '' 
  : 'https://convertlyyy-api.onrender.com'; // ← Your Render URL
```

### 2.2 Commit Changes

```bash
git add .
git commit -m "Update API URL for production"
git push
```

---

## Step 3: Deploy Frontend to Netlify

### 3.1 Option A: Deploy via Git (Recommended)

1. Go to [netlify.com](https://netlify.com)
2. Sign up / Log in
3. Click "Add new site" → "Import an existing project"
4. Connect GitHub and select your repository
5. Configure:
   - **Build command**: Leave empty (static site)
   - **Publish directory**: `public`
6. Click "Deploy site"

### 3.2 Option B: Drag & Drop

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag your `public` folder
3. Done!

---

## Step 4: Configure Custom Domain (Optional)

### On Netlify:
1. Go to Site settings → Domain management
2. Add custom domain
3. Follow DNS configuration instructions

### On Render:
1. Go to your service → Settings → Custom Domain
2. Add domain and configure DNS

---

## Step 5: Test Everything

1. ✅ Visit your Netlify URL: `https://convertlyyy.netlify.app`
2. ✅ Try converting a PDF to Word
3. ✅ Check browser console for errors
4. ✅ Verify file downloads work

---

## Troubleshooting

### "CORS Error" in browser console
- Make sure your Netlify domain is added to CORS origins in `server.js`
- Redeploy the backend after changes

### "Cannot find module 'xlsx'" error
- Run `npm install xlsx` locally
- Commit and push `package.json` and `package-lock.json`
- Render will reinstall on next deploy

### Conversion takes too long
- Render free tier has cold starts (first request after 15min idle = slow)
- Consider upgrading to paid tier for always-on

### MongoDB connection failed
- Verify MONGO_URI environment variable is set in Render
- Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access

---

## File Structure for Deployment

```
convertlyyy/
├── public/               ← Deploy to Netlify
│   ├── index.html
│   ├── css/
│   ├── js/
│   │   └── app.js       ← Contains API_BASE_URL
│   └── ...
├── server.js            ← Deploy to Render
├── package.json
├── render.yaml          ← Render config
└── uploads/             ← Created automatically
```

---

## Quick Commands

```bash
# Test locally
npm install
node server.js
# Visit http://localhost:3000

# Deploy to GitHub
git add .
git commit -m "Ready for deployment"
git push

# Render deploys automatically on push!
# Netlify deploys automatically on push!
```

---

## Costs

| Service | Plan | Cost |
|---------|------|------|
| Netlify | Starter | FREE |
| Render | Free | FREE |
| MongoDB Atlas | M0 | FREE |

**Total: $0/month** for up to 1000 conversions/day

---

## Next Steps After Deployment

1. **Submit to Google Search Console** - Add your live URL
2. **Request indexing** for all pages
3. **Set up Google Analytics** (optional)
4. **Monitor Render logs** for errors
5. **Test all conversion tools** on production
