# Vercel to Railway Redirect Guide

## Overview

This guide shows how to redirect all traffic from a Vercel deployment to a Railway web service. This is useful when:
- You want to use Vercel's domain/DNS but host on Railway
- You need a simple redirect from Vercel's auto-generated URLs to your Railway service
- You want to leverage Vercel's global CDN for redirects while keeping your app on Railway

## Prerequisites

- A Railway web service deployed and accessible
- A Vercel project connected to your GitHub repository
- Railway web service URL (e.g., `https://web-production-xxxxx.up.railway.app/`)

---

## Implementation Steps

### 1. Create/Update `vercel.json` in Project Root

For **monorepo projects** (where your Next.js app is in a subdirectory like `web/`):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd web && npm run build",
  "outputDirectory": "web/.next",
  "installCommand": "cd web && npm install",
  "framework": "nextjs",
  "redirects": [
    {
      "source": "/:path*",
      "destination": "https://your-railway-service.up.railway.app/:path*",
      "permanent": false
    }
  ]
}
```

For **single-directory projects** (where Next.js app is at root):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "redirects": [
    {
      "source": "/:path*",
      "destination": "https://your-railway-service.up.railway.app/:path*",
      "permanent": false
    }
  ]
}
```

### 2. (Optional) Add `vercel.json` in Web Subdirectory

If you have a `web/` directory, you can also add a `vercel.json` there:

**`web/vercel.json`:**
```json
{
  "redirects": [
    {
      "source": "/:path*",
      "destination": "https://your-railway-service.up.railway.app/:path*",
      "permanent": false
    }
  ]
}
```

### 3. Replace Railway URL

Replace `https://your-railway-service.up.railway.app` with your actual Railway web service URL.

You can find this in:
- Railway Dashboard → Your Project → Web Service → Settings → Domains

### 4. Commit and Push

```bash
git add vercel.json
# If you have web/vercel.json:
git add web/vercel.json

git commit -m "feat: add Vercel to Railway redirect"
git push
```

### 5. Verify Deployment

1. Check GitHub Actions/Checks - Vercel deployment should show ✅ green/passing
2. Visit your Vercel URL - it should automatically redirect to your Railway service
3. Test with a specific path (e.g., `/dashboard`) - the full path should be preserved

---

## Configuration Options

### Redirect Type

**Temporary Redirect (307)** - Recommended for testing:
```json
{
  "source": "/:path*",
  "destination": "https://your-railway-service.up.railway.app/:path*",
  "permanent": false
}
```

**Permanent Redirect (308)** - Use when redirect is final:
```json
{
  "source": "/:path*",
  "destination": "https://your-railway-service.up.railway.app/:path*",
  "permanent": true
}
```

### Path Matching

**Wildcard (all paths):**
```json
"source": "/:path*"
```

**Specific paths only:**
```json
{
  "redirects": [
    {
      "source": "/app/:path*",
      "destination": "https://your-railway-service.up.railway.app/app/:path*",
      "permanent": false
    },
    {
      "source": "/api/:path*",
      "destination": "https://your-railway-service.up.railway.app/api/:path*",
      "permanent": false
    }
  ]
}
```

---

## Common Issues & Troubleshooting

### ❌ Issue: Vercel Deployment Fails with "redirects" Error

**Problem:** Using both `permanent` and `statusCode` properties together.

**Bad Configuration:**
```json
{
  "source": "/:path*",
  "destination": "https://...",
  "permanent": false,
  "statusCode": 302  // ❌ REMOVE THIS
}
```

**Fixed Configuration:**
```json
{
  "source": "/:path*",
  "destination": "https://...",
  "permanent": false  // ✅ Only use permanent OR statusCode, not both
}
```

### ❌ Issue: Railway Service Not Deploying

**Problem:** Railway only deploys when watched paths are modified.

**Solution:** 
- `vercel.json` changes at the root won't trigger Railway API redeployments
- Only changes in `web/**` trigger web service deploys
- Only changes in `api/**` trigger API service deploys
- This is **correct behavior** - Railway shouldn't redeploy when you're only configuring Vercel

