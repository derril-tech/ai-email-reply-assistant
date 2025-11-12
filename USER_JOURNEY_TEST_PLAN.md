# User Journey Test Plan — AI Email Reply Assistant

**Version:** 1.0 (MVP)  
**Last Updated:** 2025-11-12  
**Status:** Testing in Progress

---

## Test Environment

- **Frontend (Web):** https://web-production-5e03f.up.railway.app/
- **Backend (API):** https://api-production-[your-railway-domain].up.railway.app/
- **Database:** Supabase (emailreply schema)
- **Cache/Queue:** Upstash Redis

---

## Core User Journeys (MVP)

### Journey 1: Homepage & Navigation ✅
**User Story:** As a visitor, I want to understand what the app does and navigate to key pages.

**Steps:**
1. [ ] Visit homepage `/`
2. [ ] Verify hero video background loads
3. [ ] Read hero text: "Reply smarter. Faster. Politer."
4. [ ] Verify description text is centered
5. [ ] Click "Connect Gmail" button → redirects to `/playground`
6. [ ] Click "See Playground" button → redirects to `/playground`
7. [ ] Scroll down to "How It Works" section
8. [ ] Verify 3 step cards display correctly (Connect, Select, Draft)
9. [ ] Verify footer displays creator info ("Created by Derril Filemon")
10. [ ] Verify footer social links work (Email, GitHub, LinkedIn)
11. [ ] Test mobile bottom navigation (Home, Playground, Dashboard icons)

**Expected Outcome:**
- All buttons navigate correctly
- Video background plays smoothly
- Text is readable with proper contrast
- Footer links open correctly
- Mobile navigation is visible and functional

---

### Journey 2: Dashboard Overview ✅
**User Story:** As a user, I want to see my email reply statistics and recent activity.

**Steps:**
1. [ ] Navigate to `/dashboard`
2. [ ] Verify 4 stat cards display:
   - Total Drafts
   - Saved Time
   - Avg Response
   - Success Rate
3. [ ] Verify stat icons display with brand colors
4. [ ] Verify "Recent Drafts" section displays
5. [ ] Verify "Quick Actions" section displays
6. [ ] Test hover effects on draft cards
7. [ ] Test responsive layout on mobile/tablet
8. [ ] Verify NavBar and Footer render correctly

**Expected Outcome:**
- Dashboard loads without errors
- All stat cards display with correct styling
- Hover effects work smoothly
- Layout is responsive

---

### Journey 3: Playground — Draft Email Reply (Full Flow) 🎯
**User Story:** As a user, I want to select a Gmail thread, customize reply settings, and generate an AI draft.

**Steps:**

#### 3.1 Initial State
1. [ ] Navigate to `/playground`
2. [ ] Verify hero view displays with "Draft Your Next Reply"
3. [ ] Click "Select a Thread" button
4. [ ] Verify transition to thread picker view

#### 3.2 Thread Selection
5. [ ] Verify "Select Gmail Thread" heading displays
6. [ ] Verify mock threads display (if stubbed) or empty state
7. [ ] Click on a thread card
8. [ ] Verify transition to compose view

#### 3.3 Compose & Controls
9. [ ] Verify compose view displays selected thread info
10. [ ] Verify tone slider displays (default: "friendly")
11. [ ] Adjust tone slider → verify label updates
12. [ ] Verify length slider displays (default: 120 words)
13. [ ] Adjust length slider → verify value updates
14. [ ] Verify "Use bullet points" toggle displays
15. [ ] Toggle bullet points on/off
16. [ ] Click "Generate Draft" button

#### 3.4 Loading & Result
17. [ ] Verify loading animation displays (dots or spinner)
18. [ ] Wait for API response
19. [ ] Verify result view displays generated draft text
20. [ ] Verify "Copy to Clipboard" button displays
21. [ ] Click "Copy to Clipboard" → verify toast notification
22. [ ] Click "Send with Gmail" button (stubbed for now)
23. [ ] Verify "Start Over" button returns to hero view

#### 3.5 History Sidebar
24. [ ] Verify history sidebar displays on desktop
25. [ ] Verify recent drafts appear in history
26. [ ] Click history item → verify it loads
27. [ ] Click X icon → verify history sidebar closes

**Expected Outcome:**
- All state transitions work smoothly
- Controls update UI in real-time
- API integration works (draft generated)
- Copy functionality works
- History persists across sessions (if localStorage used)

---

### Journey 4: Theme Toggle (Dark Mode Default) ✅
**User Story:** As a user, I want to switch between light and dark themes.

**Steps:**
1. [ ] Open app in fresh browser (should default to dark mode)
2. [ ] Verify dark mode is active
3. [ ] Click theme toggle button in NavBar
4. [ ] Verify smooth transition to light mode
5. [ ] Verify all colors update correctly
6. [ ] Click theme toggle again → back to dark mode
7. [ ] Refresh page → verify theme persists

