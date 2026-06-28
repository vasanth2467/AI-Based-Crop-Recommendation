# Vercel Deployment Troubleshooting Guide

This guide helps resolve common issues when deploying the AgriSmart AI project to Vercel.

## Before Deployment

### ✅ Pre-Flight Checklist

```bash
# 1. Verify frontend builds locally
cd crop-recommendation-system/frontend
npm run build
# Should complete without errors ✅

# 2. Check for environment variables
cat .env.example  # Should include VITE_API_BASE_URL

# 3. Test API connectivity
cd ../backend
curl http://localhost:8000/health
# Should return: {"status":"ok","model_loaded":true,...}
```

---

## Common Issues & Solutions

### Issue 1: "Failed to get prediction. Ensure the backend is running."

**Symptoms:**

- Form submits but no prediction result
- Browser console shows 404 or CORS error
- Network tab shows failed API request

**Causes:**

1. `VITE_API_BASE_URL` not set or incorrect
2. Backend API is down
3. Backend URL is different from what frontend is calling

**Solutions:**

#### Step 1: Check Environment Variable

```bash
# In Vercel Dashboard:
# Settings → Environment Variables → Check VITE_API_BASE_URL
```

**Should be:**

```
VITE_API_BASE_URL=https://your-backend-url.com
```

**NOT:**

```
❌ http://localhost:8000        # Won't work in production
❌ https://your-backend-url.com/ # Don't include trailing slash
```

#### Step 2: Trigger Redeploy

1. Go to Vercel Dashboard
2. Click **Deployments**
3. Find the latest deployment
4. Click the **⋯** menu → **Redeploy**
5. Wait for deployment to complete

#### Step 3: Verify Backend is Running

```bash
# In terminal, check backend status
curl https://your-backend-url.com/health

# Should return (200 OK):
# {"status":"ok","model_loaded":true,"model_accuracy":0.94,...}

# If connection refused:
# - Backend server is down
# - URL is incorrect
# - Firewall blocking requests
```

#### Step 4: Check CORS Settings

```bash
# Backend logs should show allowed origins
# If you see CORS error, update backend:
# ALLOWED_ORIGINS=https://yourdomain.vercel.app,https://yourdomain.com
```

#### Step 5: Browser Console Check

1. Open browser (F12 or Cmd+Option+I)
2. Go to **Console** tab
3. Look for error messages:
   - `Failed to fetch` → Network error
   - `CORS error` → Backend CORS configuration
   - `404 Not Found` → Wrong API URL
   - `500 Internal Server Error` → Backend issue

---

### Issue 2: "ENV variables not available"

**Symptoms:**

- Frontend shows "Cannot read property 'VITE_API_BASE_URL' of undefined"
- API URL is undefined or null in network requests

**Causes:**

- Environment variable not set in Vercel
- Typo in environment variable name
- Environment variable set at wrong scope

**Solutions:**

#### Step 1: Add Variable Correctly

1. Go to Vercel Dashboard → Project
2. **Settings** → **Environment Variables**
3. Add:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://your-backend-url.com`
4. Select scopes:
   - ☑ Production
   - ☑ Preview
   - ☑ Development (optional)

#### Step 2: Use Correct Syntax

```javascript
// ✅ Correct - in React/Vite
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ❌ Wrong - process.env is Node.js only
const API_URL = process.env.VITE_API_BASE_URL;

// ❌ Wrong - missing VITE_ prefix
const API_URL = import.meta.env.API_BASE_URL;
```

#### Step 3: Rebuild and Redeploy

```bash
# In Vercel:
# Deployments → Latest → ⋯ → Redeploy
```

---

### Issue 3: "Build failed - Module not found"

**Symptoms:**

- Vercel build fails
- Error: "Cannot find module 'xyz'"

**Causes:**

- Missing dependency in package.json
- Node modules not installed
- Typo in import path

**Solutions:**

#### Solution A: Add Missing Dependency

