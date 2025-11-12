"""
Minimal Supabase REST helpers to force schema-qualified access.
"""

from __future__ import annotations

from typing import Any, Dict, Optional
import os
import requests


def _get_base_headers() -> Dict[str, str]:
	base_url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
	service_key = os.getenv("SUPABASE_SERVICE_ROLE")
	if not base_url or not service_key:
		raise RuntimeError("Supabase URL or service role key not configured")
	return {
		"base_url": base_url.rstrip("/"),
		"apikey": service_key,
	}


def select_oauth_token(project_id: str, provider: str = "google") -> Optional[Dict[str, Any]]:
	cfg = _get_base_headers()
	params = {
		"select": "*",
		"project_id": f"eq.{project_id}",
		"provider": f"eq.{provider}",
		"limit": "1",
	}
	# Strategy 1: default path + Accept-Profile
	url_1 = f"{cfg['base_url']}/rest/v1/oauth_tokens"
	headers_1 = {
		"apikey": cfg["apikey"],
		"Authorization": f"Bearer {cfg['apikey']}",
		"Accept": "application/json",
		"Accept-Profile": "emailreply",
	}
	try:
		resp = requests.get(url_1, headers=headers_1, params=params, timeout=10)
		if resp.status_code >= 400:
			raise requests.HTTPError(f"{resp.status_code} {resp.reason}: {resp.text}", response=resp)
		items = resp.json()
		return items[0] if isinstance(items, list) and items else None
	except Exception as e:
		# Strategy 2: schema-qualified path (for older PostgREST)
		url_2 = f"{cfg['base_url']}/rest/v1/emailreply.oauth_tokens"
		headers_2 = {
			"apikey": cfg["apikey"],
			"Authorization": f"Bearer {cfg['apikey']}",
			"Accept": "application/json",
		}
		resp2 = requests.get(url_2, headers=headers_2, params=params, timeout=10)
		if resp2.status_code >= 400:
			raise requests.HTTPError(f"{resp2.status_code} {resp2.reason}: {resp2.text}", response=resp2)
		items2 = resp2.json()
		return items2[0] if isinstance(items2, list) and items2 else None


def upsert_oauth_token(record: Dict[str, Any]) -> Dict[str, Any]:
	cfg = _get_base_headers()
	body = [record]
	# Strategy 1: default path + Content-Profile
	url_1 = f"{cfg['base_url']}/rest/v1/oauth_tokens"
	headers_1 = {
		"apikey": cfg["apikey"],
		"Authorization": f"Bearer {cfg['apikey']}",
		"Content-Type": "application/json",
		"Prefer": "resolution=merge-duplicates,return=representation",
		"Content-Profile": "emailreply",
	}
	resp = requests.post(url_1, headers=headers_1, json=body, timeout=10)
	if resp.status_code >= 400:
		# Strategy 2: schema-qualified path (older PostgREST)
		url_2 = f"{cfg['base_url']}/rest/v1/emailreply.oauth_tokens"
		headers_2 = {
			"apikey": cfg["apikey"],
			"Authorization": f"Bearer {cfg['apikey']}",
			"Content-Type": "application/json",
			"Prefer": "resolution=merge-duplicates,return=representation",
		}
		resp2 = requests.post(url_2, headers=headers_2, json=body, timeout=10)
		if resp2.status_code >= 400:
			raise requests.HTTPError(f"{resp2.status_code} {resp2.reason}: {resp2.text}", response=resp2)
		items2 = resp2.json()
		return items2[0] if isinstance(items2, list) and items2 else record

	items = resp.json()
	return items[0] if isinstance(items, list) and items else record