### ❌ Issue: Redirect Loop

**Problem:** Railway service is also redirecting back to Vercel.

**Solution:** 
- Remove any redirect logic from your Railway service that points back to Vercel
- Ensure Railway serves your app directly without redirects

### ❌ Issue: Vercel Builds the App Instead of Redirecting

**Problem:** Vercel still tries to build your Next.js app.

**Solution:** 
- The redirect happens at the CDN level, so Vercel may still build the app
- To prevent builds, you can use a Vercel "Ignored Build Step" script (see Vercel docs)
- Or simply let it build (it's fast and free on Hobby plan)

---

## How It Works

1. **User visits Vercel URL** (e.g., `https://your-app.vercel.app/dashboard`)
2. **Vercel CDN intercepts** the request at the edge
3. **Redirect rule matches** `/:path*` pattern
4. **Vercel sends 307 redirect** to `https://your-railway-service.up.railway.app/dashboard`
5. **Browser follows redirect** to Railway
6. **Railway serves the actual app**

This happens globally at Vercel's edge network, so it's extremely fast.

---

## Official Documentation

For more advanced redirect configurations, see the official Vercel documentation:

**📚 [Vercel Redirects Configuration](https://vercel.com/docs/project-configuration#redirects)**

Topics covered:
- Conditional redirects (based on headers, cookies, query params)
- Wildcard pattern matching
- Regex-based redirects
- Redirect priorities and ordering
- Domain-based redirects

---

## Example: Our AI Email Reply Assistant Setup

**Project Structure:**
```
ai-email-reply-assistant/
├── api/           # FastAPI backend (Railway API service)
├── web/           # Next.js frontend (Railway Web service)
├── db/            # Supabase migrations
├── vercel.json    # Root config (monorepo + redirect)
└── web/vercel.json # Web-specific redirect
```

**Root `vercel.json`:**
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd web && npm run build",
  "outputDirectory": "web/.next",
  "installCommand": "cd web && npm install",
  "framework": "nextjs",
  "redirects": [
    {
      "source": "/:path*",
      "destination": "https://web-production-5e03f.up.railway.app/:path*",
      "permanent": false
    }
  ]
}
```

**Result:**
- Vercel URL: `https://ai-email-reply-assistant.vercel.app` → Redirects to Railway
- Railway URL: `https://web-production-5e03f.up.railway.app` → Serves the actual app
- All paths preserved: `/playground` → `/playground`, `/dashboard` → `/dashboard`

---

## Alternative: Vercel Domain with Railway Backend

If you want to use a **custom domain on Vercel** but host on Railway:

1. Add your custom domain to Vercel (e.g., `app.yourdomain.com`)
2. Use the same redirect configuration above
3. Vercel will handle SSL/DNS for your custom domain
4. All traffic redirects to Railway

This gives you:
- ✅ Easy domain management via Vercel
- ✅ Automatic SSL from Vercel
- ✅ Global CDN redirect performance
- ✅ App hosted on Railway with full control

---

## Summary Checklist

- [ ] Get Railway web service URL
- [ ] Create/update `vercel.json` with redirect configuration
- [ ] Use **either** `permanent: true/false` **OR** `statusCode`, not both
- [ ] Replace Railway URL placeholder with actual URL
- [ ] Commit and push to trigger Vercel deployment
- [ ] Verify GitHub checks show Vercel deployment passing
- [ ] Test redirect by visiting Vercel URL
- [ ] Test that paths are preserved (e.g., `/dashboard` → `/dashboard`)

---

**✅ You're done!** Your Vercel deployment now redirects all traffic to Railway.

---

## Credits

- **Vercel Redirects Documentation:** https://vercel.com/docs/project-configuration#redirects
- **Railway Deployment Guide:** https://docs.railway.app/
- **Created for:** AI Email Reply Assistant (Nov 2025)
