# Railway Setup Guide 2025 

**Complete step-by-step guide for deploying a monorepo (FastAPI + Next.js) to Railway**

---

## Overview

We need to deploy **TWO separate services** from one GitHub repo:
- **API Service** - FastAPI backend (`/api` folder)
- **Web Service** - Next.js frontend (`/web` folder)

---

## Prerequisites

Before starting, ensure you have:
- GitHub repo connected
- Railway account created
- Environment variables ready:
  - `OPENAI_API_KEY`
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
  - `SUPABASE_SERVICE_ROLE`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  Or any additional variables depending on your project / appliction needs

---

## STEP 1: Initial Setup (If Service Auto-Created)

If Railway auto-created a service when you connected your repo:

1. **Go to your Railway project dashboard**
2. **Click on the crashed/failed service**
3. **Go to "Settings" tab** (right side)
4. **Scroll to the bottom**
5. **Click "Delete Service"** (red button)
6. **Confirm deletion**

**Why:** Railway thought your repo was a single app, but we have a monorepo with two separate apps.

---

## STEP 2: Create the API Service

### 2.1 Create Empty Service

1. **In your Railway project, click "+ New"** or **"Create"** button
2. **Select "Empty Service"**
3. **Name it:** `api`

### 2.2 Connect to GitHub Repository

1. **Click on the `api` service card** to open it
2. **Go to "Settings" tab**
3. **Find "Service Source"** or **"Connect"** section
4. **Click "Connect Repo"**
5. **Select your repository:** 
6. **Select branch:** `main`

### 2.3 Configure Settings

Still in the **Settings** tab, configure the following:

#### **Root Directory**
- **Set to:** `/api`
- This tells Railway where your FastAPI code lives

#### **Start Command**
- **Set to:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- This is how Railway will run your FastAPI server

#### **Builder**
- **Select:** `Railpack` (pre-selected)
- Railway's default builder that auto-detects Python projects

#### **Custom Build Command**
- **Leave EMPTY**
- Nixpacks will automatically detect `requirements.txt` and run `pip install -r requirements.txt`
- Only fill this if auto-detection fails

#### **Watch Paths**
- **Set to:** `/api/**`
- This ensures Railway ONLY redeploys the API service when files in `/api` folder change
- Prevents unnecessary rebuilds when you update `/web` folder

---

## STEP 3: Add Environment Variables for API

1. **Click on the `api` service**
2. **Go to "Variables" tab**
3. **Click "Add Variable"** or **"New Variable"**
4. **Add the following variables one by one:**

| Variable Name | Description | Example Value |
|--------------|-------------|---------------|
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-proj-...` |
| `OPENAI_MODEL` | (Optional) OpenAI model to use | `gpt-4.1-mini` (default) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | `https://...upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | `...` |
| `SUPABASE_SERVICE_ROLE` | Supabase service role key | `eyJ...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://...supabase.co` |
| `WEB_RAILWAY_URL` | **IMPORTANT:** Your Railway Web service URL | `https://web-production-...up.railway.app` |
| `VERCEL_URL` | (Optional) Your Vercel deployment URL | `https://your-app.vercel.app` |


5. **Save the variables**
6. **Deploy the service** (it may auto-deploy after saving)

---

## STEP 4: Create the Web Service

*(To be continued as we progress...)*

### 4.1 Create Empty Service

1. **In your Railway project, click "+ New"** or **"Create"** button
2. **Select "Empty Service"**
3. **Name it:** `web`

### 4.2 Connect to GitHub Repository

1. **Click on the `web` service card** to open it
2. **Go to "Settings" tab**
3. **Find "Service Source"** or **"Connect"** section
4. **Click "Connect Repo"**
5. **Select your repository:** 
6. **Select branch:** `main`

### 4.3 Configure Settings

Still in the **Settings** tab, configure the following:

#### **Root Directory**
- **Set to:** `/web`
- This tells Railway where your Next.js code lives

#### **Build Command**
- **Set to:** `npm run build`
- ⚠️ **NOT** `npm ci && npm run build` (Railway runs `npm ci` automatically)

#### **Start Command**
- **Set to:** `npm run start` or `npm run start -- -p $PORT` (ask cursor which one is right for the project)
- This is how Railway will run your Next.js server

#### **Builder**
- **Select:** `Nixpacks` (or the newer version Railpack since nixpacks will be deprecated soon)
- Railway's default builder that auto-detects Node.js projects

#### **Watch Paths**
- **Set to:** `/web/**`
- This ensures Railway ONLY redeploys the Web service when files in `/web` folder change
- Prevents unnecessary rebuilds when you update `/api` folder

---

## STEP 5: Generate Public Domain for API Service

Before the Web service can communicate with the API, expose the API service:

