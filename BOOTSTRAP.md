> Base environment, stubs, and Cursor configs for AI-EMAIL-REPLY-ASSISTANT.

### `.env.example`
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SUPABASE_SERVICE_ROLE=
SUPABASE_SCHEMA=emailreply
REDIS_PREFIX=emailreply
RAILWAY_PUBLIC_DOMAIN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=
GOOGLE_PROJECT_ID=
# Optional filter for visible labels in picker (comma-separated, default shows INBOX)
GMAIL_LABEL_WHITELIST=INBOX,IMPORTANT

### Notes
- Keep OAuth secrets server-only.
- Use Redis for short-lived caches (thread text, thread list).


