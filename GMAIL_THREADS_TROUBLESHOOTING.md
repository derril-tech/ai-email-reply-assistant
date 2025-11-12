# Gmail Threads Troubleshooting Guide 🔍

## Issue: "No threads found" but Gmail inbox has emails

### Possible Causes & Solutions:

---

## 1. **Token Not Stored in Supabase** ❌

**Check:**
- Open Railway API service logs
- Look for: `🔍 Querying Supabase oauth_tokens table...`
- Check result: `📊 Supabase query result: 0 rows` ← Problem!

**Solution:**
You may need to **reconnect Gmail** to store the token:
1. Go to Playground
2. Click "Connect Gmail" again
3. Go through OAuth flow
4. Check logs for: `✅ OAuth tokens stored in Supabase for project: default`

---

## 2. **Token Expired** ⏰

**Check Railway logs for:**
```
⏰ Token expires: 2025-01-12 10:00:00, Now: 2025-01-12 11:00:00
❌ Token expired for project default
```

**Solution:**
Reconnect Gmail to get a fresh token (automatic refresh coming soon!)

---

## 3. **Wrong Gmail Label** 🏷️

**Check Railway logs for:**
```
🏷️  Fetching threads from label: INBOX
📬 Found 0 threads
```

Gmail might have emails in different labels (like "All Mail", "Important", etc.)

**Solution:**
Update Railway API environment variable:
```
GMAIL_LABEL_WHITELIST=INBOX,UNREAD,IMPORTANT,CATEGORY_PERSONAL
```

Then try fetching from different labels.

---

## 4. **OAuth Scopes Issue** 🔐

**Check if you granted the right permissions:**

Required scopes:
- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/gmail.metadata`

**Solution:**
1. Disconnect Gmail in Google Account settings: https://myaccount.google.com/permissions
2. Reconnect in Playground with fresh permissions

---

## 5. **Supabase Connection Issue** 🗄️

**Check Railway logs for:**
```
❌ Supabase not available for token lookup
```

**Solution:**
Verify Railway API service has these env vars set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE`

---

## 6. **Gmail API Not Enabled** 🚫

**Check Railway logs for:**
```
Gmail API error: <HttpError 403 ...>
```

**Solution:**
1. Go to Google Cloud Console
2. Navigate to "APIs & Services" → "Library"
3. Search for "Gmail API"
4. Make sure it's **ENABLED**

---

## 📊 How to Read Railway Logs

### What You Should See (Success):
```
🔑 resolve_oauth_token called for project: default
🔍 Querying Supabase oauth_tokens table...
📊 Supabase query result: 1 rows
✅ Token found, created: 2025-01-12T08:30:00
⏰ Token expires: 2025-01-12T09:30:00, Now: 2025-01-12T08:45:00
✅ Token still valid (0.8 hours remaining)
✅ Access token found (length: 150)

🔍 list_threads called for project: default
🏷️  Fetching threads from label: INBOX
📧 Gmail API response: dict_keys(['threads', 'resultSizeEstimate'])
📬 Found 5 threads
📨 Fetching thread 1/5: abc123def456
✉️  Thread: 'Meeting Reminder' from noreply@calendar.google.com
📨 Fetching thread 2/5: xyz789uvw012
✉️  Thread: 'Invoice #12345' from billing@company.com
...
✅ Returning 5 threads
```

### What Indicates Problems:
- `❌ No access token for project default`
- `📊 Supabase query result: 0 rows`
- `❌ Token expired for project default`
- `⚠️  No threads returned from Gmail API`
- `Gmail API error: <HttpError ...>`

---

## 🧪 Quick Test Steps

### Step 1: Check Railway API Logs
```
1. Go to Railway dashboard
2. Click "API" service
3. Click "Deployments" tab
4. Click latest deployment
5. Look at logs (real-time)
```

### Step 2: Test Thread Fetch Manually
Open your browser console on Playground and run:
```javascript
fetch('https://api-production-192f.up.railway.app/threads?projectId=default')
  .then(r => r.json())
  .then(console.log)
```

You should see:
```json
{
  "items": [
    {
      "id": "abc123",
      "subject": "Your email subject",
      "from": "sender@example.com",
      "date": "Mon, 12 Jan 2025 08:30:00 +0000",
      "snippet": "Email preview text..."
    }
  ]
}
```

### Step 3: Check Supabase Directly
```
1. Go to Supabase dashboard
2. Navigate to "Table Editor"
3. Select schema: "emailreply"
4. Open table: "oauth_tokens"
5. Check if there's a row with:
   - project_id = "default"
   - provider = "google"
   - access_token = (some long string)
```

If no row exists → **You need to reconnect Gmail!**

---

## 🚀 Most Common Fix

**99% of the time, this works:**

1. **Go to Playground**
2. **Disconnect Gmail** (if button exists)
3. **Click "Connect Gmail"**
4. **Sign in with cashcrumbs@gmail.com**
5. **Grant all permissions**
6. **Wait for redirect back to Playground**
7. **You should see success toast**
8. **Threads should auto-load**

---

## 📞 If Still Not Working

**Share Railway API logs with these emojis:**
- 🔑 (Token resolution)
- 🔍 (Supabase query)
- 📊 (Query results)
- 🏷️ (Label selection)
- 📬 (Thread count)
- ❌ (Any errors)

This will help diagnose the exact issue!

---

**Updated:** 2025-01-12  
**Next Deploy:** Railway should redeploy with debug logs in ~2-3 minutes

