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
	# Use table path without schema; select schema via Accept-Profile
	url = f"{cfg['base_url']}/rest/v1/oauth_tokens"
	headers = {
		"apikey": cfg["apikey"],
		"Authorization": f"Bearer {cfg['apikey']}",
		"Accept": "application/json",
		"Accept-Profile": "emailreply",
	}
	params = {
		"select": "*",
		"project_id": f"eq.{project_id}",
		"provider": f"eq.{provider}",
		"limit": "1",
	}
	resp = requests.get(url, headers=headers, params=params, timeout=10)
	resp.raise_for_status()
	items = resp.json()
	return items[0] if isinstance(items, list) and items else None


def upsert_oauth_token(record: Dict[str, Any]) -> Dict[str, Any]:
	cfg = _get_base_headers()
	# Use table path without schema; write schema via Content-Profile
	url = f"{cfg['base_url']}/rest/v1/oauth_tokens"
	headers = {
		"apikey": cfg["apikey"],
		"Authorization": f"Bearer {cfg['apikey']}",
		"Content-Type": "application/json",
		"Prefer": "resolution=merge-duplicates,return=representation",
		"Content-Profile": "emailreply",
	}
	resp = requests.post(url, headers=headers, json=[record], timeout=10)
	resp.raise_for_status()
	items = resp.json()
	return items[0] if isinstance(items, list) and items else record


