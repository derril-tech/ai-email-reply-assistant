# Vercel Environment Variables for AI Email Reply Assistant

**Date:** 2025-11-13  
**For:** Web Frontend Deployment on Vercel  
**Status:** ✅ Complete List

---

## ⚠️ IMPORTANT: TWO-STEP SETUP REQUIRED

This app has **TWO** deployments:
1. **Vercel** (Frontend - Next.js)
2. **Railway** (Backend - API)

**Both need environment variables!** Follow both sections below.

---

## 🎯 PART 1: VERCEL ENVIRONMENT VARIABLES (Frontend)

Copy this into your Vercel project settings:

### **Required:**

```bash
NEXT_PUBLIC_API_URL=https://api-production-192f.up.railway.app
```

**What it does:**
- Points the frontend to your Railway-hosted API backend
- Used by all hooks (useAgent, useThreads, useGmailAuth, useDashboard)
- Powers all API calls (draft generation, Gmail OAuth, stats, etc.)

**⚠️ CRITICAL:** This must be set, or the "Connect Gmail" button won't respond!

---

## 🚂 PART 2: RAILWAY API ENVIRONMENT VARIABLES (Backend)

**⚠️ THIS IS CRITICAL!** You must add your Vercel URL to the Railway API server for CORS to work!

### **Add this to Railway API service:**

```bash
# Your Vercel deployment URL (REQUIRED for CORS)
NEXT_PUBLIC_VERCEL_URL=https://your-app-name.vercel.app

# OR use the custom domain approach:
NEXT_PUBLIC_APP_URL=https://your-custom-domain.com
```

**How to add it:**

1. Go to your **Railway dashboard**
2. Select your **API service** (not web service!)
3. Go to **Variables** tab
4. Click **+ New Variable**
5. Add:
   - **Key:** `NEXT_PUBLIC_VERCEL_URL`
   - **Value:** `https://your-app-name.vercel.app` (your actual Vercel URL)
6. Click **Save**
7. Railway will auto-redeploy

**Why this is needed:**
- The API server uses this for CORS (Cross-Origin Resource Sharing)
- Without it, the browser blocks API calls from Vercel
- Symptoms: "Connect Gmail" button does nothing, console shows CORS errors

---

## 📋 COMPLETE ENVIRONMENT VARIABLE CHECKLIST

### **Vercel (Frontend):**
- ✅ `NEXT_PUBLIC_API_URL` = `https://api-production-192f.up.railway.app`

### **Railway API (Backend):**
- ✅ `NEXT_PUBLIC_VERCEL_URL` = `https://your-app-name.vercel.app` **← ADD THIS!**
- ✅ `SUPABASE_URL` = (already set)
- ✅ `SUPABASE_SERVICE_ROLE` = (already set)
- ✅ `SUPABASE_SCHEMA` = `emailreply` (already set)
- ✅ `OPENAI_API_KEY` = (already set)
- ✅ `GOOGLE_CLIENT_ID` = (already set)
- ✅ `GOOGLE_CLIENT_SECRET` = (already set)
- ✅ `GOOGLE_OAUTH_REDIRECT_URI` = `https://api-production-192f.up.railway.app/auth/callback` (already set)
- ✅ `WEB_RAILWAY_URL` = (already set, but now also need Vercel URL!)

---

## 📦 HOW TO SET ENVIRONMENT VARIABLES ON VERCEL

### **Method 1: Vercel Dashboard (Recommended)**

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add the following:

| Key | Value | Environments |
|-----|-------|--------------|
| `NEXT_PUBLIC_API_URL` | `https://api-production-192f.up.railway.app` | Production, Preview, Development |

4. Click **Save**
5. **Redeploy** your project for changes to take effect

### **Method 2: Vercel CLI**

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Link to your project
vercel link

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL

# When prompted, enter: https://api-production-192f.up.railway.app
# Select: Production, Preview, Development (all)

