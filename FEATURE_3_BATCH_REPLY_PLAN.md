# Feature #3: Multi-Thread Batch Reply - Implementation Plan

**Date:** 2025-11-13  
**Estimated Time:** 120 minutes  
**Priority:** Medium  
**Complexity:** Medium-High

---

## Summary

Allow users to select multiple Gmail threads (via checkboxes), then generate AI-powered drafts for all selected threads with a single "Generate Drafts for All" button. Display a progress bar/indicator as drafts are generated sequentially or in parallel. Results are shown in expandable cards for easy review. This is a **power-user feature** that demonstrates async queue handling and provides significant productivity gains.

---

## Phase 1: Pre-Implementation Analysis

### ❶ Frontend Changes

#### Modified Components:
- ✅ `web/app/playground/page.tsx`:
  - Add checkbox to each thread in the list
  - Add "Select All" / "Deselect All" button
  - Add `selectedThreadIds` state (Set<string>)
  - Add "Generate Drafts for All (N)" button (shows count)
  - Add batch generation progress UI (progress bar or counter: "3/10")
  - Display batch results in expandable cards (accordion)
  - Show individual thread status (queued, generating, done, error)

#### New Components (Optional):
- `web/components/BatchProgressBar.tsx`: Progress indicator (optional, could be inline)
- `web/components/BatchResultCard.tsx`: Expandable card for each result (optional)

#### UI/UX Considerations:
- ✅ **Checkboxes:** Appear on left side of each thread item
- ✅ **Select All:** Button above thread list
- ✅ **Batch Button:** Only enabled when 2+ threads selected
- ✅ **Progress Bar:** Linear progress (e.g., "Generating 3 of 10...") or percentage
- ✅ **Individual Status:** Icons (⏳ queued, ⚡ generating, ✅ done, ❌ error)
- ✅ **Results View:** New UI state or overlay showing all generated drafts
- ✅ **Responsive:** Works on mobile, tablet, desktop
- ✅ **Dark Mode:** Compatible with existing theme
- ✅ **Accessibility:** Checkboxes keyboard-accessible, status announced to screen readers

#### Design Details:
- Checkboxes: Standard shadcn/ui checkbox component
- Batch button: Primary color (green or blue)
- Progress: Linear progress bar (shadcn/ui Progress component) or simple text counter
- Results: Accordion or card grid layout
- Each result card: Thread subject, draft preview (first 100 chars), "View Full" / "Edit" / "Send" buttons

---

### ❷ Backend Changes

#### New Endpoint:
- ✅ `POST /agent/run/batch`
  - **Request Body:**
    ```json
    {
      "projectId": "default",
      "threadIds": ["thread1", "thread2", "thread3"],
      "meta": {
        "tone": "friendly",
        "length": 150,
        "bullets": false
      }
    }
    ```
  - **Response:**
    ```json
    {
      "batchId": "batch_abc123",
      "jobIds": ["job1", "job2", "job3"],
      "status": "queued"
    }
    ```

#### New Endpoint (Optional):
- ✅ `GET /agent/batch/{batchId}`
  - **Response:**
    ```json
    {
      "batchId": "batch_abc123",
      "status": "processing",
      "total": 10,
      "completed": 3,
      "failed": 0,
      "results": [
        {
          "jobId": "job1",
          "threadId": "thread1",
          "status": "done",
          "result": { "text": "...", "meta": {...} }
        },
        {
          "jobId": "job2",
          "threadId": "thread2",
          "status": "running",
          "result": null
        }
      ]
    }
    ```

**Alternative Approach (Simpler):**
- Instead of a new `/batch` endpoint, the frontend can call `POST /agent/run` multiple times sequentially or in parallel
- Use existing `GET /jobs/{id}` to poll each job
- Frontend manages batch state (no backend batch tracking)

**Decision:** Use the **simpler approach** (no backend changes needed):
- Frontend calls `POST /agent/run` for each thread
- Frontend tracks batch state locally (`Map<threadId, jobId>`)
- Frontend polls each job independently using existing `/jobs/{id}` endpoint
- **Pros:** Zero backend changes, reuses existing endpoints
- **Cons:** Frontend manages complexity, but acceptable for MVP

---

### ❸ External Services Changes

**NONE** ✅

- No new API keys
- No environment variable changes
- No deployment changes beyond standard redeploy
- No cloud service updates
- Uses existing OpenAI and Gmail APIs (same as single-thread generation)

