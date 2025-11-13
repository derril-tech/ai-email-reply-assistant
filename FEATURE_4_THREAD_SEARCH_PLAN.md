# Feature #4: Thread Search & Filters - Implementation Plan

**Date:** 2025-11-13  
**Estimated Time:** 45 minutes  
**Priority:** Medium  
**Complexity:** Low

---

## Summary

Add a search bar and filter options to the thread list in the Playground, allowing users to quickly find specific threads by subject, sender, or Gmail labels. This is a **frontend-only** feature using client-side filtering with `useMemo` for performance.

---

## Phase 1: Pre-Implementation Analysis

### ❶ Frontend Changes

#### Modified Components:
- ✅ `web/app/playground/page.tsx`:
  - Add search input above thread list
  - Add `searchQuery` state
  - Add `useMemo` to filter threads based on search
  - Optionally add label filter dropdown (if labels are available)

#### New Components (Optional):
- `web/components/ThreadSearch.tsx`: Standalone search bar component (optional, could be inline)

#### UI/UX Considerations:
- ✅ **Search Input:** 
  - Placeholder: "Search threads by subject or sender..."
  - Icon: Magnifying glass (from lucide-react)
  - Clear button when text is present
- ✅ **Instant Filtering:** No debounce needed for small datasets (<100 threads)
- ✅ **Case-Insensitive:** Search should be case-insensitive
- ✅ **Responsive:** Works on mobile, tablet, desktop
- ✅ **Dark Mode:** Compatible with existing theme
- ✅ **Accessibility:** Proper `aria-label` for search input

#### Design Details:
- Search bar positioned above thread list (below "Select a Thread" header)
- Results count: "Showing 5 of 20 threads"
- Empty state: "No threads match your search." with a clear search button
- Highlight matching text (optional, advanced)

---

### ❷ Backend Changes

**NONE** ✅

This feature is purely client-side. All filtering is done on the already-fetched threads array using JavaScript.

**Future Enhancement (Out of Scope):**
- Backend could accept `?search=query` and `?label=INBOX` params to filter server-side
- Useful for large datasets (>1000 threads)
- For MVP, client-side is sufficient

---

### ❸ External Services Changes

**NONE** ✅

- No new API keys
- No environment variable changes
- No deployment changes beyond standard frontend redeploy
- No cloud service updates

---

### ❹ Breaking Changes Prevention

#### Risk Assessment:

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Search slows down UI (large thread lists) | Very Low | Low | Use `useMemo` for efficient filtering |
| Breaks existing thread selection | Very Low | Medium | Don't modify thread list rendering, only filter data |
| Search doesn't match expected results | Low | Low | Test with various queries |
| Mobile keyboard covers search input | Low | Low | Ensure proper viewport/scroll behavior |

#### Guarantees:
- ✅ **Additive only** - No modifications to existing thread list logic
- ✅ **No breaking changes** - Thread selection, generation, and send all unchanged
- ✅ **Zero dependencies** - No new npm packages
- ✅ **Performance-optimized** - `useMemo` ensures filtering only runs when needed
- ✅ **Easy rollback** - Remove search input, remove filter logic

#### Breaking Changes Checklist:
- [ ] Does it modify thread fetching? **NO**
- [ ] Does it change thread selection behavior? **NO**
- [ ] Does it alter API contracts? **NO**
- [ ] Does it change data structures? **NO**
- [ ] Can existing features still work if this fails? **YES**

---

## Implementation Steps

### Step 1: Add Search State (5 min)

**File:** `web/app/playground/page.tsx`

```typescript
// Add search state
const [searchQuery, setSearchQuery] = useState<string>("");
```

---

### Step 2: Add Filtered Threads Logic (10 min)

**File:** `web/app/playground/page.tsx`

```typescript
// Filter threads based on search query
const filteredThreads = useMemo(() => {
  if (!searchQuery.trim()) {
    return threads; // No search query, return all threads
  }
  
  const lowerQuery = searchQuery.toLowerCase();
  
  return threads.filter((thread) => {
    const subject = thread.subject?.toLowerCase() || "";
    const from = thread.from?.toLowerCase() || "";
    const snippet = thread.snippet?.toLowerCase() || "";
    
    return (
      subject.includes(lowerQuery) ||
      from.includes(lowerQuery) ||
      snippet.includes(lowerQuery)
    );
  });
}, [threads, searchQuery]);
```

**Replace all instances of `threads` in rendering with `filteredThreads`:**
```typescript
// Before:
{threads.map((thread) => ...)}

// After:
{filteredThreads.map((thread) => ...)}
```

---

### Step 3: Add Search Input UI (15 min)

**File:** `web/app/playground/page.tsx`

**Insert before the thread list:**

