"""
OAuth authentication routes for Gmail integration.
"""

from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import RedirectResponse
import os
from typing import Optional
from datetime import datetime, timedelta

# Try Google OAuth imports
try:
	from google_auth_oauthlib.flow import Flow
	from google.oauth2.credentials import Credentials
	GOOGLE_AUTH_AVAILABLE = True
except ImportError:
	GOOGLE_AUTH_AVAILABLE = False

# Try Supabase import
try:
	from supabase import create_client, Client
	SUPABASE_AVAILABLE = True
except ImportError:
	SUPABASE_AVAILABLE = False

router = APIRouter(prefix="/auth", tags=["auth"])

# OAuth scopes
SCOPES = [
	'https://www.googleapis.com/auth/gmail.readonly',
	'https://www.googleapis.com/auth/gmail.send',
	'https://www.googleapis.com/auth/gmail.metadata',
]


def get_supabase_client() -> Optional[Client]:
	"""Get Supabase client if available."""
	if not SUPABASE_AVAILABLE:
		return None
	
	url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
	key = os.getenv("SUPABASE_SERVICE_ROLE")
	schema = os.getenv("SUPABASE_SCHEMA", "emailreply")
	
	if not url or not key:
		print("Warning: Supabase credentials not configured")
		return None
	
	# Create client with schema header
	options = {
		"schema": schema,
		"headers": {
			"Accept-Profile": schema,
			"Content-Profile": schema,
		}
	}
	
	client = create_client(url, key, options=options)
	
	return client


@router.get("/google")
def google_oauth_redirect(
	project_id: str = Query(default="default"),
	redirect_to: Optional[str] = Query(default=None)
):
	"""
	Initiate Google OAuth flow.
	Returns authorization URL for user to grant permissions.
	"""
	if not GOOGLE_AUTH_AVAILABLE:
		raise HTTPException(status_code=501, detail="Google Auth not available")
	
	client_id = os.getenv("GOOGLE_CLIENT_ID")
	client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
	redirect_uri = os.getenv("GOOGLE_OAUTH_REDIRECT_URI")
	
	if not client_id or not client_secret or not redirect_uri:
		raise HTTPException(
			status_code=500,
			detail="OAuth credentials not configured"
		)
	
	# Build OAuth flow
	client_config = {
		"web": {
			"client_id": client_id,
			"client_secret": client_secret,
			"auth_uri": "https://accounts.google.com/o/oauth2/auth",
			"token_uri": "https://oauth2.googleapis.com/token",
			"redirect_uris": [redirect_uri],
		}
	}
	
	flow = Flow.from_client_config(
		client_config,
		scopes=SCOPES,
		redirect_uri=redirect_uri
	)
	
	# Generate authorization URL with state
	# State format: "project_id|redirect_to"
	state = f"{project_id}|{redirect_to or ''}"
	authorization_url, _ = flow.authorization_url(
		access_type='offline',
		include_granted_scopes='true',
		state=state,
		prompt='consent'  # Force consent to get refresh token
	)
	
	return {"authorization_url": authorization_url, "state": state}


