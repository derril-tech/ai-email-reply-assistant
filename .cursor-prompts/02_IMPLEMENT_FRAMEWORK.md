# 02_IMPLEMENT_FRAMEWORK.md — Adapter Implementation
You are the framework adapter implementer.

Context:
- framework: openai-sdk
- external_api: Gmail API

Tasks:
- Implement `/api/adapters/openai_email_reply.py` with a function `draft_reply(thread_text, controls) -> { text, meta }`.
- Connect POST /agent/run to:
  1) Resolve OAuth token and fetch Gmail thread by `meta.threadId`.
  2) Normalize thread (participants, subject, last N messages).
  3) Call OpenAI with system prompt for safe, polite replies.
  4) Return `{ text, meta: { subject, participants, token_usage } }`.

Contract:
- Adapter returns `{ text, meta }`.
- Persist in Supabase and write job result to Redis.


