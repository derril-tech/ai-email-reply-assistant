# 03_EXTERNAL_API.md — Gmail Integration
Integrate Gmail API using server-side OAuth tokens.

Implement:
- `/api/services/gmail_client.py` with:
  - `get_thread(profile_id, thread_id, label_whitelist=None) -> NormalizedThread`
  - `send_message(profile_id, raw_mime) -> messageId` (optional)
- Cache normalized thread in Redis (key: `${REDIS_PREFIX}:cache:thread:{threadId}`, TTL 300s).
- Store thread index in `emailreply.gmail_threads` (subject, participants, snippet, updated_at).

Notes:
- Do NOT expose tokens to the client.
- Use minimal scopes; store `scopes` column in `oauth_tokens`.