# Redeploy
vercel --prod
```

### **Method 3: `.env.local` (Local Development Only)**

Create a `.env.local` file in the `web/` directory:

```bash
# web/.env.local
NEXT_PUBLIC_API_URL=https://api-production-192f.up.railway.app
```

**⚠️ Important:** This file is **NOT deployed** to Vercel. It's for local testing only.

---

## 🔍 VERIFICATION CHECKLIST

After setting environment variables on Vercel:

### **1. Check Vercel Deployment Logs**

```
✅ Look for: "Using environment variable NEXT_PUBLIC_API_URL"
❌ Look for: "NEXT_PUBLIC_API_URL is undefined"
```

### **2. Test API Connection**

Open your Vercel-deployed app in the browser:

1. Open **DevTools Console** (F12)
2. Go to **Playground** page
3. Check console for API URL:
   ```javascript
   // Should see:
   fetch('https://api-production-192f.up.railway.app/threads?projectId=default')
   
   // Should NOT see:
   fetch('/threads?projectId=default')  // Missing API URL!
   ```

### **3. Test Functionality**

- ✅ Click "Connect Gmail" → Should redirect to Google OAuth
- ✅ Dashboard should load stats (not show 0 for everything)
- ✅ Playground should fetch Gmail threads
- ✅ Draft generation should work

If any of these fail, check that `NEXT_PUBLIC_API_URL` is set correctly.

---

## 🚨 COMMON ISSUES & FIXES

### **Issue 1: "Failed to fetch threads" or 404 errors**

**Cause:** `NEXT_PUBLIC_API_URL` not set or incorrect

**Fix:**
```bash
# Verify in Vercel dashboard:
Settings → Environment Variables → Check NEXT_PUBLIC_API_URL

# Should be:
https://api-production-192f.up.railway.app

# NOT:
http://localhost:8000  ❌ (wrong)
https://api-production-192f.up.railway.app/  ❌ (trailing slash)
```

### **Issue 2: Environment variable changes not applying**

**Cause:** Vercel caches builds

**Fix:**
1. Go to Vercel dashboard → Deployments
2. Click **•••** menu on latest deployment
3. Select **Redeploy**
4. ✅ Check "Use existing build cache" is **OFF**

### **Issue 3: CORS errors in browser console**

**Cause:** API server not allowing Vercel domain

**Fix:**
This is handled on the **API server (Railway)**, not Vercel. Check:

```python
# api/main.py
allowed_origins = [
    "http://localhost:3000",
    "https://your-vercel-app.vercel.app",  # Add your Vercel domain
]
```

Then redeploy the API on Railway.

---

## 📊 COMPLETE ENVIRONMENT COMPARISON

| Variable | Vercel (Web) | Railway (API) |
|----------|--------------|---------------|
| `NEXT_PUBLIC_API_URL` | ✅ **REQUIRED** | ❌ Not used |
| `SUPABASE_URL` | ❌ Not needed | ✅ Required |
| `SUPABASE_SERVICE_ROLE` | ❌ Not needed | ✅ Required |
| `SUPABASE_SCHEMA` | ❌ Not needed | ✅ Required |
| `OPENAI_API_KEY` | ❌ Not needed | ✅ Required |
| `GOOGLE_CLIENT_ID` | ❌ Not needed | ✅ Required |
| `GOOGLE_CLIENT_SECRET` | ❌ Not needed | ✅ Required |
| `GOOGLE_OAUTH_REDIRECT_URI` | ❌ Not needed | ✅ Required |
| `WEB_RAILWAY_URL` | ❌ Not needed | ✅ Required |

**Summary:** Vercel only needs **1 environment variable**: `NEXT_PUBLIC_API_URL`

---

## 🎯 QUICK COPY-PASTE FOR VERCEL

### **Production Environment Variables:**

```bash
# Copy this into Vercel → Settings → Environment Variables

NEXT_PUBLIC_API_URL=https://api-production-192f.up.railway.app
```

### **Preview Environment Variables (Optional):**

If you have a staging API server:

```bash
# For preview deployments (PRs)
NEXT_PUBLIC_API_URL=https://api-staging-192f.up.railway.app
```

### **Development Environment Variables (Optional):**

For local development on Vercel:

```bash
# For local dev (vercel dev)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## ✅ FINAL CHECKLIST

Before deploying to Vercel:

- [ ] Set `NEXT_PUBLIC_API_URL` in Vercel dashboard
- [ ] Set environment for **all three**: Production, Preview, Development
- [ ] Redeploy project after adding variable
- [ ] Test "Connect Gmail" button (OAuth flow)
- [ ] Test Dashboard (stats load)
- [ ] Test Playground (threads load)
- [ ] Test Draft generation
- [ ] Check browser console for errors

---

## 🚀 DEPLOYMENT COMMAND

```bash
# From web/ directory

# Build and test locally first
npm run build

# If build succeeds, deploy to Vercel
vercel --prod

# Or let GitHub auto-deploy (if connected)
git push origin main
```

---

## 📞 SUPPORT

**If something doesn't work:**

1. Check Vercel deployment logs
2. Check browser DevTools console (F12)
3. Verify API server is running on Railway
4. Test API directly: `https://api-production-192f.up.railway.app/jobs/health`

---

**That's it!** You only need **1 environment variable** for Vercel! 🎉

