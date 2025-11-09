"""
Minimal Gmail service stubs for scaffolding.
"""

from __future__ import annotations

from typing import Dict, Any


def resolve_oauth_token(project_id: str) -> str | None:
	"""
	Return an access token for Gmail API.
	This is a stub; integrate real token lookup later.
	"""
	return None


def fetch_thread_text(thread_id: str, access_token: str | None) -> str:
	"""
	Return a normalized plain text for the Gmail thread.
	This stub returns placeholder text.
	"""
	return f"[Thread {thread_id}] Placeholder conversation text."


