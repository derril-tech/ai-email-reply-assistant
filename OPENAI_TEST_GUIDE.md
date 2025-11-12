# 🧪 OpenAI Integration Test Guide

**Goal:** Test real GPT-4.1-mini draft generation in the Playground

---

## ⚠️ Prerequisites

Before testing, ensure these are set in Railway:

### **API Service Environment Variables:**
```bash
OPENAI_API_KEY=sk-...your_key_here  # ✅ You said this is already set
```

### **Web Service Environment Variables:**
```bash
NEXT_PUBLIC_API_URL=https://api-production-[your-domain].up.railway.app
```

**Important:** The web app needs to know where the API is!

---

## 🔍 Step 1: Find Your API URL

1. Go to Railway dashboard
2. Click on **API service**
3. Go to **Settings** tab
4. Copy the **Public Domain** (e.g., `api-production-abc123.up.railway.app`)
5. Your API URL is: `https://[that-domain]`

---

## 🔧 Step 2: Configure Web Service

1. In Railway, click on **Web service**
2. Go to **Variables** tab
3. Add or update:
   ```
   NEXT_PUBLIC_API_URL=https://api-production-[your-domain].up.railway.app
   ```
4. Click **Deploy** to restart with new env var

**Note:** Without this, the Playground can't reach the API!

---

## 🧪 Step 3: Test the Integration

### **Option A: Test via Playground UI** (Visual)

1. **Open Playground:**
   https://web-production-5e03f.up.railway.app/playground

2. **Click "Select a Thread"**
   - You should see the thread picker view

3. **For now, click "Start Over" to test with mock data**
   - Since Gmail OAuth isn't wired yet, we'll test with stubbed thread text

4. **Alternatively, test via API directly** (see Option B)

---

### **Option B: Test via API Directly** (Recommended for Now)

Since the Playground needs a thread picker with real Gmail data, let's test the API directly:

#### **1. Test Health Check:**
```bash
curl https://api-production-[your-domain].up.railway.app/jobs/health
```

**Expected:**
```json
{"status":"ok"}
```

#### **2. Generate a Draft:**
```bash
curl -X POST "https://api-production-[your-domain].up.railway.app/agent/run" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "test-project",
    "input": "Please draft a professional reply",
    "meta": {
      "threadId": "thread_demo_001",
      "tone": "professional",
      "length": 120,
      "bullets": false
    }
  }'
```

**Expected Response:**
```json
{
  "jobId": "some-uuid-here"
}
```

#### **3. Poll for Result:**
```bash
curl "https://api-production-[your-domain].up.railway.app/jobs/[jobId-from-step-2]"
```

**Expected Response (with REAL OpenAI draft):**
```json
{
  "status": "done",
  "result": {
    "text": "Hi,\n\nThank you for reaching out. I appreciate you taking the time to share your thoughts...\n\nBest regards,",
    "meta": {
      "threadId": "thread_demo_001",
      "tone": "professional",
      "subject": null,
      "participants": null,
      "token_usage": {
        "prompt_tokens": 85,
        "completion_tokens": 67,
        "total_tokens": 152
      }
    },
    "projectId": "test-project",
    "input": "Please draft a professional reply"
  },
  "started_at": 1699999999.999
}
```

---

## ✅ Success Indicators

### **✅ OpenAI Integration is Working if:**

1. **Health check returns 200 OK**
2. **Draft text is NOT the old mock:**
   ```
   ❌ "Hey,\n\nThank you for the detailed update..."
   ```
3. **Draft text IS a real GPT response:**
   ```
   ✅ Contextual, intelligent, varies by request
   ```
4. **Token usage is present:**
   ```json
   "token_usage": {
     "prompt_tokens": 85,
     "completion_tokens": 67,
     "total_tokens": 152
   }
   ```

### **❌ Fallback to Mock if:**
- `OPENAI_API_KEY` is missing or invalid
- OpenAI API is unreachable
- API rate limit exceeded

In this case, you'll see the old mock draft (still functional, just not AI-powered).

---

## 🎯 Different Tones to Test

Try these different payloads to see GPT adapt:

### **1. Friendly Tone:**
```json
{
  "projectId": "test",
  "input": "Reply warmly",
  "meta": {
    "threadId": "t1",
    "tone": "friendly",
    "length": 100,
    "bullets": false
  }
}
```

**Expected:** Warm, conversational language

---

### **2. Formal Tone:**
```json
{
  "projectId": "test",
  "input": "Reply formally",
  "meta": {
    "threadId": "t2",
    "tone": "formal",
    "length": 150,
    "bullets": false
  }
}
```

**Expected:** Professional, businesslike language

---

### **3. Brief Tone:**
```json
{
  "projectId": "test",
  "input": "Keep it short",
  "meta": {
    "threadId": "t3",
    "tone": "brief",
    "length": 50,
    "bullets": false
  }
}
```

**Expected:** Concise, to-the-point reply

---

### **4. With Bullet Points:**
```json
{
  "projectId": "test",
  "input": "Organize with bullets",
  "meta": {
    "threadId": "t4",
    "tone": "professional",
    "length": 120,
    "bullets": true
  }
}
```

**Expected:** Reply includes bullet points

---

## 🐛 Troubleshooting

### **Problem: "text": "Hey,\n\nThank you for the detailed update..."**
**Cause:** Fallback mock is being used  
**Fix:**
1. Check `OPENAI_API_KEY` is set in Railway API service
2. Check Railway logs for errors: `OpenAI API error: ...`
3. Verify API key is valid at https://platform.openai.com/api-keys

---

### **Problem: API returns 500 error**
**Cause:** OpenAI API call failed  
**Fix:**
1. Check Railway API logs for detailed error
2. Verify model name is correct: `gpt-4.1-mini`
3. Check OpenAI API status: https://status.openai.com

---

### **Problem: "token_usage": null**
**Cause:** Fallback mock is being used  
**Fix:** Same as first problem above

---

### **Problem: Playground shows "Run failed"**
**Cause:** `NEXT_PUBLIC_API_URL` not set in web service  
**Fix:**
1. Add env var to Railway web service
2. Redeploy web service
3. Test again

---

## 📊 Cost Tracking

Monitor your OpenAI usage via token counts:

- **Typical draft:** ~150-250 tokens total
- **GPT-4.1-mini pricing:** Check OpenAI pricing page
- **Token usage returned in every response**

Example:
```json
"token_usage": {
  "prompt_tokens": 85,   // Your system prompt + thread text
  "completion_tokens": 67,  // Generated draft
  "total_tokens": 152    // Sum (what you're billed for)
}
```

---

## 🎉 Success Checklist

- [ ] Railway API service has `OPENAI_API_KEY` set
- [ ] Railway web service has `NEXT_PUBLIC_API_URL` set
- [ ] API health check returns 200 OK
- [ ] Draft generation returns real GPT text (not mock)
- [ ] Token usage is present in response
- [ ] Different tones produce different styles
- [ ] Bullet points work when enabled
- [ ] Length control approximately works

---

## 🚀 Next Steps After Successful Test

Once OpenAI integration is confirmed working:

1. **Wire Gmail OAuth** — Fetch real email threads
2. **Update Thread Picker** — Display actual Gmail threads in Playground
3. **Test Full Flow** — Real thread → Real AI draft → Copy to Gmail
4. **Monitor Costs** — Track token usage in analytics

---

**Ready to test?** Start with Option B (API directly) to confirm OpenAI is working, then we can wire up the Playground UI!

---

**Questions?**
- Need help finding your Railway API domain?
- Want to test a specific scenario?
- Hit an error?

Let me know and I'll help troubleshoot! 🔧

