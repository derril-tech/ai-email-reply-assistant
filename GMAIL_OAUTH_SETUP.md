# 🔐 Gmail OAuth Integration Guide

**Goal:** Enable users to connect their Gmail account, fetch threads, and generate AI replies.

---

## 📋 Overview

### What We'll Build:
1. **Google Cloud OAuth Setup** — Create credentials
2. **Backend OAuth Flow** — Authorization + token exchange
3. **Frontend Connect Button** — Initiate OAuth
4. **Gmail API Integration** — Fetch threads, send replies
5. **Token Storage** — Securely store in Supabase

---

## 🚀 Step 1: Google Cloud Setup

### 1.1 Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Click **"Select a project"** → **"New Project"**
3. **Project name:** `AI Email Reply Assistant`
4. Click **"Create"**

---

### 1.2 Enable Gmail API

1. In the project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Gmail API"**
3. Click **"Enable"**

---

### 1.3 Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (for testing with personal accounts)
3. Click **"Create"**

**App information:**
- **App name:** `AI Email Reply Assistant`
- **User support email:** Your email
- **Developer contact:** Your email

**Scopes:**
Click **"Add or Remove Scopes"**, then add:
- `https://www.googleapis.com/auth/gmail.readonly` — Read email threads
- `https://www.googleapis.com/auth/gmail.send` — Send replies (optional for now)
- `https://www.googleapis.com/auth/gmail.metadata` — Read metadata

Click **"Save and Continue"**

**Test users (for development):**
- Add your own Gmail address
- Click **"Save and Continue"**

---

### 1.4 Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. **Application type:** `Web application`
4. **Name:** `AI Email Reply Assistant Web`

**Authorized JavaScript origins:**
```
http://localhost:3000
https://web-production-5e03f.up.railway.app
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback
https://api-production-192f.up.railway.app/auth/callback
https://web-production-5e03f.up.railway.app/api/auth/callback
```

5. Click **"Create"**
6. **Copy the Client ID and Client Secret** (we'll need these!)

---

## 🔧 Step 2: Update Environment Variables

### Railway API Service Variables:
```bash
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_OAUTH_REDIRECT_URI=https://api-production-192f.up.railway.app/auth/callback
```

### Railway Web Service Variables:
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=https://api-production-192f.up.railway.app
```

### Local Development (.env):
```bash
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:8000/auth/callback
```

---

## 📝 Step 3: Backend Implementation

### 3.1 Add Dependencies

**`api/requirements.txt`:**
```txt
google-auth==2.34.0
google-auth-oauthlib==1.2.1
google-auth-httplib2==0.2.0
google-api-python-client==2.144.0
```

---

### 3.2 Implement OAuth Endpoints

**`api/routes/auth.py`** (new file):
```python
from fastapi import APIRouter, HTTPException, Query
from google_auth_oauthlib.flow import Flow
import os

router = APIRouter(prefix="/auth", tags=["auth"])

# OAuth configuration
SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
]

@router.get("/google")
def google_oauth_redirect(project_id: str = Query(...)):
    """Initiate Google OAuth flow."""
    client_config = {
        "web": {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [os.getenv("GOOGLE_OAUTH_REDIRECT_URI")],
        }
    }
    
    flow = Flow.from_client_config(
        client_config,
        scopes=SCOPES,
        redirect_uri=os.getenv("GOOGLE_OAUTH_REDIRECT_URI")
    )
    
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        state=project_id  # Pass project_id via state
    )
    
    return {"authorization_url": authorization_url}

@router.get("/callback")
async def oauth_callback(code: str, state: str):
    """Handle OAuth callback and exchange code for tokens."""
    # TODO: Implement token exchange and storage
    return {"status": "success", "project_id": state}
```

---

### 3.3 Update Gmail Service

**`api/services/gmail.py`:**
```python
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import base64
from email.mime.text import MIMEText

def get_gmail_service(access_token: str):
    """Create Gmail API service with access token."""
    creds = Credentials(token=access_token)
    return build('gmail', 'v1', credentials=creds)

def fetch_threads(access_token: str, max_results: int = 10):
    """Fetch user's Gmail threads."""
    service = get_gmail_service(access_token)
    results = service.users().threads().list(
        userId='me',
        maxResults=max_results,
        labelIds=['INBOX']
    ).execute()
    
    threads = results.get('threads', [])
    return threads

