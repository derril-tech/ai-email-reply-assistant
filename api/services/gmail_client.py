"""
Gmail Client integration (scaffold).
- Uses server-side OAuth tokens (not exposed to client)
- Caches normalized threads in Redis
- Stores thread index in Supabase table emailreply.gmail_threads (stubbed)
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
import time
import os

from api.services.gmail import resolve_oauth_token, fetch_thread_text
from api.services.persistence import (
	redis_get_json,
	redis_setex_json,
	persist_gmail_thread_index,
)


NormalizedThread = Dict[str, Any]


def _cache_key_for_thread(thread_id: str) -> str:
	prefix = os.getenv("REDIS_PREFIX", "emailreply")
	return f"{prefix}:cache:thread:{thread_id}"


def get_thread(profile_id: str, thread_id: str, label_whitelist: Optional[List[str]] = None) -> NormalizedThread:
	"""
	Fetch a Gmail thread and return a normalized structure.
	Cache for 300s using Upstash Redis if configured.
	"""
	key = _cache_key_for_thread(thread_id)
	cached = redis_get_json(key)
	if cached:
		return cached

	# Resolve OAuth token (server-side only) and fetch thread text (stubbed)
	access_token = resolve_oauth_token(profile_id)
	thread_text = fetch_thread_text(thread_id, access_token)

	# Naive normalization for scaffold
	snippet = (thread_text or "").strip().replace("\n", " ")
	if len(snippet) > 160:
		snippet = snippet[:157] + "..."
	normalized: NormalizedThread = {
		"id": thread_id,
		"subject": None,
		"participants": [],
		"snippet": snippet,
		"messages": [
			{"text": thread_text or "", "ts": int(time.time())},
		],
		"updated_at": int(time.time()),
	}

	# Cache and persist index (best effort)
	redis_setex_json(key, 300, normalized)
	persist_gmail_thread_index(profile_id, normalized)
	return normalized


def send_message(profile_id: str, raw_mime: str) -> str:
	"""
	Send a Gmail message (optional). Stub returns a fake message id.
	"""
	_ = profile_id, raw_mime
	return f"msg_{int(time.time())}"


