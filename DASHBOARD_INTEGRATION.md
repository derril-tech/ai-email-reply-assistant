# Dashboard Integration - Complete Guide

**Date:** 2025-11-13  
**Version:** v1.7.0  
**Status:** ✅ Ready to Deploy

---

## 🎯 What Was Done

The Dashboard has been **fully wired to real backend data** from Supabase! No more hardcoded placeholder values.

---

## 📋 REQUIRED MIGRATION

You need to run **ONE SQL migration** in your Supabase SQL Editor:

### **File:** `db/011-dashboard-stats-and-messages.sql`

**Instructions:**
1. Go to your Supabase Dashboard → SQL Editor
2. Copy the entire contents of `db/011-dashboard-stats-and-messages.sql`
3. Paste and click "Run"
4. Verify success (no errors)

**What it does:**
- ✅ Creates RPC function `get_dashboard_stats()` - Returns stats (replies count, success rate, time saved)
- ✅ Creates RPC function `get_recent_drafts()` - Returns last 10 drafts
- ✅ Creates RPC function `get_draft_by_id()` - Fetches specific draft
- ✅ Adds `draft_metadata` column to `messages` table
- ✅ Grants permissions to `service_role`, `anon`, `authenticated`

---

## 🚀 New Features

### **Dashboard Now Shows:**

| Metric | Description | Calculation |
|--------|-------------|-------------|
| **Replies Generated** | Total AI drafts created | Count of `messages` with `role='assistant'` |
| **Time Saved** | Estimated time saved | Replies × 5 minutes each |
| **Success Rate** | Job success percentage | `done` jobs / total jobs × 100 |
| **Active Projects** | Number of projects | Currently hardcoded to 1 (future: multi-project) |

### **Recent Drafts Section:**
- Shows last 5 drafts with:
  - Subject
  - Timestamp
  - Snippet (first 100 chars)
  - Clickable to view in Playground

### **Loading States:**
- Spinner while fetching data
- Error state with retry button
- Empty state when no drafts exist

---

## 🔧 Backend Changes

### **New Endpoints:**

```
GET /dashboard/stats?projectId=default
→ Returns: { repliesGenerated, successRate, avgDraftLength, timeSavedMinutes, activeProjects }

GET /dashboard/recent-drafts?projectId=default&limit=5
→ Returns: { items: [ { id, subject, snippet, threadId, tone, createdAt } ] }

GET /drafts/:draft_id
→ Returns: { id, subject, content, threadId, tone, length, bullets, createdAt }
```

### **Message Persistence:**
- Every generated draft is now **automatically saved** to `emailreply.messages` table
- Includes metadata: `threadId`, `tone`, `length`, `bullets`, `subject`, `projectId`

---

## 💻 Frontend Changes

### **New Hook:** `web/hooks/useDashboard.ts`
- Fetches stats and recent drafts on mount
- Auto-refreshes on projectId change
- Handles loading, error, and empty states

### **Updated:** `web/app/dashboard/page.tsx`
- Now a **client component** (`'use client'`)
- Uses `useDashboard()` hook
- Shows real data instead of placeholders
- Clickable drafts navigate to Playground
- Loading spinner and error handling

---

## 📊 How Data Flows

```
1. User generates draft in Playground
   ↓
2. API calls openai_email_reply.draft_reply()
   ↓
3. API calls persistence.persist_message_to_supabase()
   ↓
4. Message saved to emailreply.messages table with metadata
   ↓
5. Dashboard fetches via RPC functions
   ↓
6. Frontend displays real stats!
```

---

## 🧪 Testing Checklist

After running the migration:

1. ✅ **Generate a draft** in Playground
2. ✅ **Navigate to Dashboard** (`/dashboard`)
3. ✅ **Verify "Replies Generated"** increments
4. ✅ **Check "Recent Drafts"** shows your draft
5. ✅ **Click on a draft** → navigates to Playground with that thread
6. ✅ **Check "Time Saved"** updates (replies × 5 min)
7. ✅ **Verify "Success Rate"** is 100% (if no errors)

---

## 🐛 Troubleshooting

### **"No drafts yet" even after generating:**
- Check Supabase logs → Messages table
- Verify `persist_message_to_supabase()` is being called (check API logs)
- Ensure `SUPABASE_SERVICE_ROLE` env var is set in API

### **"Failed to fetch dashboard stats":**
- Verify migration ran successfully
- Check RPC functions exist in Supabase → Database → Functions
- Ensure `service_role` has EXECUTE permissions

### **Dashboard shows 0 for everything:**
- Run a draft generation first
- Check that `emailreply.messages` table has rows
- Verify `role='assistant'` in saved messages

---

## 📈 Next Steps

Future enhancements:
- Add date range filter ("Last 7 days", "Last 30 days")
- Add charts/graphs for trend visualization
- Multi-project support (switch between projects)
- Export drafts to CSV
- Draft revision history

---

## 🎉 Summary

**Before:** Dashboard showed fake hardcoded data  
**After:** Dashboard shows real usage stats from Supabase!

The dashboard is now a **living, breathing analytics panel** that tracks every draft you generate. 🚀

---

**Deployment Status:**
- ✅ Code pushed to GitHub
- ⏳ Run migration in Supabase (YOU DO THIS)
- ⏳ Railway will auto-deploy API
- ✅ Frontend will auto-deploy on Railway

**After migration:** Fully functional dashboard with real data! 📊✨