---

### ❹ Breaking Changes Prevention

#### Risk Assessment:

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Batch generation overloads OpenAI API | Low | Medium | Rate limit: max 5 threads per batch |
| Token costs spike | Medium | Medium | Show estimated cost before starting batch |
| UI freezes during batch processing | Low | High | Use async/await, Promise.all, show progress |
| One failure breaks entire batch | Low | Medium | Catch errors per thread, show partial results |
| Breaks existing single-thread flow | Very Low | High | Pure additive feature |

#### Guarantees:
- ✅ **Additive only** - Batch mode is optional, single-thread flow unchanged
- ✅ **No breaking changes** - Existing endpoints unchanged
- ✅ **Graceful errors** - One thread failure doesn't break batch
- ✅ **Rate limiting** - Cap at 5-10 threads per batch to avoid API overload
- ✅ **Easy rollback** - Remove checkboxes and batch button

#### Breaking Changes Checklist:
- [ ] Does it modify `useAgent` hook? **YES (extends it with `runBatch` function)**
- [ ] Does it change existing API contracts? **NO**
- [ ] Does it alter OAuth flow? **NO**
- [ ] Does it change data structures? **NO** (adds new state, doesn't modify existing)
- [ ] Can existing features still work if this fails? **YES**

---

## Implementation Steps

### Step 1: Frontend - Add Batch State & Checkboxes (30 min)

**File:** `web/app/playground/page.tsx`

**Add State:**
```typescript
const [selectedThreadIds, setSelectedThreadIds] = useState<Set<string>>(new Set());
const [batchStatus, setBatchStatus] = useState<Map<string, "queued" | "running" | "done" | "error">>(new Map());
const [batchResults, setBatchResults] = useState<Map<string, any>>(new Map());
```

**Add Checkbox Toggle:**
```typescript
const toggleThreadSelection = (threadId: string) => {
  setSelectedThreadIds((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(threadId)) {
      newSet.delete(threadId);
    } else {
      newSet.add(threadId);
    }
    return newSet;
  });
};

const selectAllThreads = () => {
  setSelectedThreadIds(new Set(filteredThreads.map((t) => t.id)));
};

const deselectAllThreads = () => {
  setSelectedThreadIds(new Set());
};
```

**Add Checkboxes to Thread List:**
```typescript
import { Checkbox } from "@/components/ui/checkbox";

// In thread list rendering:
<ul className="divide-y divide-border">
  {filteredThreads.map((t) => (
    <motion.li key={t.id} className="flex items-center gap-3 py-3">
      {/* Checkbox */}
      <Checkbox
        checked={selectedThreadIds.has(t.id)}
        onCheckedChange={() => toggleThreadSelection(t.id)}
        aria-label={`Select thread: ${t.subject}`}
      />
      
      {/* Rest of thread item */}
      <div 
        className="flex-1 cursor-pointer"
        onClick={() => {
          setSelectedThreadId(t.id);
          setUi("compose");
        }}
      >
        <div className="text-sm font-medium">{t.subject}</div>
        <div className="text-xs text-muted-foreground">{t.from}</div>
      </div>
    </motion.li>
  ))}
</ul>
```

**Add Select All / Batch Button:**
```typescript
<div className="mb-4 flex items-center justify-between">
  <div className="flex gap-2">
    {filteredThreads.length > 0 && (
      <>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={selectAllThreads}
          disabled={selectedThreadIds.size === filteredThreads.length}
        >
          Select All
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={deselectAllThreads}
          disabled={selectedThreadIds.size === 0}
        >
          Deselect All
        </Button>
      </>
    )}
  </div>
  
  {selectedThreadIds.size >= 2 && (
    <Button onClick={handleBatchGenerate}>
      Generate Drafts for All ({selectedThreadIds.size})
    </Button>
  )}
</div>
```

---

### Step 2: Frontend - Add Batch Generation Logic (40 min)

**File:** `web/app/playground/page.tsx`

**Batch Generation Handler:**
```typescript
const handleBatchGenerate = async () => {
  if (selectedThreadIds.size < 2) {
    toast.error("Please select at least 2 threads.");
    return;
  }

  // Confirm with user
  if (!confirm(`Generate drafts for ${selectedThreadIds.size} threads?`)) {
    return;
  }

  // Initialize batch status
  const initialStatus = new Map<string, "queued" | "running" | "done" | "error">();
  selectedThreadIds.forEach((id) => initialStatus.set(id, "queued"));
  setBatchStatus(initialStatus);

  // Switch to batch results view
  setUi("batchResults");

  // Generate drafts sequentially (to avoid rate limits)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  let completed = 0;

  for (const threadId of Array.from(selectedThreadIds)) {
    try {
      // Update status to running
      setBatchStatus((prev) => new Map(prev).set(threadId, "running"));

      // Call /agent/run
      const response = await fetch(`${apiUrl}/agent/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: 'default',
          input: '',
          meta: { threadId, tone, length, bullets },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start draft generation');
      }

      const { jobId } = await response.json();

      // Poll for result
      const result = await pollForResult(jobId, apiUrl);

      // Update status and result
      setBatchStatus((prev) => new Map(prev).set(threadId, "done"));
      setBatchResults((prev) => new Map(prev).set(threadId, result));

      completed++;
      toast.success(`Draft ${completed} of ${selectedThreadIds.size} completed`);

    } catch (error: any) {
      console.error(`Error generating draft for thread ${threadId}:`, error);
      setBatchStatus((prev) => new Map(prev).set(threadId, "error"));
      toast.error(`Failed to generate draft for thread ${threadId}`);
    }
  }

  toast.success(`Batch complete! ${completed} of ${selectedThreadIds.size} drafts generated.`);
};

