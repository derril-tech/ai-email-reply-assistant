# Redirect Vercel to Railway Web Service

**Solution:** Use Vercel URL as a redirect to your working Railway web service!

---

## 🎯 METHOD 1: Vercel Redirect Configuration (Recommended)

Create a `vercel.json` file in your `web/` directory:

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "destination": "https://web-production-5e03f.up.railway.app/:path*",
      "permanent": false
    }
  ]
}
```

**What this does:**
- Any request to `your-app.vercel.app` → redirects to Railway web service
- Preserves all paths (e.g., `/playground` → Railway `/playground`)
- `permanent: false` = 302 redirect (temporary, can change later)

**To deploy:**
1. Create `web/vercel.json` with the content above
2. Git commit and push
3. Vercel will auto-redeploy
4. Done! ✅

---

## 🎯 METHOD 2: Next.js Redirect (Alternative)

If you prefer to handle redirects in Next.js, update `web/next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        destination: 'https://web-production-5e03f.up.railway.app/:path*',
        permanent: false,
        basePath: false,
      },
    ]
  },
}

export default nextConfig
```

---

## 🎯 METHOD 3: Domain Alias on Railway (Best for Custom Domain)

If you have a custom domain:

1. Go to Railway → Web Service → Settings → Domains
2. Add your custom domain (e.g., `yourdomain.com`)
3. Update DNS records as Railway instructs
4. Point Vercel domain to Railway using CNAME

**Benefits:**
- No redirect (direct connection)
- Faster (no hop)
- Custom domain on Railway

---

## ✅ RECOMMENDATION: Use Method 1 (vercel.json)

**Why:**
- Simple JSON file
- No code changes
- Easy to remove later
- Vercel handles it automatically

---

## 📄 Create the File Now:

I'll create `web/vercel.json` for you:

