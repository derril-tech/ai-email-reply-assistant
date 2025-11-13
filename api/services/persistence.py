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
	Persist a message to Supabase emailreply.messages table.
	"""
	try:
		import requests
		base_url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
		service_key = os.getenv("SUPABASE_SERVICE_ROLE")
		
		if not base_url or not service_key:
			print("⚠️ Supabase URL or service role key not configured")
			return False
		
		url = f"{base_url.rstrip('/')}/rest/v1/messages"
		headers = {
			"apikey": service_key,
			"Authorization": f"Bearer {service_key}",
			"Content-Type": "application/json",
			"Prefer": "return=representation",
		}
		
		# Build message record
		record = {
			"project_id": project_id,  # Will be mapped to UUID in a real multi-project setup
			"role": message.get("role", "assistant"),
			"content": message.get("content", ""),
			"meta": message.get("meta", {}),
		}
		
		resp = requests.post(url, headers=headers, json=record, timeout=10)
		if resp.status_code >= 400:
			print(f"⚠️ Failed to persist message to Supabase: {resp.status_code} {resp.text}")
			return False
		
		print(f"✅ Message persisted to Supabase: {resp.json()}")
		return True
		
	except Exception as e:
		print(f"⚠️ Error persisting message to Supabase: {e}")
		return False


def get_dashboard_stats(project_id: str = "default") -> Dict[str, Any]:
	"""
	Get dashboard statistics via RPC function.
	"""
	try:
		import requests
		base_url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
		service_key = os.getenv("SUPABASE_SERVICE_ROLE")
		
		if not base_url or not service_key:
			raise RuntimeError("Supabase not configured")
		
		url = f"{base_url.rstrip('/')}/rest/v1/rpc/get_dashboard_stats"
		headers = {
			"apikey": service_key,
			"Authorization": f"Bearer {service_key}",
			"Content-Type": "application/json",
		}
		body = {"p_project_id": project_id}
		
		resp = requests.post(url, headers=headers, json=body, timeout=10)
		resp.raise_for_status()
		
		return resp.json()
		
	except Exception as e:
		print(f"Error fetching dashboard stats: {e}")
		# Return default values on error
		return {
			"repliesGenerated": 0,
			"successRate": 100,
			"avgDraftLength": 0,
			"timeSavedMinutes": 0,
			"activeProjects": 1,
		}


def get_recent_drafts(project_id: str = "default", limit: int = 10) -> list:
	"""
	Get recent drafts via RPC function.
	"""
	try:
		import requests
		base_url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
		service_key = os.getenv("SUPABASE_SERVICE_ROLE")
		
		if not base_url or not service_key:
			raise RuntimeError("Supabase not configured")
		
		url = f"{base_url.rstrip('/')}/rest/v1/rpc/get_recent_drafts"
		headers = {
			"apikey": service_key,
			"Authorization": f"Bearer {service_key}",
			"Content-Type": "application/json",
		}
		body = {"p_project_id": project_id, "p_limit": limit}
		
		resp = requests.post(url, headers=headers, json=body, timeout=10)
		resp.raise_for_status()
		
		drafts = resp.json()
		
		# Format response
		return [
			{
				"id": d["id"],
				"subject": d["subject"],
				"snippet": d["snippet"],
				"threadId": d["thread_id"],
				"tone": d["tone"],
				"createdAt": d["created_at"],
			}
			for d in drafts
		]
		
	except Exception as e:
		print(f"Error fetching recent drafts: {e}")
		return []


def get_draft_by_id(draft_id: str) -> Optional[Dict[str, Any]]:
	"""
	Get a specific draft by ID via RPC function.
	"""
	try:
		import requests
		from uuid import UUID
		
		# Validate UUID
		UUID(draft_id)
		
		base_url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
		service_key = os.getenv("SUPABASE_SERVICE_ROLE")
		
		if not base_url or not service_key:
			raise RuntimeError("Supabase not configured")
		
		url = f"{base_url.rstrip('/')}/rest/v1/rpc/get_draft_by_id"
		headers = {
			"apikey": service_key,
			"Authorization": f"Bearer {service_key}",
			"Content-Type": "application/json",
		}
		body = {"p_draft_id": draft_id}
		
		resp = requests.post(url, headers=headers, json=body, timeout=10)
		resp.raise_for_status()
		
		drafts = resp.json()
		if not drafts:
			return None
		
		d = drafts[0]
		return {
			"id": d["id"],
			"subject": d["subject"],
			"content": d["content"],
			"threadId": d["thread_id"],
			"tone": d["tone"],
			"length": d["length"],
			"bullets": d["bullets"],
			"createdAt": d["created_at"],
		}
		
	except Exception as e:
		print(f"Error fetching draft by ID: {e}")
		return None



def persist_gmail_thread_index(profile_id: str, normalized_thread: Dict[str, Any]) -> bool:
	"""
	Best-effort stub for storing thread index into emailreply.gmail_threads.
	Fields: subject, participants, snippet, updated_at.
	"""
	_ = profile_id, normalized_thread
	return False


