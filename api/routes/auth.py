"""
OAuth authentication routes for Gmail integration.
"""

from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import RedirectResponse
import os
from typing import Optional

# Try Google OAuth imports
try:
	from google_auth_oauthlib.flow import Flow
	from google.oauth2.credentials import Credentials
	GOOGLE_AUTH_AVAILABLE = True
except ImportError:
	GOOGLE_AUTH_AVAILABLE = False

router = APIRouter(prefix="/auth", tags=["auth"])

# OAuth scopes
SCOPES = [
	'https://www.googleapis.com/auth/gmail.readonly',
	'https://www.googleapis.com/auth/gmail.send',
	'https://www.googleapis.com/auth/gmail.metadata',
]


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
		
		# Store tokens (TODO: implement Supabase storage)
		token_data = {
			"access_token": credentials.token,
			"refresh_token": credentials.refresh_token,
			"token_uri": credentials.token_uri,
			"client_id": credentials.client_id,
			"client_secret": credentials.client_secret,
			"scopes": credentials.scopes,
		}
		
		# TODO: Store in Supabase oauth_tokens table
		# For now, log success
		print(f"OAuth success for project: {project_id}")
		print(f"Scopes granted: {credentials.scopes}")
		
		# Redirect back to web app
		web_url = os.getenv("WEB_RAILWAY_URL") or os.getenv("NEXT_PUBLIC_APP_URL") or "http://localhost:3000"
		if not web_url.startswith("http"):
			web_url = f"https://{web_url}"
		
		final_redirect = redirect_to or f"{web_url}/playground?connected=true"
		return RedirectResponse(url=final_redirect)
		
	except Exception as e:
		print(f"OAuth error: {e}")
		raise HTTPException(status_code=400, detail=f"Token exchange failed: {str(e)}")


@router.get("/status")
def auth_status(project_id: str = Query(default="default")):
	"""
	Check if user has connected Gmail for a project.
	"""
	# TODO: Query Supabase to check if tokens exist
	return {
		"project_id": project_id,
		"connected": False,  # Stubbed for now
		"scopes": []
	}