// Poll for job result
const pollForResult = async (jobId: string, apiUrl: string, maxAttempts = 30): Promise<any> => {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`${apiUrl}/jobs/${jobId}`);
    if (!response.ok) throw new Error('Failed to check job status');
    
    const job = await response.json();
    
    if (job.status === 'done') {
      return job.result;
    } else if (job.status === 'error') {
      throw new Error(job.error || 'Job failed');
    }
    
    // Wait 2 seconds before next poll
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  
  throw new Error('Job timed out');
};
```

---

### Step 3: Frontend - Add Batch Results UI (30 min)

**File:** `web/app/playground/page.tsx`

**Add New UI State:**
```typescript
type UIState = "hero" | "threadPicker" | "compose" | "result" | "batchResults";
```

**Batch Results View:**
```typescript
<AnimatePresence mode="wait">
  {ui === "batchResults" && (
    <motion.section {...section}>
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold font-display">Batch Results</h2>
          <Button variant="outline" onClick={() => setUi("threadPicker")}>
            Back to Threads
          </Button>
        </div>

        {/* Progress Summary */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">
            {Array.from(batchStatus.values()).filter((s) => s === "done").length} of {batchStatus.size} completed
          </p>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(Array.from(batchStatus.values()).filter((s) => s === "done").length / batchStatus.size) * 100}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-3">
          {Array.from(selectedThreadIds).map((threadId) => {
            const status = batchStatus.get(threadId) || "queued";
            const result = batchResults.get(threadId);
            const thread = threads.find((t) => t.id === threadId);

            return (
              <Card key={threadId} className="p-4">
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div className="mt-1">
                    {status === "queued" && <span className="text-muted-foreground">⏳</span>}
                    {status === "running" && <RefreshCw className="h-4 w-4 animate-spin text-primary" />}
                    {status === "done" && <span className="text-green-500">✅</span>}
                    {status === "error" && <span className="text-red-500">❌</span>}
                  </div>

                  {/* Thread Info */}
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{thread?.subject || "Unknown Thread"}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{thread?.from || ""}</p>

                    {/* Draft Preview */}
                    {result && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {result.text.substring(0, 150)}...
                        </p>
                        <div className="mt-2 flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedThreadId(threadId);
                              // Set result in useAgent hook (would need to extend hook)
                              setUi("result");
                            }}
                          >
                            View Full
                          </Button>
                          <Button 
                            size="sm"
                            onClick={async () => {
                              // Send this draft
                              await handleSendToGmail(); // Would need to pass threadId and result.text
                            }}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {status === "error" && (
                      <p className="text-xs text-red-500 mt-2">Failed to generate draft</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
    </motion.section>
  )}
</AnimatePresence>
```

---

### Step 4: Polish & Testing (20 min)

**Enhancements:**

1. **Parallel Processing (Optional):**
   - Generate up to 3 drafts in parallel using `Promise.allSettled`
   - Balance between speed and rate limits

2. **Estimated Cost (Optional):**
   - Calculate tokens per draft (~500 tokens average)
   - Show estimated cost before starting batch (e.g., "$0.15 for 10 drafts")

3. **Cancel Batch (Optional):**
   - Add "Cancel" button during batch processing
   - Stop remaining threads from being processed

4. **Export All Drafts (Optional):**
   - Add "Export All" button to download all drafts as JSON or text file

**Implementation (Parallel Processing):**
```typescript
// Process in batches of 3
const BATCH_SIZE = 3;
const threadArray = Array.from(selectedThreadIds);

for (let i = 0; i < threadArray.length; i += BATCH_SIZE) {
  const batch = threadArray.slice(i, i + BATCH_SIZE);
  
  await Promise.allSettled(
    batch.map(async (threadId) => {
      // ... generation logic for each thread
    })
  );
}
```

---

## Time Estimation

| Task | Estimated | Notes |
|------|-----------|-------|
| Add batch state & checkboxes | 30 min | State, checkbox UI, select all |
| Add batch generation logic | 40 min | Async loop, polling, error handling |
| Add batch results UI | 30 min | Progress bar, results cards |
| Polish & testing | 20 min | Parallel processing, edge cases |
| **Total** | **120 min (2 hours)** | **Medium-High complexity** |

---

## Rollback Plan

If this feature causes issues:

```bash
# Option 1: Revert specific commits
git revert <commit-hash>
git push

# Option 2: Hotfix (disable batch mode)
# Remove checkboxes from thread list
# Remove "Select All" and "Generate Drafts for All" buttons
# Remove batchResults UI state
```

**Fallback:**
- Remove checkboxes from thread items
- Remove batch state (`selectedThreadIds`, `batchStatus`, `batchResults`)
- Remove batch generation handler
- Remove batch results UI
- Single-thread flow remains intact

---

## Success Criteria

- ✅ Users can select multiple threads via checkboxes
- ✅ "Generate Drafts for All" button appears when 2+ threads selected
- ✅ Batch generation starts and shows progress
- ✅ Individual thread status visible (queued, running, done, error)
- ✅ Drafts appear in results view with preview
- ✅ Users can view, edit, or send individual drafts from batch results
- ✅ One thread failure doesn't break entire batch
- ✅ Works on mobile, tablet, desktop
- ✅ Dark mode compatible
- ✅ Zero breaking changes to existing features
- ✅ No console errors
- ✅ No linter errors

---

## Dependencies

- **shadcn/ui Checkbox:** Add if not already in project
- **Lucide React Icons:** `RefreshCw` (already in project), `Send` (already in project)
- **No New Backend Dependencies:** Reuses existing endpoints

---

## Future Enhancements (Out of Scope)

- **Parallel Processing:** Generate up to 3-5 drafts simultaneously
- **Cancel Batch:** Stop batch processing mid-way
- **Resume Batch:** Save batch state and resume later
- **Export All:** Download all drafts as JSON/CSV/text file
- **Batch Send:** Send all drafts with one click
- **Smart Prioritization:** Generate urgent threads first
- **Cost Estimation:** Show estimated OpenAI cost before starting
- **Backend Batch Endpoint:** Dedicated `/agent/run/batch` for server-side queue management

---

## Commit Message Template

```bash
git commit -m "feat(batch): add multi-thread batch reply generation (Feature #3)

FEATURES:
- Checkboxes on each thread for selection
- Select All / Deselect All buttons
- 'Generate Drafts for All (N)' button
- Sequential batch processing with progress tracking
- Individual thread status indicators (⏳ ⚡ ✅ ❌)
- Batch results view with draft previews
- View/Send individual drafts from batch results
- Graceful error handling (partial results shown)

FRONTEND:
- web/app/playground/page.tsx: batch state, handlers, UI (+180)

UX:
- Responsive design (mobile/tablet/desktop)
- Dark mode compatible
- Real-time progress updates
- Partial success handling

Time: 120 minutes
Version: v1.4.0"
```

---

**Status:** 📋 Ready to implement  
**Next Step:** Add checkbox state and UI to thread list  
**Blocked By:** None

---

**Created:** 2025-11-13  
**Author:** Cursor AI + Derril Filemon

---

## API Testing URLs

For testing during implementation:
- **API Server:** https://api-production-192f.up.railway.app/
- **Web App:** https://web-production-5e03f.up.railway.app/

