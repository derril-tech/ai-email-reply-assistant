"""
Adapter: OpenAI email reply drafting.
"""

from __future__ import annotations

from typing import Any, Dict
import os

# Try OpenAI import, fallback to mock if not available
try:
	from openai import OpenAI
	OPENAI_AVAILABLE = True
except ImportError:
	OPENAI_AVAILABLE = False


def draft_reply(thread_text: str, controls: Dict[str, Any]) -> Dict[str, Any]:
	"""
	Generate a polite, safe email draft based on the provided thread text.
	Uses OpenAI GPT-4.1-mini to generate contextual replies.

	Args:
		thread_text: The email thread content to reply to
		controls: Dictionary with tone, length, bullets settings

	Returns:
		{ "text": str, "meta": { "subject": str|None, "participants": list|None, "token_usage": dict|None } }
	"""
	tone = controls.get("tone", "friendly")
	length = controls.get("length", 120)  # word count target
	bullets = bool(controls.get("bullets", False))

	# If OpenAI not available or no API key, return mock
	api_key = os.getenv("OPENAI_API_KEY")
	if not OPENAI_AVAILABLE or not api_key:
		return _mock_draft(tone, length, bullets)

	try:
		client = OpenAI(api_key=api_key)

		# Build system prompt based on controls
		system_prompt = _build_system_prompt(tone, length, bullets)

		# Call OpenAI API
		response = client.chat.completions.create(
			model="gpt-4.1-mini",
			messages=[
				{"role": "system", "content": system_prompt},
				{"role": "user", "content": f"Email thread to reply to:\n\n{thread_text}"}
			],
			temperature=0.7,
			max_tokens=500,
		)

		draft_text = response.choices[0].message.content.strip()
		token_usage = {
			"prompt_tokens": response.usage.prompt_tokens,
			"completion_tokens": response.usage.completion_tokens,
			"total_tokens": response.usage.total_tokens,
		}

		return {
			"text": draft_text,
			"meta": {
				"subject": None,  # Could parse from thread_text in future
				"participants": None,  # Could parse from thread_text in future
				"token_usage": token_usage,
			},
		}

	except Exception as e:
		# Log error and return fallback
		print(f"OpenAI API error: {e}")
		return _mock_draft(tone, length, bullets)


def _build_system_prompt(tone: str, length: int, bullets: bool) -> str:
	"""Build system prompt based on user preferences."""
	
	# Base instruction
	prompt = (
		"You are a professional email assistant. Your task is to draft a polite, contextual reply "
		"to an email thread. Follow these guidelines:\n\n"
	)

	# Tone
	tone_map = {
		"friendly": "Use a warm, friendly tone. Be conversational but professional.",
		"formal": "Use a formal, professional tone. Be respectful and businesslike.",
		"brief": "Be concise and to-the-point. Keep the reply short and efficient.",
		"professional": "Use a balanced professional tone. Be clear and courteous.",
	}
	prompt += f"- Tone: {tone_map.get(tone, tone_map['friendly'])}\n"

	# Length
	prompt += f"- Target length: approximately {length} words\n"

	# Bullets
	if bullets:
		prompt += "- Use bullet points to organize key information\n"

	# Safety & best practices
	prompt += (
		"\nBest practices:\n"
		"- Be polite and respectful\n"
		"- Address the main points from the thread\n"
		"- Do not include sensitive information (passwords, API keys, etc.)\n"
		"- End with an appropriate closing (e.g., 'Best regards,' or 'Thank you,')\n"
		"- Do NOT include a signature line with a name (the user will add their own)\n"
		"- Focus on being helpful and constructive\n"
	)

	return prompt


def _mock_draft(tone: str, length: int, bullets: bool) -> Dict[str, Any]:
	"""Fallback mock draft when OpenAI is unavailable."""
	prefix = "Hi," if tone == "formal" else "Hey,"
	body = "Thank you for the detailed update. I appreciate the context you shared."

	if bullets:
		body += "\n\n- Next steps\n- Timeline\n- Any questions?"

	text = f"{prefix}\n\n{body}\n\nBest regards,\n"
	return {
		"text": text,
		"meta": {
			"subject": None,
			"participants": None,
			"token_usage": None,
		},
	}