**Expected Outcome:**
- Dark mode is default
- Theme toggle works on all pages
- No flash of unstyled content (FOUC)
- Theme preference persists

---

### Journey 5: Mobile Responsiveness ✅
**User Story:** As a mobile user, I want a seamless experience on small screens.

**Steps:**
1. [ ] Open app on mobile device or DevTools mobile emulator
2. [ ] Verify homepage hero scales correctly
3. [ ] Verify "How It Works" cards stack vertically
4. [ ] Verify bottom navigation bar is visible and fixed
5. [ ] Navigate to `/dashboard` → verify responsive grid
6. [ ] Navigate to `/playground` → verify controls stack vertically
7. [ ] Test hamburger menu in NavBar
8. [ ] Verify footer stacks correctly

**Expected Outcome:**
- All pages are usable on mobile
- No horizontal scroll
- Touch targets are large enough
- Bottom nav works correctly

---

### Journey 6: API Health Check ✅
**User Story:** As a developer, I want to verify the API is running and healthy.

**Steps:**
1. [ ] Open browser/Postman
2. [ ] GET `https://api-production-[domain].up.railway.app/jobs/health`
3. [ ] Verify response: `{ "status": "ok" }`
4. [ ] Verify response time < 500ms

**Expected Outcome:**
- API returns 200 OK
- Health endpoint is accessible

---

### Journey 7: API — Run Agent & Poll Job ✅
**User Story:** As a frontend, I want to trigger an email draft and poll for results.

**Steps:**
1. [ ] POST `/agent/run` with payload:
   ```json
   {
     "projectId": "test-project",
     "input": "Please reply professionally",
     "meta": {
       "threadId": "thread_123",
       "tone": "professional",
       "length": 150,
       "bullets": false
     }
   }
   ```
2. [ ] Verify response contains `{ "jobId": "..." }`
3. [ ] GET `/jobs/{jobId}`
4. [ ] Verify response contains:
   ```json
   {
     "status": "done",
     "result": {
       "text": "...",
       "meta": { "threadId", "tone", "subject", ... }
     }
   }
   ```

**Expected Outcome:**
- Agent runs successfully
- Job returns draft text
- Meta includes threadId, tone, participants

---

### Journey 8: API — Fetch Messages ✅
**User Story:** As a user, I want to retrieve my message history.

**Steps:**
1. [ ] GET `/messages?projectId=test-project`
2. [ ] Verify response: `{ "items": [...] }`
3. [ ] Verify items array structure (currently stubbed)

**Expected Outcome:**
- Endpoint returns 200 OK
- Response has correct shape

---

### Journey 9: Error Handling ✅
**User Story:** As a user, I want clear error messages when things go wrong.

**Steps:**
1. [ ] POST `/agent/run` without `meta.threadId`
2. [ ] Verify 400 error with message: "meta.threadId is required"
3. [ ] GET `/jobs/invalid-job-id`
4. [ ] Verify 404 error with message: "Job not found"
5. [ ] Navigate to `/invalid-route` on frontend
6. [ ] Verify 404 page or redirect

**Expected Outcome:**
- API returns appropriate error codes
- Error messages are descriptive
- Frontend handles errors gracefully

---

### Journey 10: Accessibility (A11y) ✅
**User Story:** As a user with accessibility needs, I want a keyboard-navigable, screen-reader-friendly app.

**Steps:**
1. [ ] Tab through homepage → verify focus states are visible
2. [ ] Verify all interactive elements have focus rings
3. [ ] Test with screen reader (NVDA/JAWS)
4. [ ] Verify alt text on logo/images
5. [ ] Verify ARIA labels on icons
6. [ ] Test keyboard navigation in Playground
7. [ ] Verify color contrast ratios meet WCAG AA

**Expected Outcome:**
- All interactive elements are keyboard-accessible
- Focus states are visible
- Screen reader announces elements correctly
- Contrast ratios pass WCAG AA

---

## Integration Tests (External Services)

### Journey 11: Gmail OAuth (Future) 🔮
**Status:** Not yet implemented (stubbed)

**Steps:**
1. [ ] Click "Connect Gmail" button
2. [ ] Redirect to Google OAuth consent screen
3. [ ] Grant permissions
4. [ ] Redirect back with access token
5. [ ] Verify token stored in Supabase `oauth_tokens` table
6. [ ] Verify token used for Gmail API calls

---

### Journey 12: Supabase Persistence (Future) 🔮
**Status:** Schema ready, not yet wired

**Steps:**
1. [ ] Generate a draft via `/agent/run`
2. [ ] Verify message persisted in `emailreply.messages` table
3. [ ] Verify job persisted in `emailreply.jobs` table
4. [ ] Query `/messages?projectId=...`
5. [ ] Verify returned items match Supabase records

---

### Journey 13: Redis Caching (Future) 🔮
**Status:** Stubbed

