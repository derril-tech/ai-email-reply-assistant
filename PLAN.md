---
milestones: 5
---

## M1 — Skeleton Running
- FastAPI endpoints: `/agent/run`, `/jobs/{id}`, `/messages?projectId`.
- Next.js routes `/`, `/dashboard`, `/playground`; add `useAgent(projectId)`.
- Verify Supabase + Redis connectivity with `SUPABASE_SCHEMA=emailreply`, `REDIS_PREFIX=emailreply`.

## M2 — OAuth + Gmail Thread Fetch
- Implement Google OAuth (server) and store tokens in `emailreply.oauth_tokens`.
- Add minimal thread picker (fake list → real list after OAuth).
- Cache normalized thread text in Redis (`emailreply:cache:thread:{threadId}`).

## M3 — OpenAI Drafting Adapter
- Prompt: polite, context-aware replies; system guardrails; knobs: `tone`, `length`, `bullets`.
- Persist input/output in `messages` and `jobs`.

## M4 — Playground Polish
- UI: thread selector, tone dropdown, length slider, regenerate, copy-to-clipboard.
- Show meta chips: `From`, `Subject`, token usage, time saved.

## M5 — Deploy & Docs
- Railway deploy (API + Web), envs set.
- README, screenshots, and simple demo flow verified.


