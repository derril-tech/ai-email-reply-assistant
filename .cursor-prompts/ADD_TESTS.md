# ADD_TESTS.md — Smoke Tests
Create `/api/tests/`:
- `test_health_contract.py` — endpoints exist and return shapes.
- `test_agent_flow.py` — mock Gmail + OpenAI; run → poll → assert.

Add `/api/requirements-dev.txt`:
- pytest
- httpx
- pytest-asyncio (if needed)


