# Vercel "Connect Gmail" Button Not Responding - Complete Diagnostic

**Date:** 2025-11-13  
**Issue:** Button works on Railway but not on Vercel  

---

## 🔍 STEP-BY-STEP DIAGNOSIS

### **Test 1: Check if NEXT_PUBLIC_API_URL is set**

1. Go to your Vercel app in browser
2. Press **F12** (DevTools)
3. Go to **Console** tab
4. Type: `console.log(process.env.NEXT_PUBLIC_API_URL)`
5. Press Enter

**Expected Result:**
```
undefined  ❌ BAD - API URL not set!
```
OR
```
"https://api-production-192f.up.railway.app"  ✅ GOOD
```

**If undefined:** Go to Vercel → Settings → Environment Variables → Add `NEXT_PUBLIC_API_URL`

---

### **Test 2: Check Network Requests**

1. F12 → **Network** tab
2. Click "Connect Gmail" button
3. Look for a request to `/auth/google`

**What you might see:**

**Scenario A: No network request at all**
```
(nothing happens)
```
**Problem:** `NEXT_PUBLIC_API_URL` not set on Vercel
**Fix:** Add the environment variable and redeploy

**Scenario B: Request fails with CORS error**
```
❌ Access to fetch at 'https://api-production...' has been blocked by CORS policy
```
**Problem:** Railway API doesn't allow Vercel domain
**Fix:** Add `NEXT_PUBLIC_VERCEL_URL` to Railway API service

**Scenario C: Request succeeds but nothing happens**
```
✅ 200 OK
Response: { "authorization_url": "https://accounts.google.com/..." }
```
**Problem:** Frontend not redirecting (rare)
**Fix:** Check console for JavaScript errors

---

### **Test 3: Check Google OAuth Console Settings**

⚠️ **THIS COULD BE YOUR ISSUE!**

Go to: https://console.cloud.google.com/apis/credentials

1. Click on your **OAuth 2.0 Client ID**
2. Check **Authorized redirect URIs**

**Should include:**
```
https://api-production-192f.up.railway.app/auth/callback  ← Railway API callback
```

**Should NOT include:**
```
https://your-vercel-app.vercel.app/auth/callback  ← WRONG! This is frontend URL
```

**Why:** The OAuth callback goes to the **API server** (Railway), not the frontend (Vercel).

The flow is:
```
Vercel Frontend 
  → Google OAuth (user logs in)
  → Railway API /auth/callback (processes token)
  → Redirect back to Vercel Frontend /playground?connected=true
```

---

## 🎯 SOLUTION: Link Railway Web Service to Vercel

**You asked:** "What if we linked our web server to Vercel instead?"

**Good news:** You don't need to! The Railway **web service** and Vercel are both serving the same Next.js frontend. You can use **either one**:

### **Option 1: Use Railway Web Service (Easier)**

**Pros:**
- Already configured and working
- No CORS issues (API and Web on same domain)
- No extra environment variables needed
- Already tested and deployed

**Cons:**
- Uses Railway hosting credits for frontend
- Vercel is optimized for Next.js (faster edge network)

**Current URL:** `https://web-production-5e03f.up.railway.app/`

---

### **Option 2: Use Vercel (Better Performance)**

**Pros:**
- Free Vercel hosting for frontend
- Global CDN (faster worldwide)
- Optimized for Next.js
- Better analytics

**Cons:**
- Requires CORS configuration
- Need to set environment variables correctly

**Requirements:**
1. ✅ Set `NEXT_PUBLIC_API_URL` on **Vercel**
2. ✅ Set `NEXT_PUBLIC_VERCEL_URL` on **Railway API**
3. ✅ Redeploy both services

---

## 🚨 MOST COMMON ISSUES

### **Issue 1: Environment Variable Not Applied**

**Symptom:** Set `NEXT_PUBLIC_API_URL` but button still doesn't work

**Cause:** Vercel cached the old build without the variable