```typescript
import { Search, X } from "lucide-react";

// Inside the threadPicker section, before the thread list
<div className="mb-4">
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      type="text"
      placeholder="Search threads by subject or sender..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-10 pr-10"
      aria-label="Search threads"
    />
    {searchQuery && (
      <button
        onClick={() => setSearchQuery("")}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Clear search"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
  
  {/* Results count */}
  <p className="mt-2 text-xs text-muted-foreground">
    {searchQuery && (
      <>
        Showing {filteredThreads.length} of {threads.length} thread{threads.length !== 1 ? 's' : ''}
      </>
    )}
  </p>
</div>
```

---

### Step 4: Add Empty State (10 min)

**File:** `web/app/playground/page.tsx`

**Inside the thread list rendering, before the `.map()`:**

```typescript
{filteredThreads.length === 0 && searchQuery ? (
  <div className="p-6 text-center">
    <p className="text-sm text-muted-foreground mb-4">
      No threads match "{searchQuery}"
    </p>
    <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
      Clear Search
    </Button>
  </div>
) : filteredThreads.length === 0 && !searchQuery ? (
  <EmptyState
    title="No threads found"
    description="Connect Gmail to see your inbox threads."
  />
) : (
  filteredThreads.map((thread) => (
    // ... existing thread rendering
  ))
)}
```

---

### Step 5: Polish & Testing (5 min)

**Enhancements:**

1. **Keyboard Shortcut:**
   - Add `Ctrl+F` or `Cmd+F` to focus search input
   - Add `Escape` to clear search

2. **Search Icon Animation:**
   - Pulse animation while typing (optional)

3. **Highlight Matching Text (Advanced, Optional):**
   - Use regex to wrap matching text in `<mark>` tags
   - Requires more complex rendering logic

**Implementation (Keyboard Shortcuts):**

```typescript
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Focus search input with Ctrl+F / Cmd+F
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      event.preventDefault();
      document.getElementById('thread-search')?.focus();
    }
    
    // Clear search with Escape
    if (event.key === 'Escape' && searchQuery) {
      setSearchQuery("");
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [searchQuery]);
```

---

## Time Estimation

| Task | Estimated | Notes |
|------|-----------|-------|
| Add search state | 5 min | One line of state |
| Add filtered threads logic | 10 min | `useMemo` with filter |
| Add search input UI | 15 min | Input + icons + styling |
| Add empty state | 10 min | Conditional rendering |
| Polish & testing | 5 min | Keyboard shortcuts, edge cases |
| **Total** | **45 min** | **Low complexity** |

---

## Rollback Plan

If this feature causes issues:

```bash
# Option 1: Revert specific commits
git revert <commit-hash>
git push

# Option 2: Comment out search UI (hotfix)
# Remove search input from playground/page.tsx
# Remove filteredThreads logic
# Restore `threads.map()` instead of `filteredThreads.map()`
```

**Fallback:**
- Remove search input div
- Remove `searchQuery` state
- Remove `filteredThreads` useMemo
- Restore `threads.map()`

---

## Success Criteria

- ✅ Users can type in search input
- ✅ Thread list filters instantly (no lag)
- ✅ Search is case-insensitive
- ✅ Search matches subject, sender, and snippet
- ✅ Results count displayed
- ✅ Empty state shown when no matches
- ✅ Clear button (X) works
- ✅ Keyboard shortcuts work (Ctrl+F, Escape)
- ✅ Works on mobile, tablet, desktop
- ✅ Dark mode compatible
- ✅ Zero breaking changes to existing features
- ✅ No console errors
- ✅ No linter errors

---

## Dependencies

- **Lucide React Icons:** `Search`, `X` (already in project)
- **shadcn/ui Input:** Already in project
- **No New Dependencies:** ✅

---

## Future Enhancements (Out of Scope)

- **Label Filters:** Dropdown to filter by Gmail labels (Inbox, Sent, Important, etc.)
- **Date Range Filter:** Datepicker to filter threads by date
- **Advanced Search:** Regex or boolean operators (AND, OR, NOT)
- **Search Highlighting:** Highlight matching text in yellow
- **Saved Searches:** Save common search queries
- **Backend Search:** Server-side filtering for large datasets (>1000 threads)

---

## Commit Message Template

```bash
git commit -m "feat(threads): add search and filter functionality (Feature #4)

FEATURES:
- Search input above thread list
- Instant client-side filtering (useMemo)
- Case-insensitive search (subject, sender, snippet)
- Results count display
- Empty state with 'Clear Search' button
- Clear button (X) in search input
- Keyboard shortcuts: Ctrl+F (focus), Escape (clear)

FRONTEND:
- web/app/playground/page.tsx: searchQuery state, filteredThreads useMemo (+40)

UX:
- Responsive design (mobile/tablet/desktop)
- Dark mode compatible
- Instant feedback (no debounce needed)

Time: 45 minutes
Version: v1.3.0"
```

---

**Status:** 📋 Ready to implement  
**Next Step:** Implement search state and filtering logic  
**Blocked By:** None

---

**Created:** 2025-11-13  
**Author:** Cursor AI + Derril Filemon

