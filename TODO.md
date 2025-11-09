---
checklist_version: 1
---

## Immediate
- [ ] Copy `.env.example` → `.env` and fill keys.
- [ ] Set `SUPABASE_SCHEMA=emailreply` and `REDIS_PREFIX=emailreply`.
- [ ] Implement Google OAuth flow and save tokens in `emailreply.oauth_tokens`.
- [ ] Build `/agent/run` (Gmail fetch + OpenAI draft) and `/jobs/{id}` polling.
- [ ] Create `/playground`: thread picker, tone/length controls, run + result list.

## Near-term
- [ ] Redis rate-limit at `emailreply:rate:{ip}` (TTL 60s).
- [ ] `/messages?projectId` endpoint + dashboard history.
- [ ] Optional: “Send with Gmail” action (server-side POST using `gmail.users.messages.send`) behind a toggle.
- [ ] Add smoke tests for endpoints (mock OpenAI/Gmail).
- [ ] Record a 20–30s Loom demo; add screenshot to README.


