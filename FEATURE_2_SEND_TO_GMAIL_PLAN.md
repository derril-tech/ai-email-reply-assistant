# Feature #2: One-Click Send to Gmail - Implementation Plan

**Date:** 2025-11-13  
**Estimated Time:** 90 minutes  
**Priority:** High  
**Complexity:** Medium

---

## Summary

Add a "Send to Gmail" button that sends the AI-generated (or edited) draft directly as a reply to the Gmail thread, completing the end-to-end user journey without copy-pasting. Uses the existing `gmail.send` scope.

---

## Phase 1: Pre-Implementation Analysis

### ❶ Frontend Changes

#### Modified Components:
- ✅ `web/app/playground/page.tsx`:
  - Enable "Send via Gmail" button (currently disabled)
  - Add `onClick` handler to call new API endpoint
  - Show loading state during send
  - Show success/error feedback (toast + UI state change)
  - Optionally mark thread as "sent" in UI

#### UI/UX Considerations:
- ✅ **Button State:** Disabled → Loading (spinner) → Success
- ✅ **Success Animation:** Framer Motion checkmark or confetti (optional)
- ✅ **Error Handling:** Toast with clear error message
- ✅ **Confirmation:** Optional "Are you sure?" dialog before sending
- ✅ **Responsive:** Works on mobile, tablet, desktop
- ✅ **Dark Mode:** Compatible with existing theme
- ✅ **Accessibility:** Proper aria-labels, keyboard accessible

#### Design Details:
- Button: Primary color (e.g., green or blue)
- Loading: Spinning icon + "Sending..." text
- Success: Green checkmark icon + "Sent!" toast
- Error: Red toast with retry option

---

### ❷ Backend Changes

#### New Endpoint:
- ✅ `POST /gmail/send`
  - **Request Body:**
    ```json
    {
      "projectId": "default",
      "threadId": "thread_abc123",
      "draftText": "Email reply content...",
      "subject": "Re: Original subject" (optional)
    }
    ```
  - **Response:**
    ```json
    {
      "success": true,
      "messageId": "msg_xyz789",
      "threadId": "thread_abc123"
    }
    ```
  - **Error Response:**
    ```json
    {
      "success": false,
      "error": "Failed to send: reason"
    }
    ```

#### New Service Function:
- ✅ `api/services/gmail.py`:
  - Add `send_reply(thread_id, draft_text, access_token, subject=None)` function
  - Use Gmail API `users().messages().send()` method
  - Build proper MIME message with:
    - `To`: Reply to thread participants
    - `Subject`: "Re: " + original subject
    - `In-Reply-To`: Original message ID
    - `References`: Thread references
    - `Body`: Draft text

#### Error Handling:
- Token expired → Return 401, trigger re-auth
- Gmail API error → Return 500 with details
- Invalid thread ID → Return 400
- Missing access token → Return 401

---

### ❸ External Services Changes

#### Gmail API:
- ✅ Uses existing `gmail.send` scope (already granted)
- ✅ No new OAuth scopes needed
- ✅ No Google Cloud Console changes needed

#### Railway:
- ✅ Redeploy API service (automatic on push)
- ✅ No environment variable changes needed

#### Supabase:
- ✅ No changes needed

#### Redis:
- ✅ No changes needed

---

### ❹ Breaking Changes Prevention

#### Risk Assessment:

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Send fails silently | Low | High | Show clear error toast |
| Wrong recipient | Low | Critical | Fetch thread participants from Gmail |
| Duplicate sends | Low | Medium | Disable button after first click |
| Token expired during send | Medium | Medium | Return 401, prompt re-auth |
| Breaks existing draft flow | Very Low | High | Pure additive feature |

#### Guarantees:
- ✅ **Additive only** - New endpoint, doesn't modify existing
- ✅ **No breaking changes** - Existing draft/edit flow unchanged
- ✅ **Graceful errors** - Clear user feedback on failures
- ✅ **Idempotent** - Button disabled after send to prevent duplicates
- ✅ **Easy rollback** - Remove button, delete endpoint

#### Breaking Changes Checklist:
- [ ] Does it modify `useAgent` hook? **NO**
- [ ] Does it change existing API contracts? **NO**
- [ ] Does it alter OAuth flow? **NO** (uses existing scope)
- [ ] Does it change data structures? **NO**
- [ ] Can existing features still work if this fails? **YES**

---

## Implementation Steps

### Step 1: Backend - Add `send_reply` Function (30 min)

**File:** `api/services/gmail.py`

