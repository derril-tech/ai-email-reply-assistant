---
project_name: "AI-EMAIL-REPLY-ASSISTANT"
framework: "openai-sdk"
external_api: "Gmail API"
supabase_schema: "emailreply"
redis_prefix: "emailreply"
repo_routes: ["/", "/dashboard", "/playground"]
api_endpoints: ["POST /agent/run", "GET /jobs/{id}", "GET /messages?projectId"]
env_keys: [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "OPENAI_API_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "SUPABASE_SERVICE_ROLE",
  "SUPABASE_SCHEMA",
  "REDIS_PREFIX",
  "RAILWAY_PUBLIC_DOMAIN",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_OAUTH_REDIRECT_URI",
  "GOOGLE_PROJECT_ID",
  "GMAIL_LABEL_WHITELIST" # optional CSV of label names to sync (e.g., INBOX,IMPORTANT)
]
---

## One-liner
Draft polite, context-aware email replies from entire Gmail threads with one click.

## User Stories
- As a user, I can connect my Gmail account via OAuth and grant read/send permissions (scopes limited to threads I select).
- As a user, I can pick a Gmail thread and get a suggested reply that matches tone, thread context, and sender relationship.
- As a user, I can choose tone (friendly/formal/brief) and constraints (max length, bullets, ask for meeting).
- As a user, I can insert smart snippets (thanks, confirm, follow-up) and regenerate variants.
- As a user, I can copy the draft or send it via Gmail (optional in MVP; default to “copy”).
- As a user, I can view my recent generations and thread metadata in the dashboard.

## Success Criteria (MVP)
- End-to-end: select thread → `/agent/run` → `/jobs/{id}` → reply draft visible in UI.
- Messages and job metadata saved in Supabase under `emailreply` schema.
- Round-trip for typical thread (<20 messages) under ~4s (cached thread text).
- OAuth tokens stored securely (refreshable) server-side; scopes restricted.