@router.get("/callback")
async def oauth_callback(
	code: str = Query(...),
	state: str = Query(...),
	error: Optional[str] = Query(default=None)
):
	"""
	Handle OAuth callback from Google.
	Exchanges authorization code for access/refresh tokens.
	"""
	if error:
		raise HTTPException(status_code=400, detail=f"OAuth error: {error}")
	
	if not GOOGLE_AUTH_AVAILABLE:
		raise HTTPException(status_code=501, detail="Google Auth not available")
	
	# Parse state
	state_parts = state.split("|")
	project_id = state_parts[0] if len(state_parts) > 0 else "default"
	redirect_to = state_parts[1] if len(state_parts) > 1 and state_parts[1] else None
	
	client_id = os.getenv("GOOGLE_CLIENT_ID")
	client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
	redirect_uri = os.getenv("GOOGLE_OAUTH_REDIRECT_URI")
	
	# Build OAuth flow
	client_config = {
		"web": {
			"client_id": client_id,
			"client_secret": client_secret,
			"auth_uri": "https://accounts.google.com/o/oauth2/auth",
			"token_uri": "https://oauth2.googleapis.com/token",
			"redirect_uris": [redirect_uri],
		}
	}
	
	flow = Flow.from_client_config(
		client_config,
		scopes=SCOPES,
		redirect_uri=redirect_uri
	)
	
	# Exchange code for tokens
	try:
		flow.fetch_token(code=code)
		credentials = flow.credentials
		
		# Calculate expiry timestamp
		expires_at = None
		if credentials.expiry:
			expires_at = credentials.expiry.isoformat()
		
		# Store tokens in Supabase
		supabase = get_supabase_client()
		schema = os.getenv("SUPABASE_SCHEMA", "emailreply")
		
		if supabase:
			try:
				# For now, use project_id as profile_id (in production, use real user ID from auth)
				token_record = {
					"profile_id": project_id,  # TODO: Replace with real user ID from Supabase auth
					"project_id": project_id,
					"provider": "google",
					"access_token": credentials.token,
					"refresh_token": credentials.refresh_token,
					"expires_at": expires_at,
					"scopes": ",".join(credentials.scopes) if credentials.scopes else "",
				}
				
				# Upsert token (insert or update if exists)
				print(f"💾 Storing tokens in oauth_tokens table...")
				result = supabase.table("oauth_tokens").upsert(
					token_record,
					on_conflict="profile_id,project_id,provider"
				).execute()
				
				print(f"✅ OAuth tokens stored in Supabase for project: {project_id}")
			except Exception as e:
				print(f"⚠️ Failed to store tokens in Supabase: {e}")
		else:
			print("⚠️ Supabase not available, tokens not persisted")
		
		print(f"OAuth success for project: {project_id}")
		print(f"Scopes granted: {credentials.scopes}")
		
		# Redirect back to web app
		# Priority: redirect_to from state > WEB_RAILWAY_URL > fallback
		if redirect_to:
			final_redirect = redirect_to
		else:
			web_url = os.getenv("WEB_RAILWAY_URL") or "https://web-production-5e03f.up.railway.app"
			if not web_url.startswith("http"):
				web_url = f"https://{web_url}"
			final_redirect = f"{web_url}/playground?connected=true"
		
		print(f"Redirecting to: {final_redirect}")
		return RedirectResponse(url=final_redirect)
		
	except Exception as e:
		print(f"OAuth error: {e}")
		raise HTTPException(status_code=400, detail=f"Token exchange failed: {str(e)}")


@router.get("/status")
def auth_status(project_id: str = Query(default="default")):
	"""
	Check if user has connected Gmail for a project.
	"""
	supabase = get_supabase_client()
	schema = os.getenv("SUPABASE_SCHEMA", "emailreply")
	
	if not supabase:
		return {"connected": False, "error": "Supabase not available"}
	
	try:
		# Check if tokens exist for this project
		result = supabase.table("oauth_tokens").select("*").eq(
			"project_id", project_id
		).eq(
			"provider", "google"
		).execute()
		
		if result.data and len(result.data) > 0:
			token = result.data[0]
			
			# Check if token is expired
			if token.get("expires_at"):
				from datetime import datetime
				expires_at = datetime.fromisoformat(token["expires_at"])
				is_expired = datetime.utcnow() >= expires_at
				
				return {
					"connected": not is_expired,
					"expired": is_expired,
					"scopes": token.get("scopes", "").split(",") if token.get("scopes") else []
				}
			
			# No expiry info, assume connected
			return {
				"connected": True,
				"scopes": token.get("scopes", "").split(",") if token.get("scopes") else []
			}
		
		return {"connected": False}
		
	except Exception as e:
		print(f"Error checking auth status: {e}")
		return {"connected": False, "error": str(e)}

