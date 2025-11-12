"""
Gmail service for fetching threads and sending messages.
"""

from __future__ import annotations

from typing import Dict, Any, List, Optional
import os
from datetime import datetime

# Try imports
try:
	from google.oauth2.credentials import Credentials
	from googleapiclient.discovery import build
	from googleapiclient.errors import HttpError
	GMAIL_API_AVAILABLE = True
except ImportError:
	GMAIL_API_AVAILABLE = False

try:
	from supabase import create_client, Client
	SUPABASE_AVAILABLE = True
except ImportError:
	SUPABASE_AVAILABLE = False


def get_supabase_client() -> Optional[Client]:
	"""Get Supabase client if available and configured for emailreply schema."""
	if not SUPABASE_AVAILABLE:
		return None
	
	# Prefer NEXT_PUBLIC_SUPABASE_URL, but fall back to SUPABASE_URL for server-side
	url = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_URL")
	key = os.getenv("SUPABASE_SERVICE_ROLE")
	schema = os.getenv("SUPABASE_SCHEMA", "emailreply")
	
	if not url or not key:
		print("⚠️ Warning: Supabase credentials not configured")
		return None
	
	print(f"✅ Supabase client created with schema: {schema}")
	
	# Create client and set schema if supported
	client = create_client(url, key)
	try:
		# Some supabase-py versions expose postgrest.schema to set the search path
		client.postgrest.schema(schema)  # type: ignore[attr-defined]
	except Exception:
		pass
	
	return client


def resolve_oauth_token(project_id: str) -> str | None:
	"""
	Return an access token for Gmail API from Supabase.
	
	Args:
		project_id: The project identifier
		
	Returns:
		Access token string or None if not found
	"""
	print(f"🔑 resolve_oauth_token called for project: {project_id}")
	
	supabase = get_supabase_client()
	if not supabase:
		print("❌ Supabase not available for token lookup")
		return None
	
	schema = os.getenv("SUPABASE_SCHEMA", "emailreply")
	
	try:
		# Fetch token from oauth_tokens table
		# Schema is set via postgrest.schema() in get_supabase_client()
		print(f"🔍 Querying oauth_tokens table...")
		
		result = supabase.table("oauth_tokens").select("*").eq(
			"project_id", project_id
		).eq(
			"provider", "google"
		).execute()
		
		print(f"📊 Supabase query result: {len(result.data) if result.data else 0} rows")
		
		if result.data and len(result.data) > 0:
			token = result.data[0]
			print(f"✅ Token found, created: {token.get('created_at')}")
			
			# Check if expired
			if token.get("expires_at"):
				expires_at = datetime.fromisoformat(token["expires_at"])
				now = datetime.utcnow()
				print(f"⏰ Token expires: {expires_at}, Now: {now}")
				
				if now >= expires_at:
					print(f"❌ Token expired for project {project_id}")
					# TODO: Implement token refresh
					return None
				else:
					print(f"✅ Token still valid ({(expires_at - now).total_seconds() / 3600:.1f} hours remaining)")
			
			return token.get("access_token")
		
		print(f"❌ No token found for project {project_id}")
		return None
		
	except Exception as e:
		print(f"❌ Error resolving OAuth token: {e}")
		import traceback
		traceback.print_exc()
		return None


def fetch_thread_text(thread_id: str, access_token: str | None) -> str:
	"""
	Return a normalized plain text for the Gmail thread.
	
	Args:
		thread_id: Gmail thread ID
		access_token: Valid Gmail API access token
		
	Returns:
		Plain text representation of the thread
	"""
	if not access_token:
		return f"[Thread {thread_id}] No access token available."
	
	if not GMAIL_API_AVAILABLE:
		return f"[Thread {thread_id}] Gmail API library not available."
	
	try:
		# Build Gmail API client
		credentials = Credentials(token=access_token)
		service = build('gmail', 'v1', credentials=credentials)
		
		# Fetch thread
		thread = service.users().threads().get(
			userId='me',
			id=thread_id,
			format='full'
		).execute()
		
		# Extract messages
		messages = thread.get('messages', [])
		if not messages:
			return f"[Thread {thread_id}] No messages found."
		
		# Build plain text representation
		thread_text = []
		for msg in messages:
			headers = msg.get('payload', {}).get('headers', [])
			
			# Extract relevant headers
			subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), 'No Subject')
			from_email = next((h['value'] for h in headers if h['name'].lower() == 'from'), 'Unknown')
			date = next((h['value'] for h in headers if h['name'].lower() == 'date'), '')
			
			# Extract body
			body = _extract_message_body(msg.get('payload', {}))
			
			# Format message
			thread_text.append(f"From: {from_email}")
			thread_text.append(f"Date: {date}")
			thread_text.append(f"Subject: {subject}")
			thread_text.append(f"\n{body}\n")
			thread_text.append("-" * 80)
		
		return "\n".join(thread_text)
		
	except HttpError as error:
		print(f"Gmail API error: {error}")
		return f"[Thread {thread_id}] Error fetching thread: {error}"
	except Exception as e:
		print(f"Unexpected error fetching thread: {e}")
		return f"[Thread {thread_id}] Unexpected error: {e}"