**Fix:**
1. Go to Vercel → Deployments
2. Click **•••** on latest deployment
3. Click **Redeploy**
4. ⚠️ **UNCHECK** "Use existing build cache"
5. Click **Redeploy**

---

### **Issue 2: Wrong API URL Format**

**Symptom:** Button does nothing, no console errors

**Wrong:**
```bash
# Missing https://
NEXT_PUBLIC_API_URL=api-production-192f.up.railway.app  ❌

# Trailing slash
NEXT_PUBLIC_API_URL=https://api-production-192f.up.railway.app/  ❌

# Wrong domain
NEXT_PUBLIC_API_URL=https://web-production-5e03f.up.railway.app  ❌
```

**Correct:**
```bash
NEXT_PUBLIC_API_URL=https://api-production-192f.up.railway.app  ✅
```

---

### **Issue 3: Google OAuth Authorized Domains**

**Symptom:** OAuth works on Railway but redirects fail on Vercel

**Fix:**
1. Go to Google Cloud Console → OAuth consent screen
2. Scroll to **Authorized domains**
3. Add:
   - `railway.app`
   - `vercel.app` (if using Vercel)
4. Save

---

## 📋 COMPLETE CHECKLIST FOR VERCEL

### **Vercel Environment Variables:**
- [ ] `NEXT_PUBLIC_API_URL` = `https://api-production-192f.up.railway.app`
- [ ] Saved for: Production, Preview, Development (all 3)
- [ ] Redeployed WITHOUT build cache

### **Railway API Environment Variables:**
- [ ] `NEXT_PUBLIC_VERCEL_URL` = `https://your-app.vercel.app`
- [ ] Railway API redeployed (automatic after save)

### **Google Cloud Console:**
- [ ] OAuth redirect URI: `https://api-production-192f.up.railway.app/auth/callback`
- [ ] Authorized domain: `railway.app`
- [ ] Authorized domain: `vercel.app` (if needed)

### **Verification:**
- [ ] Clear browser cache (Ctrl+Shift+R)
- [ ] F12 → Console → No errors
- [ ] F12 → Network → See `/auth/google` request
- [ ] Click button → Redirects to Google login

---

## 🔧 ALTERNATIVE: Just Use Railway Web Service

**Easiest solution if Vercel keeps having issues:**

1. Use Railway web service URL: `https://web-production-5e03f.up.railway.app/`
2. No environment variables needed (already working!)
3. No CORS issues
4. Everything already configured

**To make it your main URL:**
- Point your custom domain to Railway web service
- Or just use the Railway URL (it works perfectly!)

---

## 💡 RECOMMENDED APPROACH

**For now (MVP/Testing):**
→ Use **Railway Web Service** (`https://web-production-5e03f.up.railway.app/`)
→ Everything works out of the box!

**For production (Later):**
→ Use **Vercel** for frontend (faster, free)
→ Use **Railway** for API only
→ Configure CORS properly

---

## 🆘 STILL NOT WORKING?

**Let's debug together. Please check:**

1. **Vercel Console Logs:**
   - F12 → Console → Screenshot any errors
   
2. **Vercel Network Tab:**
   - F12 → Network → Click "Connect Gmail"
   - Screenshot the requests (or lack thereof)

3. **Environment Variables:**
   - Vercel → Settings → Environment Variables
   - Screenshot showing `NEXT_PUBLIC_API_URL` is set

4. **Railway API Variables:**
   - Railway → API Service → Variables
   - Screenshot showing `NEXT_PUBLIC_VERCEL_URL` is set

Send these screenshots and we'll diagnose the exact issue!

---

**Quick Decision Tree:**

```
Is it working on Railway web service?
├─ YES → Just use Railway URL! (easiest)
│        https://web-production-5e03f.up.railway.app/
│
└─ NO → Check Google Console OAuth settings
         (redirect URI must be API server, not frontend)
```

