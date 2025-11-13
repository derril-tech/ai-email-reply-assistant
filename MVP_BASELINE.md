# MVP Baseline - AI Email Reply Assistant

**Git Commit Hash:** `41152fb`  
**Date:** 2025-11-13  
**Status:** ✅ Stable MVP Version

## Purpose
This document marks the stable MVP version of the AI Email Reply Assistant. If any future enhancements cause issues, revert to this commit:

```bash
git checkout 41152fb
```

## Core Features Implemented

### 1. Gmail OAuth Integration ✅
- Google OAuth 2.0 flow for Gmail access
- Token storage in Supabase (`emailreply.oauth_tokens`)
- Automatic token expiry management (timezone-aware UTC)
- Scopes: `gmail.readonly`, `gmail.send`, `gmail.metadata`

### 2. Thread Listing ✅
- Fetch Gmail threads via Gmail API
- Display thread subject, sender, date, and snippet
- Filter by `INBOX` label (configurable via `GMAIL_LABEL_WHITELIST`)
- Real-time thread refresh

### 3. AI Draft Generation ✅
- OpenAI GPT-4.1-mini integration
- Dynamic system prompts based on user controls:
  - **Tone**: Friendly, Formal, Brief
  - **Length**: 50-500 words (slider)
  - **Bullets**: Toggle for bullet-point format
- Context-aware replies based on full thread content

### 4. Modern UI/UX ✅
- Dark mode by default
- Framer Motion animations
- shadcn/ui components
- Responsive design (mobile + desktop)
- Loading states with custom `LoaderDots` component
- Toast notifications for success/error feedback

### 5. Backend Architecture ✅
- **API**: FastAPI (Python 3.11+)
- **Adapter Pattern**: `openai_email_reply.py` for draft generation
- **Services**: Gmail API, Supabase, persistence layer
- **Job Queue**: In-memory job status (`/agent/run` → poll `/jobs/{id}`)

### 6. Database & Persistence ✅
- **Supabase**: PostgreSQL with `emailreply` schema
- **Tables**: 
  - `oauth_tokens` - OAuth token storage with RPC fallbacks
  - Schema exposed via PostgREST with custom configuration
- **Migrations**: 10+ SQL files in `/db` folder

### 7. Deployment ✅
- **Frontend**: Railway (Next.js 15.1, React 19)
- **Backend**: Railway (FastAPI + Uvicorn)
- **Environment Variables**: All secrets in Railway env vars
- **CORS**: Configured for Railway + local dev

## Tech Stack

### Frontend
- Next.js 15.1 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- React Hot Toast

### Backend
- FastAPI 0.115.0
- Python 3.11+
- OpenAI SDK 1.0.0+
- Google API Client
- Supabase Python Client

### Infrastructure
- Railway (Web + API services)
- Supabase (PostgreSQL + PostgREST)
- Upstash Redis (optional, for future caching)

## Known Limitations (To Address in Enhancements)
1. Gmail API sometimes returns 403 errors with `gmail.metadata` scope conflicts
2. No thread search or filtering beyond INBOX
3. No draft editing or saving
4. No email sending functionality (despite having `gmail.send` scope)
5. No conversation history or context retention
6. Single project/user support (default project ID)

## Environment Variables Required

### API Service
```
OPENAI_API_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_OAUTH_REDIRECT_URI
SUPABASE_URL
SUPABASE_SERVICE_ROLE
SUPABASE_SCHEMA=emailreply
REDIS_PREFIX=emailreply
RAILWAY_PUBLIC_DOMAIN
WEB_RAILWAY_URL
```

### Web Service
```
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Revert Instructions

If enhancements break the app:

```bash
# 1. Revert to MVP baseline
git revert HEAD~n  # or specific commit
# OR
git reset --hard 41152fb

# 2. Force push (careful!)
git push origin main --force

# 3. Redeploy on Railway
# Railway will auto-detect the push and redeploy
```

## Testing Checklist for MVP

- [x] Gmail OAuth connection works
- [x] Threads load from Gmail inbox
- [x] Thread selection updates UI state
- [x] Draft generation with OpenAI completes successfully
- [x] Tone/Length/Bullets controls affect output
- [x] Loading states display properly
- [x] Error toasts show on failures
- [x] Dark mode is default
- [x] Responsive on mobile and desktop
- [x] OAuth tokens persist in Supabase
- [x] Token expiry checks work (timezone-aware)

---

**Last Updated:** 2025-11-13  
**Maintained By:** Cursor AI + Derril Filemon

