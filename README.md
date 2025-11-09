# AI-EMAIL-REPLY-ASSISTANT
Draft safe, polite Gmail replies with AI. FastAPI backend + Next.js Playground UI.


## Demo (placeholders)
- Live App: https://<your-domain>/
- API Base: https://<your-api-domain>/
- Screenshots: see `docs/screenshots/` (not committed)


## Features
- Connect Gmail (server-side OAuth; tokens never exposed to client)
- Pick a Gmail thread and view participants/last messages
- Generate a polite reply with controls for tone, length, and bullets
- History: see previous drafts (stub)
- Caching: Redis cache for normalized threads (TTL 300s)
- Safe prompts enforcing tone and PII minimization (adapter stubbed)


## Tech Stack
- Backend: FastAPI (Python 3.11+)
- Frontend: Next.js 15 (React 19, App Router), Tailwind, shadcn/ui (optional)
- DB: Supabase (`emailreply` schema)
- Cache/Queue: Upstash Redis (`emailreply` prefix)
- Hosting: Railway (two services: `api` and `web`)


## Getting Started
1) Clone and set envs from `.env.example`

2) Backend (FastAPI):
- Install deps (example): `pip install fastapi uvicorn pydantic`
- Dev run: `uvicorn api.main:app --reload --port 8000`

3) Frontend (Next.js):
- Ensure Node.js 18+
- Create `web/package.json` and install: `npm i next react react-dom tailwindcss autoprefixer framer-motion react-hot-toast next-themes`
- Dev run: `npm run dev -- -p 3000` from `web/` once configured

Open Playground at `/playground`.


## Environment Variables
| Name | Required | Notes |
|------|----------|-------|
| NEXT_PUBLIC_SUPABASE_URL | web | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | web | Supabase anon key |
| OPENAI_API_KEY | api | OpenAI access key |
| UPSTASH_REDIS_REST_URL | api | Upstash REST endpoint |
| UPSTASH_REDIS_REST_TOKEN | api | Upstash REST token |
| SUPABASE_SERVICE_ROLE | api | Service role for writes |
| SUPABASE_SCHEMA | both | defaults to `emailreply` |
| REDIS_PREFIX | both | defaults to `emailreply` |
| RAILWAY_PUBLIC_DOMAIN | api | used for CORS + OAuth redirect |
| GOOGLE_CLIENT_ID | api | Gmail OAuth client ID |
| GOOGLE_CLIENT_SECRET | api | Gmail OAuth secret |
| GOOGLE_OAUTH_REDIRECT_URI | api | `https://<RAILWAY_PUBLIC_DOMAIN>/oauth/callback` |
| GOOGLE_PROJECT_ID | api | GCP project id |
| GMAIL_LABEL_WHITELIST | api | optional CSV labels to include |

See `.env.example` for placeholders/defaults.


## API
Base URL: `http://localhost:8000` (dev) or Railway API URL.

- POST `/agent/run`
  - Body:
    ```json
    {
      "projectId": "default",
      "input": "please confirm Tuesday 3pm",
      "meta": { "threadId": "t123", "tone": "friendly", "length": 150, "bullets": false }
    }
    ```
  - Response:
    ```json
    { "jobId": "uuid" }
    ```

- GET `/jobs/{id}`
  - Response:
    ```json
    {
      "status": "done",
      "result": {
        "text": "Hi ... Best regards,",
        "meta": { "threadId": "t123", "subject": null, "participants": [], "token_usage": null },
        "projectId": "default",
        "input": "please confirm Tuesday 3pm"
      }
    }
    ```

- GET `/messages?projectId=default`
  - Response: `{ "items": [] }`


## Deploy (Railway)
This repo includes a `railway.toml` with two services:
- `api`: FastAPI, starts with uvicorn
- `web`: Next.js (expects Node project in `web/`)

Checklist:
- Both services boot with envs set
- OAuth redirect configured to `RAILWAY_PUBLIC_DOMAIN`
- CORS enabled for `https://<RAILWAY_PUBLIC_DOMAIN>` and localhost

Steps:
1. Create a Railway project and connect this repo.
2. Add two services using `railway.toml` detection.
3. Set environment variables for each service.
4. Ensure `RAILWAY_PUBLIC_DOMAIN` is set (or service domain) for CORS and OAuth.
5. Deploy.


## Notes & Limitations
- OAuth tokens are server-side only; never exposed to the client.
- Minimal OAuth scopes recommended (`gmail.readonly`; `gmail.send` if sending).
- Thread cache stored in Redis under `emailreply:cache:thread:{threadId}`, TTL 300s.
- Adapter is stubbed; integrate OpenAI calls and proper Supabase writes for production.


## Screenshots
Add screenshots (PNG/JPG) to `docs/screenshots/` locally. Do not commit binaries. A `.gitkeep` placeholder is included.