def _extract_message_body(payload: Dict[str, Any]) -> str:
	"""Extract plain text body from message payload."""
	import base64
	
	# Check if body is directly in payload
	if 'body' in payload and 'data' in payload['body']:
		try:
			return base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8')
		except Exception as e:
			print(f"Error decoding body: {e}")
			return "[Could not decode message body]"
	
	# Check parts (multipart message)
	if 'parts' in payload:
		for part in payload['parts']:
			mime_type = part.get('mimeType', '')
			
			# Prefer plain text
			if mime_type == 'text/plain' and 'data' in part.get('body', {}):
				try:
					return base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
				except Exception as e:
					print(f"Error decoding part: {e}")
					continue
			
			# Recursively check nested parts
			if 'parts' in part:
				nested_body = _extract_message_body(part)
				if nested_body and nested_body != "[Could not decode message body]":
					return nested_body
	
	return "[No readable content]"


def list_threads(project_id: str, max_results: int = 20) -> List[Dict[str, Any]]:
	"""
	List Gmail threads for a project.
	
	Args:
		project_id: The project identifier
		max_results: Maximum number of threads to return
		
	Returns:
		List of thread dictionaries with id, subject, snippet, date
	"""
	print(f"🔍 list_threads called for project: {project_id}")
	
	access_token = resolve_oauth_token(project_id)
	if not access_token:
		print(f"❌ No access token for project {project_id}")
		return []
	
	print(f"✅ Access token found (length: {len(access_token)})")
	
	if not GMAIL_API_AVAILABLE:
		print("❌ Gmail API library not available")
		return []
	
	try:
		# Build Gmail API client
		credentials = Credentials(token=access_token)
		service = build('gmail', 'v1', credentials=credentials)
		
		# List threads
		label_whitelist = os.getenv("GMAIL_LABEL_WHITELIST", "INBOX").split(",")
		selected_label = label_whitelist[0].strip() if label_whitelist else 'INBOX'
		
		print(f"🏷️  Fetching threads from label: {selected_label}")
		
		# Fetch threads from first label
		results = service.users().threads().list(
			userId='me',
			maxResults=max_results,
			labelIds=[selected_label]
		).execute()
		
		print(f"📧 Gmail API response: {results.keys()}")
		
		threads_data = results.get('threads', [])
		print(f"📬 Found {len(threads_data)} threads")
		
		if not threads_data:
			print("⚠️  No threads returned from Gmail API")
			return []
		
		# Fetch details for each thread
		threads = []
		for i, thread_data in enumerate(threads_data):
			thread_id = thread_data['id']
			print(f"📨 Fetching thread {i+1}/{len(threads_data)}: {thread_id}")
			
			# Fetch full thread to get subject and snippet
			thread = service.users().threads().get(
				userId='me',
				id=thread_id,
				format='metadata',
				metadataHeaders=['Subject', 'From', 'Date']
			).execute()
			
			# Extract first message headers
			messages = thread.get('messages', [])
			if not messages:
				print(f"⚠️  No messages in thread {thread_id}")
				continue
			
			first_msg = messages[0]
			headers = first_msg.get('payload', {}).get('headers', [])
			
			subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), 'No Subject')
			from_email = next((h['value'] for h in headers if h['name'].lower() == 'from'), 'Unknown')
			date = next((h['value'] for h in headers if h['name'].lower() == 'date'), '')
			
			snippet = thread.get('snippet', '')
			
			print(f"✉️  Thread: '{subject[:50]}' from {from_email[:30]}")
			
			threads.append({
				'id': thread_id,
				'subject': subject,
				'from': from_email,
				'date': date,
				'snippet': snippet[:100] + '...' if len(snippet) > 100 else snippet,
			})
		
		print(f"✅ Returning {len(threads)} threads")
		return threads
		
	except HttpError as error:
		print(f"Gmail API error: {error}")
		return []
	except Exception as e:
		print(f"Unexpected error listing threads: {e}")
		return []