```bash
cd crop-recommendation-system/frontend

# Find missing package
npm list | grep error

# Install missing package
npm install missing-package-name

# Update package.json and commit
git add package.json package-lock.json
git commit -m "Add missing dependency"
git push
```

#### Solution B: Check Build Output

1. Vercel Dashboard → Deployments
2. Click failed deployment
3. View **Build Logs** for detailed error

#### Solution C: Clear Build Cache

1. Vercel Dashboard → Settings → Advanced
2. Find **Ignored Build Step**
3. Set to: `npm run build`
4. Go back to Deployments → Redeploy

---

### Issue 4: "Timeout - deployment taking too long"

**Symptoms:**

- Deployment never completes
- Shows spinning/loading state > 15 minutes
- Eventually shows "Timeout" error

**Causes:**

- Backend database taking too long to initialize
- npm install taking too long
- Large dependencies

**Solutions:**

#### Solution A: Cancel and Redeploy

1. Vercel Dashboard → Deployments → Active deployment
2. Click to expand
3. Click "Cancel Deployment"
4. Wait 30 seconds
5. Go back to Deployments → Latest → Redeploy

#### Solution B: Reduce Build Time

```json
// vercel.json - Add timeout
{
  "buildCommand": "npm run build",
  "installCommand": "npm ci", // Faster than npm install
  "framework": "vite"
}
```

#### Solution C: Check Build Settings

1. Settings → Build & Development Settings
2. Set **Build Command**: `npm run build`
3. Set **Output Directory**: `dist`
4. Save and redeploy

---

### Issue 5: "403 Forbidden - Access Denied"

**Symptoms:**

- Vercel shows "403" error
- "Access Denied" message
- Can't view deployed site

**Causes:**

- Vercel domain blocked
- Authentication required
- File permissions issue

**Solutions:**

#### Solution A: Check Domain Settings

1. Vercel Dashboard → Settings → Domains
2. Verify domain is properly configured
3. Check DNS records (if custom domain)

#### Solution B: Clear Cache

1. Vercel Dashboard → Deployments → Latest
2. Click **⋯** → **Invalidate Cache**
3. Wait for revalidation

#### Solution C: Redeploy

```bash
cd crop-recommendation-system/frontend
vercel --prod --force
```

---

### Issue 6: "Build Success but blank page"

**Symptoms:**

- Deployment shows "Ready"
- Site loads but shows nothing
- Console has JavaScript errors

**Causes:**

- React app failing to mount
- Missing dependencies
- JavaScript error in app startup

**Solutions:**

#### Step 1: Check Browser Console

1. Open site in browser
2. Press F12 to open Dev Tools
3. Check **Console** tab for errors
4. Check **Network** tab for failed requests

#### Step 2: Check Built Files

1. Vercel Dashboard → Deployments → Latest
2. Click **Inspect** (bottom right)
3. Check if `dist/index.html` exists
4. Check if `dist/assets/*.js` files exist

#### Step 3: Fix Local Build

```bash
cd crop-recommendation-system/frontend
npm run build

# If build fails, fix errors locally first
# Then commit and push

git add .
git commit -m "Fix build errors"
git push

# Vercel will auto-redeploy
```

---

### Issue 7: "CORS error in browser"

**Symptoms:**

- Browser console shows: "Access to XMLHttpRequest blocked by CORS policy"
- API call fails silently
- Response has `Access-Control-Allow-Origin` missing

**Causes:**

- Backend `ALLOWED_ORIGINS` doesn't include frontend URL
- Backend not responding with CORS headers
- Frontend and backend on different domains

**Solutions:**

#### Step 1: Update Backend ALLOWED_ORIGINS

```bash
# Backend environment variables should include:
ALLOWED_ORIGINS=https://your-project.vercel.app,https://yourdomain.com
```

#### Step 2: Verify Backend Endpoint