```python
def send_reply(
    thread_id: str,
    draft_text: str,
    access_token: str | None,
    subject: str | None = None
) -> Dict[str, Any]:
    """
    Send an email reply to a Gmail thread.
    
    Args:
        thread_id: Gmail thread ID to reply to
        draft_text: The email body content
        access_token: Valid Gmail API access token
        subject: Optional subject (defaults to "Re: " + original subject)
        
    Returns:
        Dict with success status, messageId, and threadId
        
    Raises:
        RuntimeError: If sending fails
    """
    if not access_token:
        raise RuntimeError("No access token available. Please reconnect Gmail.")
    
    if not GMAIL_API_AVAILABLE:
        raise RuntimeError("Gmail API library not available.")
    
    try:
        from email.mime.text import MIMEText
        import base64
        
        # Build Gmail API client
        credentials = Credentials(token=access_token)
        service = build('gmail', 'v1', credentials=credentials)
        
        # Fetch original thread to get message IDs and recipients
        thread = service.users().threads().get(
            userId='me',
            id=thread_id,
            format='metadata',
            metadataHeaders=['Subject', 'From', 'To', 'Message-ID', 'References']
        ).execute()
        
        if not thread.get('messages'):
            raise RuntimeError("Thread has no messages.")
        
        # Get the first message (original email)
        first_message = thread['messages'][0]
        headers = first_message.get('payload', {}).get('headers', [])
        
        # Extract headers
        original_subject = next(
            (h['value'] for h in headers if h['name'].lower() == 'subject'),
            'No Subject'
        )
        original_from = next(
            (h['value'] for h in headers if h['name'].lower() == 'from'),
            ''
        )
        original_message_id = next(
            (h['value'] for h in headers if h['name'].lower() == 'message-id'),
            None
        )
        original_references = next(
            (h['value'] for h in headers if h['name'].lower() == 'references'),
            None
        )
        
        # Build reply subject
        reply_subject = subject or (
            original_subject if original_subject.startswith('Re:')
            else f"Re: {original_subject}"
        )
        
        # Create MIME message
        message = MIMEText(draft_text, 'plain', 'utf-8')
        message['To'] = original_from
        message['Subject'] = reply_subject
        
        # Add threading headers for proper Gmail threading
        if original_message_id:
            message['In-Reply-To'] = original_message_id
            references = f"{original_references} {original_message_id}" if original_references else original_message_id
            message['References'] = references
        
        # Encode message
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
        
        # Send via Gmail API
        sent_message = service.users().messages().send(
            userId='me',
            body={
                'raw': raw_message,
                'threadId': thread_id  # Ensures reply is threaded
            }
        ).execute()
        
        print(f"✅ Email sent successfully: {sent_message['id']}")
        
        return {
            "success": True,
            "messageId": sent_message['id'],
            "threadId": sent_message.get('threadId', thread_id)
        }
        
    except HttpError as error:
        print(f"Gmail API error sending email: {error}")
        error_msg = str(error)
        if "401" in error_msg or "unauthorized" in error_msg.lower():
            raise RuntimeError("Gmail token expired. Please reconnect Gmail.")
        raise RuntimeError(f"Gmail API error: {error}")
    except Exception as e:
        print(f"Unexpected error sending email: {e}")
        raise RuntimeError(f"Failed to send email: {e}")
```

**Testing:**
- [ ] Function accepts valid params
- [ ] Builds proper MIME message
- [ ] Extracts thread headers correctly
- [ ] Sends via Gmail API
- [ ] Returns success response
- [ ] Handles token expiry (401)
- [ ] Handles API errors

---

### Step 2: Backend - Add `/gmail/send` Endpoint (15 min)

**File:** `api/main.py`

```python
from pydantic import BaseModel

class SendEmailBody(BaseModel):
    projectId: str
    threadId: str
    draftText: str
    subject: str | None = None

@app.post("/gmail/send")
def send_email(body: SendEmailBody):
    """
    Send an email reply to a Gmail thread.
    """
    try:
        # Resolve OAuth token
        access_token = gmail.resolve_oauth_token(body.projectId)
        if not access_token:
            raise HTTPException(
                status_code=401,
                detail="Gmail not connected or token expired. Please reconnect Gmail."
            )
        
        # Send email
        result = gmail.send_reply(
            thread_id=body.threadId,
            draft_text=body.draftText,
            access_token=access_token,
            subject=body.subject
        )
        
        return result
        
    except HTTPException:
        raise
    except RuntimeError as e:
        error_msg = str(e)
        if "token expired" in error_msg.lower() or "unauthorized" in error_msg.lower():
            raise HTTPException(status_code=401, detail=error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
    except Exception as e:
        print(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
```

**Testing:**
- [ ] Endpoint accepts POST requests
- [ ] Returns 401 if no token
- [ ] Returns 401 if token expired
- [ ] Returns 500 on API errors
- [ ] Returns success response with messageId

---

### Step 3: Frontend - Enable Send Button (20 min)

**File:** `web/app/playground/page.tsx`

