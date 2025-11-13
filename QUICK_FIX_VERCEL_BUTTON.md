# Quick Fix: "Connect Gmail" Button Not Responding on Vercel

**Problem:** Button works on Railway but does nothing on Vercel  
**Cause:** Missing CORS configuration on Railway API server

---

## 🚨 THE FIX (2 steps)

### **Step 1: Add to Vercel**

Go to Vercel → Your Project → Settings → Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://api-production-192f.up.railway.app
```

---

### **Step 2: Add to Railway API**

⚠️ **THIS IS THE CRITICAL STEP!**

Go to Railway → API Service → Variables → Add Variable

```bash
NEXT_PUBLIC_VERCEL_URL=https://your-app-name.vercel.app
```

Replace `your-app-name.vercel.app` with your actual Vercel deployment URL!

---

## 🔍 How to Find Your Vercel URL

1. Go to Vercel dashboard
2. Click on your project
3. Look at the "Domains" section
4. Copy the URL (e.g., `my-email-assistant.vercel.app`)
5. Add `https://` prefix: `https://my-email-assistant.vercel.app`

---

## ✅ Verification

After setting both variables:

1. **Vercel** will redeploy automatically (or click "Redeploy")
2. **Railway** will redeploy automatically after saving
3. Wait 2-3 minutes for both to finish
4. Test "Connect Gmail" button on Vercel URL
5. Open browser DevTools (F12) → Console
   - ✅ Should see: `fetch('https://api-production-192f.up.railway.app/auth/google?...')`
   - ❌ Should NOT see: CORS errors

---

## 🐛 Still Not Working?

Check browser console (F12) for errors:

### **Error 1: "NEXT_PUBLIC_API_URL is not defined"**
**Fix:** Set `NEXT_PUBLIC_API_URL` on Vercel and redeploy

### **Error 2: "CORS policy: No 'Access-Control-Allow-Origin' header"**
**Fix:** Set `NEXT_PUBLIC_VERCEL_URL` on Railway API and wait for redeploy

### **Error 3: "Failed to fetch"**
**Fix:** Check that Railway API service is running
- Go to Railway → API service → Deployments
- Should show "Active" status

---

## 📋 Quick Checklist

- [ ] `NEXT_PUBLIC_API_URL` set on **Vercel**
- [ ] `NEXT_PUBLIC_VERCEL_URL` set on **Railway API service**
- [ ] Both services redeployed after adding variables
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] No CORS errors in console

---

**That's it!** The button should now work on Vercel! 🎉

