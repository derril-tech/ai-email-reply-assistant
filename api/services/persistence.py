"""
Persistence utilities for Supabase and Upstash Redis (REST).
These are minimal, network-optional stubs suitable for a scaffold.
"""

from __future__ import annotations

from typing import Any, Dict, Optional, Tuple
import json
import os
import urllib.request


def _http_post_json(url: str, payload: Dict[str, Any], headers: Dict[str, str], timeout_seconds: float = 5.0) -> Dict[str, Any] | None:
	data = json.dumps(payload).encode("utf-8")
	req = urllib.request.Request(url=url, data=data, headers=headers, method="POST")
	with urllib.request.urlopen(req, timeout=timeout_seconds) as resp:
		body = resp.read().decode("utf-8")
		try:
			return json.loads(body)
		except json.JSONDecodeError:
			return {"raw": body}


def _upstash_base() -> Tuple[str, str]:
	base_url = os.getenv("UPSTASH_REDIS_REST_URL", "").rstrip("/")
	token = os.getenv("UPSTASH_REDIS_REST_TOKEN", "")
	return base_url, token


def redis_get_json(key: str) -> Optional[Dict[str, Any]]:
	"""
	Read a JSON value from Upstash Redis via pipeline GET.
	Returns parsed JSON or None if not found/error.
	"""
	base_url, token = _upstash_base()
	if not base_url or not token:
		return None
	url = f"{base_url}/pipeline"
	headers = {
		"Content-Type": "application/json",
		"Authorization": f"Bearer {token}",
	}
	payload = {"commands": [{"command": "GET", "args": [key]}]}
	try:
		resp = _http_post_json(url, payload, headers) or {}
		# Upstash pipeline returns e.g. {"result":[{"result":"..."}]}
		results = (resp.get("result") or [])
		if not results:
			return None
		raw = results[0].get("result")
		if not raw:
			return None
		return json.loads(raw)
	except Exception:
		return None


def redis_setex_json(key: str, ttl_seconds: int, value: Dict[str, Any]) -> bool:
	"""
	Write a JSON value to Upstash Redis with TTL.
	"""
	base_url, token = _upstash_base()
	if not base_url or not token:
		return False
	url = f"{base_url}/pipeline"
	headers = {
		"Content-Type": "application/json",
		"Authorization": f"Bearer {token}",
	}
	payload = {
		"commands": [
			{"command": "SETEX", "args": [key, str(ttl_seconds), json.dumps(value, separators=(',', ':'))]},
		]
	}
	try:
		_http_post_json(url, payload, headers)
		return True
	except Exception:
		return False


def write_job_to_redis(job_key: str, value: Dict[str, Any]) -> bool:
	"""
	Write job result to Upstash Redis via REST API if configured.
	Returns True on best-effort success, False otherwise.
	"""
	base_url, token = _upstash_base()
	if not base_url or not token:
		return False

	url = f"{base_url}/pipeline"
	headers = {
		"Content-Type": "application/json",
		"Authorization": f"Bearer {token}",
	}
	key = f"{os.getenv('REDIS_PREFIX', 'emailreply')}:job:{job_key}"
	payload = {
		"commands": [
			{"command": "SET", "args": [key, json.dumps(value, separators=(',', ':'))]},
		]
	}
	try:
		_http_post_json(url, payload, headers)
		return True
	except Exception:
		return False


def persist_message_to_supabase(project_id: str, message: Dict[str, Any]) -> bool:
	"""
	Best-effort stub: In a real implementation, post to Supabase REST
	with SUPABASE_SERVICE_ROLE and NEXT_PUBLIC_SUPABASE_URL.
	"""
	# Intentionally a no-op to keep the scaffold dependency-free.
	_ = project_id, message
	return False


def persist_gmail_thread_index(profile_id: str, normalized_thread: Dict[str, Any]) -> bool:
	"""
	Best-effort stub for storing thread index into emailreply.gmail_threads.
	Fields: subject, participants, snippet, updated_at.
	"""
	_ = profile_id, normalized_thread
	return False