```typescript
// Add state for sending
const [isSending, setIsSending] = useState(false);

// Add send handler
const handleSendToGmail = async () => {
  if (!selectedThreadId || !result?.text) return;
  
  if (!confirm('Send this email reply via Gmail?')) {
    return;
  }
  
  setIsSending(true);
  
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${apiUrl}/gmail/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: 'default',
        threadId: selectedThreadId,
        draftText: result.text,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to send email');
    }
    
    const data = await response.json();
    
    toast.success('Email sent successfully! ✉️');
    
    // Optional: Mark thread as sent in UI
    // Could add visual indicator or remove from list
    
  } catch (error: any) {
    console.error('Send error:', error);
    toast.error(error.message || 'Failed to send email. Please try again.');
    
    // If token expired (401), show reconnect prompt
    if (error.message.includes('reconnect')) {
      // Could trigger re-auth flow here
    }
  } finally {
    setIsSending(false);
  }
};

// Update button in JSX
<Button
  onClick={handleSendToGmail}
  disabled={isSending || !result?.text}
>
  {isSending ? (
    <>
      <RotateCw className="h-4 w-4 mr-2 animate-spin" />
      Sending...
    </>
  ) : (
    <>
      <Send className="h-4 w-4 mr-2" />
      Send via Gmail
    </>
  )}
</Button>
```

**Testing:**
- [ ] Button enabled when draft exists
- [ ] Confirmation dialog shown
- [ ] Loading state displays
- [ ] Success toast appears
- [ ] Error toast appears on failure
- [ ] Button re-enables after send

---

### Step 4: Polish & Testing (25 min)

**Enhancements:**

1. **Success Animation:**
   - Add Framer Motion scale animation on success
   - Show green checkmark icon briefly

2. **Error Handling:**
   - Distinguish between token expired (401) and other errors
   - Show "Reconnect Gmail" button in error toast if 401

3. **Visual Feedback:**
   - Confetti animation on success (optional, use `canvas-confetti`)
   - Thread marked with "Sent" badge

4. **Accessibility:**
   - Announce success/error to screen readers
   - Keyboard shortcut (Ctrl+S) to send

**Implementation:**
```typescript
// Success animation
import confetti from 'canvas-confetti';

// After successful send
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 }
});
```

---

## Time Estimation

| Task | Estimated | Notes |
|------|-----------|-------|
| Backend: `send_reply` function | 30 min | MIME message building, Gmail API |
| Backend: `/gmail/send` endpoint | 15 min | Simple wrapper endpoint |
| Frontend: Enable button + handler | 20 min | State, API call, toasts |
| Polish & testing | 25 min | Animation, error handling, e2e test |
| **Total** | **90 min** | **Medium complexity** |

---

## Rollback Plan

If this feature causes issues:

```bash
# Option 1: Revert specific commits
git revert <commit-hash>
git push

# Option 2: Restore from current stable
git checkout 61f455d  # Current version
```

**Fallback:**
- Remove "Send via Gmail" button (set `disabled={true}`)
- Delete `/gmail/send` endpoint
- Remove `send_reply` function

---

## Success Criteria

- ✅ Users can send email replies with one click
- ✅ Email is properly threaded in Gmail
- ✅ Recipients are correctly identified
- ✅ Success/error feedback is clear
- ✅ Token expiry handled gracefully
- ✅ Works on mobile, tablet, desktop
- ✅ Dark mode compatible
- ✅ Zero breaking changes to existing features
- ✅ No console errors
- ✅ No linter errors

---

## Dependencies

- **Gmail API:** `gmail.send` scope (already granted)
- **Python Libraries:** `email.mime.text`, `base64` (built-in)
- **Frontend Libraries:** All existing (React, framer-motion, react-hot-toast)

---

## Future Enhancements (Out of Scope)

- Schedule send (send later)
- CC/BCC support
- Attachment support
- Rich text formatting (HTML emails)
- Draft saving before send
- Undo send (Gmail API feature)

---

## Commit Message Template

```bash
git commit -m "feat(gmail): add one-click send to Gmail (Feature #2)

FEATURES:
- New POST /gmail/send endpoint
- send_reply() function in gmail service
- Proper MIME message with threading headers
- Extract recipients from original thread
- Send via Gmail API with threadId for threading
- Frontend: Enable 'Send via Gmail' button
- Success/error toasts with clear feedback
- Loading states and confirmation dialog

BACKEND:
- api/services/gmail.py: send_reply() (+80)
- api/main.py: POST /gmail/send endpoint (+30)

FRONTEND:
- web/app/playground/page.tsx: handleSendToGmail() (+40)

ERROR HANDLING:
- Token expiry → 401 with re-auth prompt
- API errors → 500 with details
- User feedback via toasts

Time: 90 minutes
Version: v1.2.0"
```

---

**Status:** 📋 Ready to implement  
**Next Step:** Implement backend `send_reply` function  
**Blocked By:** None

---

**Created:** 2025-11-13  
**Author:** Cursor AI + Derril Filemon