```bash
# Test backend CORS headers
curl -i https://your-backend-url.com/health

# Should include headers like:
# Access-Control-Allow-Origin: https://your-frontend-url.vercel.app
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

#### Step 3: Check Frontend URL in Backend

```javascript
// Make sure frontend URL in ALLOWED_ORIGINS matches exactly:
// If frontend is: https://agrismart.vercel.app
// Then ALLOWED_ORIGINS should be: https://agrismart.vercel.app
// NOT: https://agrismart.vercel.app/ (trailing slash)
// NOT: http://agrismart.vercel.app (wrong protocol)
```

#### Step 4: Redeploy Backend

After updating environment variables, redeploy backend through its platform (Railway, Heroku, etc.)

---

### Issue 8: "502 Bad Gateway - Backend Error"

**Symptoms:**

- API returns 502 Bad Gateway
- Backend is up but not responding properly
- Error happens after deployment

**Causes:**

- Backend crashed
- Database connection failed
- Model file missing
- Environment variable error

**Solutions:**

#### Step 1: Check Backend Logs

```bash
# Railway:
railway logs

# Heroku:
heroku logs --tail

# AWS:
tail -f /var/log/application.log
```

#### Step 2: Common Fixes

```bash
# If "Model file not found":
# - Backend needs crop_model.pkl
# - Commit to git and redeploy

# If "Database connection error":
# - Check DATABASE_URL is correct
# - Test connection: psql $DATABASE_URL

# If "Import error":
# - Check requirements.txt
# - Run: pip install -r requirements.txt
```

#### Step 3: Restart Backend

- Railway: Dashboard → Deployments → Redeploy
- Heroku: `heroku restart`
- AWS: Restart EC2 instance or service

---

## Quick Verification Checklist

After fixing an issue, verify:

```bash
# 1. Backend is responding
curl -i https://your-backend-url.com/health
# ✅ Should return 200 OK

# 2. Frontend loads
curl -i https://your-frontend.vercel.app
# ✅ Should return 200 OK

# 3. CORS headers present
curl -i -X OPTIONS https://your-backend-url.com/api/predict
# ✅ Should include Access-Control-Allow-Origin header

# 4. Frontend can reach backend
# Open browser, go to frontend, open dev console
# Should show successful API calls in Network tab
```

---

## Getting More Help

### Check Deployment Logs

1. Vercel Dashboard → Project
2. Click **Deployments**
3. Click on deployment
4. View **Logs** section for build output

### Read Full Documentation

- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Quick Start](QUICK_START_DEPLOYMENT.md)
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)

### Test Backend Independently

```bash
# Make test API calls
curl https://your-backend-url.com/health
curl https://your-backend-url.com/api/farmers/1/history
```

### Debug Frontend Locally

```bash
# Set backend URL to production
VITE_API_BASE_URL=https://your-backend-url.com npm run dev

# Open http://localhost:5173
# Check if it can reach backend
```

---

## Performance Tips

### Speed Up Vercel Builds

```json
// vercel.json
{
  "installCommand": "npm ci", // Faster than npm install
  "buildCommand": "npm run build",
  "framework": "vite",
  "regions": ["sfo1"] // Choose nearest region
}
```

### Minimize Frontend Bundle

```bash
# Check bundle size
npm run build
npx webpack-bundle-analyzer

# Tips:
# - Remove unused dependencies
# - Use dynamic imports for large components
# - Optimize images
```

---

## Monitoring

### Set Up Error Tracking

1. [Sentry](https://sentry.io) - Error monitoring
2. Vercel Analytics - Built-in performance monitoring
3. Google Analytics - User analytics

### Monitor Backend

- Railway: Built-in logs and metrics
- Heroku: Logging, Papertrail add-on
- AWS: CloudWatch monitoring

---

## Still Stuck?

1. **Read error message carefully** - usually describes the problem
2. **Check Vercel logs** - most clues are there
3. **Search error message** - likely solution exists online
4. **Ask for help** - share error logs and your .env variables (not secrets!)

---

**Last Updated**: 2024
**For more help**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
