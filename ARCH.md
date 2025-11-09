---
api_contract: ["POST /agent/run","GET /jobs/{id}","GET /messages?projectId"]
persistence: [
  "supabase: emailreply.profiles, emailreply.projects, emailreply.messages, emailreply.jobs, emailreply.oauth_tokens, emailreply.gmail_threads",
  "redis: emailreply:job:{id}, emailreply:rate:{bucket}, emailreply:cache:*"
]
observability: ["basic logging"]
---

## Backend
- **FastAPI (Python 3.11+)**
  - `POST /agent/run` → validates auth, fetches Gmail thread (cached), composes OpenAI prompt with thread summary + user controls (tone/length), returns `{ jobId }`.
  - Worker inline (simple) writes `{status,result}` to Redis; also persists request/response to Supabase.
  - `GET /jobs/{id}` → returns job status/result from Redis.
  - `GET /messages?projectId` → returns last 50 messages from Supabase.
- **Adapters**
  - **OpenAI SDK** (responses/chat) generates the draft with safety/system prompts.
  - **Gmail Client** fetches thread by ID, minimal fields; caches normalized text in Redis 60–300s.

## Frontend
- **Next.js 15.1 (React 19)** + Tailwind + shadcn/ui
- Routes: `/` (landing), `/dashboard` (recent runs), `/playground` (thread picker + draft UI)
- Hook: `useAgent(projectId)` posts to `/agent/run` and polls `/jobs/{id}`

## Data Model (Supabase, schema-qualified)
- `profiles(id, email, created_at)`
- `projects(id, owner, title, framework, external_api, created_at)`
- `messages(id, project_id, role, content, meta, created_at)` — stores user prompts + assistant drafts; `meta` holds `threadId`, `tone`, token usage, etc.
- `jobs(id, project_id, kind, status, payload, result, created_at, updated_at)` — captures runs and outputs.
- `oauth_tokens(id, profile_id, provider, access_token, refresh_token, expiry, scopes, created_at, updated_at)`
- `gmail_threads(id, profile_id, thread_id, snippet, participants, subject, normalized_text, updated_at)` — optional cache/index of threads.

## Security / Env
- All secrets via `.env`; never hardcode.
- Use `SUPABASE_SCHEMA=emailreply` and `REDIS_PREFIX=emailreply` for namespacing.
- Minimal OAuth scopes; store tokens server-side only.