def get_thread_messages(access_token: str, thread_id: str):
    """Get all messages in a thread."""
    service = get_gmail_service(access_token)
    thread = service.users().threads().get(
        userId='me',
        id=thread_id
    ).execute()
    
    return thread.get('messages', [])
```

---

## 🎨 Step 4: Frontend Implementation

### 4.1 Create OAuth Hook

**`web/hooks/useGmailAuth.ts`:**
```typescript
import { useState } from "react";

export function useGmailAuth() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);

  async function connectGmail(projectId: string) {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(
        `${apiUrl}/auth/google?project_id=${projectId}`
      );
      const data = await res.json();
      
      // Redirect to Google OAuth
      window.location.href = data.authorization_url;
    } catch (error) {
      console.error("OAuth error:", error);
      setLoading(false);
    }
  }

  return { isAuthorized, loading, connectGmail };
}
```

---

### 4.2 Update Connect Gmail Button

**`web/app/page.tsx`:**
```typescript
"use client";

import { useGmailAuth } from "@/hooks/useGmailAuth";

export default function Home() {
  const { connectGmail, loading } = useGmailAuth();

  return (
    // ... existing code ...
    <Button 
      onClick={() => connectGmail("default")}
      disabled={loading}
    >
      {loading ? "Connecting..." : "Connect Gmail"}
    </Button>
  );
}
```

---

### 4.3 Create Callback Page

**`web/app/api/auth/callback/route.ts`:**
```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // project_id
  
  if (!code) {
    return NextResponse.redirect(new URL("/playground?error=auth_failed", request.url));
  }
  
  // Exchange code for tokens via backend
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  await fetch(`${apiUrl}/auth/callback?code=${code}&state=${state}`);
  
  // Redirect to playground
  return NextResponse.redirect(new URL("/playground?connected=true", request.url));
}
```

---

## 🔒 Step 5: Token Storage (Supabase)

**Table:** `emailreply.oauth_tokens` (already created!)

**Store tokens after OAuth:**
```python
from supabase import create_client

supabase = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE")
)

def store_oauth_token(profile_id: str, project_id: str, tokens: dict):
    """Store OAuth tokens in Supabase."""
    supabase.table("oauth_tokens").insert({
        "profile_id": profile_id,
        "project_id": project_id,
        "provider": "google",
        "access_token": tokens["access_token"],
        "refresh_token": tokens.get("refresh_token"),
        "expires_at": tokens.get("expires_at"),
        "scopes": ",".join(SCOPES)
    }).execute()
```

---

## 🧪 Step 6: Testing

### Test OAuth Flow:
1. Click "Connect Gmail" on homepage
2. Redirects to Google consent screen
3. Grant permissions
4. Redirects back to `/playground?connected=true`
5. Token stored in Supabase

### Test Thread Fetching:
```python
# In Playground, after OAuth
threads = fetch_threads(access_token, max_results=10)
# Display threads in UI
```

---

## 📋 Implementation Checklist

- [ ] Google Cloud project created
- [ ] Gmail API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth credentials created
- [ ] Environment variables set (Railway API + Web)
- [ ] Backend dependencies added (`google-auth`, etc.)
- [ ] OAuth endpoints implemented (`/auth/google`, `/auth/callback`)
- [ ] Gmail service functions implemented
- [ ] Token storage in Supabase wired
- [ ] Frontend OAuth hook created
- [ ] Connect Gmail button wired
- [ ] Callback page created
- [ ] Full flow tested

---

## 🔮 Next Steps After OAuth

1. **Fetch Threads** — Display user's Gmail threads in Playground
2. **Thread Picker UI** — Let user select a thread
3. **Parse Thread** — Extract messages, participants, subject
4. **Generate Draft** — Use real thread content with OpenAI
5. **Send Reply** — (Optional) Send draft back to Gmail

---

## 🆘 Troubleshooting

### "redirect_uri_mismatch"
- Check authorized redirect URIs in Google Cloud Console
- Ensure `GOOGLE_OAUTH_REDIRECT_URI` matches exactly

### "invalid_client"
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Verify they match Google Cloud Console values

### "access_denied"
- User declined permissions
- Add user to test users in OAuth consent screen

---

**Ready to start?** Let me know and I'll implement the code! 🚀

