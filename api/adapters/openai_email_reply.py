"""
Adapter: OpenAI email reply drafting.
"""

from __future__ import annotations

from typing import Any, Dict
import os


def draft_reply(thread_text: str, controls: Dict[str, Any]) -> Dict[str, Any]:
	"""
	Generate a polite, safe email draft based on the provided thread text.
	This is a lightweight placeholder that returns a deterministic draft.

	Returns:
		{ "text": str, "meta": { "subject": str|None, "participants": list|None, "token_usage": dict|None } }
	"""
	# NOTE: Intentionally no external network calls in this scaffold.
	# Hook up OpenAI SDK here when implementing for real.
	tone = controls.get("tone", "friendly")
	length = controls.get("length", "short")
	bullets = bool(controls.get("bullets", False))

	prefix = "Hi," if tone == "formal" else "Hey,"
	body = "Thanks for the update." if length == "short" else "Thank you for the detailed update. I appreciate the context you shared."

	if bullets:
		body += "\n\n- Next steps\n- Timeline\n- Any blockers?"

	text = f"{prefix}\n\n{body}\n\nBest regards,\n"
	return {
		"text": text,
		"meta": {
			"subject": None,
			"participants": None,
			"token_usage": None,
		},
	}