1. **Go back to your Railway project dashboard**
2. **Click on the `api` service**
3. **Go to "Settings" tab**
4. **Find "Networking" section**
5. **Click "Generate Domain"** or **"Add Public Domain"**
6. **A public URL will be generated** (e.g., `api-production-xxxx.up.railway.app`)
7. **Copy this domain** (you'll need it for the next step)

**⚠️ CRITICAL - CORS Configuration:**
- `WEB_RAILWAY_URL`  env var is REQUIRED to prevent CORS errors between frontend and API
- Use the copied to doamin as the value of WEB_RAILWAY_URL when you put id in the api service env variables.
- This allows your Web service to make requests to the API
- Without this, all API calls from the browser will be blocked by CORS policy
- Add this AFTER you generate the Web service public domain (Step 5)

---

## STEP 6: Add Environment Variables for Web Service

1. **Click on the `web` service**
2. **Go to "Variables" tab**
3. **Click "Add Variable"** or **"New Variable"**
4. **Add the following variables one by one:**

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[your-project].supabase.co` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Your Supabase anon/public key |
| `NEXT_PUBLIC_API_URL` | `https://api-production-xxxx.up.railway.app` | The API domain from Step 5 (with `https://`) |
| and any additional env var that are specific to your project and the application you are building

**Important Notes:**
- **Option 1 (Manual):** Use the full URL with `https://` prefix (e.g., `https://api-production-xxxx.up.railway.app`)
- **Option 2 (Dynamic - 2025):** Use `https://${{api.RAILWAY_PUBLIC_DOMAIN}}` to auto-reference the API service domain

5. **Save the variables**
6. **The Web service will automatically redeploy**

---

## STEP 7: Monitor Web Service Deployment

1. **Click on the `web` service**
2. **Go to "Deployments" tab**
3. **Watch the build process:**
   - Install dependencies (`npm ci`)
   - Build Next.js (`npm run build`)
   - Start server (`npm run start`)

**Expected Success Message:**
```
✓ Ready in 421ms
```

---

## STEP 8: Generate Public Domain for Web Service

Once the Web service is deployed successfully:

1. **Click on the `web` service**
2. **Go to "Settings" tab**
3. **Find "Networking" section**
4. **Click "Generate Domain"** or **"Add Public Domain"**
5. **Copy the generated URL** (e.g., `https://web-production-xxxx.up.railway.app`)

---

## 🎉 SUCCESS!

Your application is now live with:
- ✅ **API Service:** Running at `https://api-production-xxxx.up.railway.app`
- ✅ **Web Service:** Running at `https://web-production-xxxx.up.railway.app`
- ✅ **Communication:** Web → API via environment variable

**Visit your Web URL to see your application!**

---

## STEP 5: Configure Service Networking

*(To be continued as we progress...)*

---

## Troubleshooting

### Web Service Build Error (EBUSY: resource busy or locked)
**Error:** `npm error EBUSY: resource busy or locked, rmdir '/app/node_modules/.cache'`

**Cause:** The Build Command is running `npm ci` twice - once automatically by Railway, and once in the custom build command, causing a cache directory conflict.

**Fix:**
1. Go to `web` service Settings
2. Find "Build Command"
3. Change from `npm ci && npm run build` to just `npm run build`
4. Railway already runs `npm ci` automatically in the install step
5. Save and redeploy

### Module Import Error (No module named 'api')
**Error:** `ModuleNotFoundError: No module named 'api'` when importing from `api.services` or `api.adapters`

**Cause:** Railway's Root Directory is set to `api/`, so Python's working directory is `/app`. Imports should be relative to this directory, not prefixed with `api.`.

**Fix:**
1. Change imports in `api/main.py`:
   - FROM: `from api.services.chunking import ...`
   - TO: `from services.chunking import ...`
2. Push changes: `git push origin main`
3. Railway will automatically redeploy

### Missing Module at Runtime
**Error:** `ModuleNotFoundError: No module named 'requests'` (or any other module)

**Cause:** Your code imports a module that's not listed in `api/requirements.txt`.

**Fix:**
1. Add the missing module to `api/requirements.txt`
2. Example: `requests==2.31.0`
3. Push changes: `git push origin main`
4. Railway will automatically redeploy

### Python 3.13 Compatibility (Pydantic Build Error)
**Error:** `TypeError: ForwardRef._evaluate() missing 1 required keyword-only argument: 'recursive_guard'`

**Cause:** Railway uses Python 3.13 by default, but older versions of Pydantic (< 2.10) don't support it.

**Fix:**
1. Update `api/requirements.txt`:
   - Change `pydantic==2.5.3` to `pydantic==2.10.0`
   - Change `fastapi==0.109.0` to `fastapi==0.115.0`
2. Push changes: `git push origin main`
3. Railway will automatically redeploy

### Dependency Conflict (httpx)
**Error:** `Cannot install -r requirements.txt... because these package versions have conflicting dependencies`

**Cause:** `supabase 2.3.0` requires `httpx 0.24.x`, but you may have a newer version specified.

**Fix:**
1. Update `api/requirements.txt`
2. Change `httpx==0.26.0` to `httpx==0.24.1`
3. Push changes: `git push origin main`
4. Railway will automatically redeploy

### Build Fails
- Check logs in the "Deployments" tab
- Verify `requirements.txt` exists in `/api` folder
- Verify `package.json` exists in `/web` folder

### Service Won't Start
- Check "Start Command" is correct
- Verify environment variables are set
- Check logs for errors

---

**Last Updated:** 2025-11-05
**Status:** In Progress (Completed through Step 3)