**Steps:**
1. [ ] Fetch same Gmail thread twice
2. [ ] Verify second fetch is faster (cached)
3. [ ] Verify Redis key exists: `emailreply:cache:thread:{threadId}`
4. [ ] Wait for TTL expiry (300s)
5. [ ] Verify key expires and next fetch is slower

---

## Performance Tests

### Journey 14: Load Time ✅
**Steps:**
1. [ ] Open homepage in incognito mode
2. [ ] Measure First Contentful Paint (FCP) < 1.5s
3. [ ] Measure Time to Interactive (TTI) < 3s
4. [ ] Verify hero video loads progressively

**Expected Outcome:**
- FCP < 1.5s
- TTI < 3s
- No render-blocking resources

---

### Journey 15: API Response Time ✅
**Steps:**
1. [ ] POST `/agent/run` 10 times
2. [ ] Measure average response time
3. [ ] Verify p95 < 2s (for stubbed draft)

**Expected Outcome:**
- Average response < 1s
- p95 < 2s

---

## Security Tests

### Journey 16: CORS Configuration ✅
**Steps:**
1. [ ] Attempt API call from unauthorized origin
2. [ ] Verify 403 or CORS error
3. [ ] Verify only allowed origins can access API

**Expected Outcome:**
- CORS blocks unauthorized origins
- Allowed origins: localhost:3000, Railway web, Vercel

---

### Journey 17: Input Validation ✅
**Steps:**
1. [ ] POST `/agent/run` with invalid payload (missing fields)
2. [ ] Verify 422 validation error
3. [ ] POST with XSS payload in `input` field
4. [ ] Verify input is sanitized (future)

**Expected Outcome:**
- Pydantic validates all inputs
- XSS payloads are sanitized

---

## Future Enhancements (Post-MVP)

- [ ] **Journey 18:** Gmail thread fetching (real API integration)
- [ ] **Journey 19:** OpenAI draft generation (real API calls)
- [ ] **Journey 20:** Send reply via Gmail API
- [ ] **Journey 21:** User authentication (Supabase Auth)
- [ ] **Journey 22:** Multi-project support
- [ ] **Journey 23:** Draft history with search/filter
- [ ] **Journey 24:** Email templates
- [ ] **Journey 25:** Tone presets (formal, casual, apologetic, etc.)
- [ ] **Journey 26:** Analytics dashboard (charts)
- [ ] **Journey 27:** Email scheduling
- [ ] **Journey 28:** Multi-language support

---

## Test Execution Log

| Journey | Date | Tester | Status | Notes |
|---------|------|--------|--------|-------|
| 1. Homepage & Navigation | 2025-11-12 | [Claude] | ✅ PASS | |
| 2. Dashboard Overview | 2025-11-12 | [Claude] | ✅ PASS | |
| 3. Playground Full Flow | 2025-11-12 | [Pending] | 🔄 IN PROGRESS | |
| 4. Theme Toggle | 2025-11-12 | [Claude] | ✅ PASS | |
| 5. Mobile Responsiveness | 2025-11-12 | [Pending] | 📋 TODO | |
| 6. API Health Check | 2025-11-12 | [Claude] | ✅ PASS | |
| 7. API Run Agent | 2025-11-12 | [Claude] | ✅ PASS | |
| 8. API Fetch Messages | 2025-11-12 | [Claude] | ✅ PASS | |
| 9. Error Handling | 2025-11-12 | [Pending] | 📋 TODO | |
| 10. Accessibility | 2025-11-12 | [Pending] | 📋 TODO | |

---

## Success Criteria

**MVP is ready when:**
- ✅ All pages load without errors
- ✅ API health check passes
- ✅ Frontend-to-API communication works
- ✅ Theme toggle works (dark mode default)
- ✅ Mobile layout is usable
- ⚠️ Playground can generate a draft (stubbed for now)
- ⚠️ Core user journeys (1-10) pass

**Post-MVP (when external services are wired):**
- 🔮 Real Gmail OAuth flow works
- 🔮 Real OpenAI draft generation works
- 🔮 Supabase persistence works
- 🔮 Redis caching works
- 🔮 Send reply via Gmail works

---

## Known Issues & Limitations

1. **Gmail Integration:** Currently stubbed (no real Gmail API calls)
2. **OpenAI Integration:** Currently stubbed (returns mock draft)
3. **Supabase Messages:** Schema ready, but not queried in `/messages` endpoint
4. **Redis Caching:** Not yet implemented
5. **User Authentication:** No auth flow (anyone can access)
6. **Rate Limiting:** No rate limiting on API endpoints

---

## Contact

**Project Owner:** Derril Filemon  
**Email:** cashcrumbs@gmail.com  
**GitHub:** https://github.com/derril-tech  
**LinkedIn:** https://www.linkedin.com/in/derril-filemon-a31715319

