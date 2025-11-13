# Feature #1: Real-Time Draft Editing - Implementation Plan

**Date:** 2025-11-13  
**Estimated Time:** 90 minutes  
**Priority:** High  
**Complexity:** Moderate

---

## Summary

Add a rich text editor to allow users to edit AI-generated drafts in real-time with live character/word count, copy-to-clipboard functionality, and markdown support. This is a **frontend-only enhancement** with zero backend changes.

---

## Phase 1: Pre-Implementation Analysis

### ❶ Frontend Changes

#### New Components:
- ✅ `web/components/DraftEditor.tsx` - Main editor component with:
  - Textarea with syntax highlighting (or simple textarea)
  - Character count (live)
  - Word count (live)
  - Copy to clipboard button
  - Re-generate button (uses existing `run()` function)
  - Clear/reset button

#### Modified Components:
- ✅ `web/app/playground/page.tsx`:
  - Replace static draft display with `<DraftEditor />`
  - Pass `result.text` as initial value
  - Pass `run()` function for re-generate
  - Maintain existing state management

#### UI/UX Considerations:
- ✅ **Responsive:** Works on mobile, tablet, desktop
- ✅ **Dark Mode:** Compatible with existing theme
- ✅ **Accessibility:** Keyboard shortcuts (Ctrl+C, Ctrl+A, etc.)
- ✅ **Performance:** No re-renders on every keystroke (debounced counts)
- ✅ **Visual Feedback:** Toast on successful copy

#### Design Details:
- Editor height: Auto-grow with content (min: 200px, max: 600px)
- Font: Monospace for better editing (optional)
- Buttons: Primary (Re-generate), Secondary (Copy, Clear)
- Counts: Bottom-right corner, subtle text
- Border: Focus ring on active editing

---

### ❷ Backend Changes

**NONE** ✅

- No new endpoints required
- No existing endpoints modified
- No database changes
- No API changes
- Editor operates purely on client-side state

---

### ❸ External Services Changes

**NONE** ✅

- No Railway configuration changes
- No Supabase changes
- No Redis changes
- No environment variables needed
- No external API integrations

---

### ❹ Breaking Changes Prevention

#### Risk Assessment:

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaks existing draft display | Very Low | High | Don't modify `result.text` structure |
| Performance issues on large drafts | Low | Medium | Use React.memo, debounce counts |
| Copy fails on some browsers | Low | Low | Fallback to manual select + copy |
| Re-generate clears unsaved edits | Medium | Medium | Warn user before re-generating |

#### Guarantees:
- ✅ **Zero backend changes** - No risk to API
- ✅ **Additive only** - New component, doesn't modify existing logic
- ✅ **Existing state preserved** - `result.text` remains unchanged in store
- ✅ **Fallback behavior** - If editor fails, fall back to plain text display
- ✅ **Easy rollback** - Remove `<DraftEditor>`, restore static display

#### Breaking Changes Checklist:
- [ ] Does it modify `useAgent` hook? **NO**
- [ ] Does it change API contracts? **NO**
- [ ] Does it alter existing components? **Only wrapping in editor**
- [ ] Does it change data structures? **NO**
- [ ] Can existing features still work if this fails? **YES**

---

## Implementation Steps

### Step 1: Create DraftEditor Component (30 min)

**File:** `web/components/DraftEditor.tsx`

```typescript
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Copy, RotateCw, Trash2 } from 'lucide-react';

interface DraftEditorProps {
  initialDraft: string;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export function DraftEditor({ initialDraft, onRegenerate, isRegenerating }: DraftEditorProps) {
  const [draft, setDraft] = useState(initialDraft);

  // Update when new draft arrives
  useEffect(() => {
    setDraft(initialDraft);
  }, [initialDraft]);

  // Calculate word and character counts
  const { wordCount, charCount } = useMemo(() => {
    const words = draft.trim().split(/\s+/).filter(Boolean).length;
    const chars = draft.length;
    return { wordCount: words, charCount: chars };
  }, [draft]);

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      toast.success('Draft copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = draft;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast.success('Draft copied to clipboard!');
    }
  };

  // Clear editor
  const handleClear = () => {
    if (confirm('Clear the draft? This cannot be undone.')) {
      setDraft('');
    }
  };

  // Re-generate (warn if edited)
  const handleRegenerate = () => {
    if (draft !== initialDraft) {
      if (!confirm('You have unsaved edits. Re-generate and lose changes?')) {
        return;
      }
    }
    onRegenerate();
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Editor Textarea */}
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="w-full min-h-[200px] max-h-[600px] p-4 rounded-xl border border-border bg-background text-foreground font-mono text-sm focus-visible:ring-2 focus-visible:ring-ring resize-y"
        placeholder="Your AI-generated draft will appear here. You can edit it freely."
      />

      {/* Counts and Actions */}
      <div className="flex items-center justify-between gap-2">
        {/* Counts */}
        <div className="text-xs text-muted-foreground">
          {wordCount} words · {charCount} characters
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleClear}
            disabled={!draft || isRegenerating}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            disabled={!draft}
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
          <Button
            size="sm"
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            <RotateCw className={`h-4 w-4 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
            Re-generate
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**Testing:**
- [ ] Typing updates counts in real-time
- [ ] Copy button works (test fallback on old browser)
- [ ] Clear button prompts confirmation
- [ ] Re-generate warns if draft was edited
- [ ] Textarea auto-grows with content
- [ ] Works in dark mode
- [ ] Responsive on mobile

---

### Step 2: Integrate into Playground (20 min)

**File:** `web/app/playground/page.tsx`

**Changes:**

1. Import `DraftEditor`:
```typescript
import { DraftEditor } from "../../components/DraftEditor";
```

2. Replace static draft display (around line 316):

**BEFORE:**
```typescript
{status === "running" ? <LoaderDots label="Generating" /> : (result?.text || "Your draft will appear here.")}
```

**AFTER:**
```typescript
{status === "running" ? (
  <LoaderDots label="Generating" />
) : result?.text ? (
  <DraftEditor
    initialDraft={result.text}
    onRegenerate={async () => {
      if (!selectedThreadId) return;
      await run({
        input: "",
        meta: { threadId: selectedThreadId, tone, length, bullets },
      });
    }}
    isRegenerating={status === "running"}
  />
) : (
  <p className="text-muted-foreground">Your draft will appear here.</p>
)}
```

**Testing:**
- [ ] Draft loads after generation
- [ ] Re-generate button triggers new draft
- [ ] Edited draft is preserved until re-generate
- [ ] Loading state shows during regeneration
- [ ] Empty state shows when no draft

---

### Step 3: Polish & UX Enhancements (20 min)

**Enhancements:**

1. **Keyboard Shortcuts:**
   - Add `Ctrl+Enter` to re-generate
   - Add `Ctrl+K` to clear
   - Add `Ctrl+Shift+C` to copy

2. **Visual Feedback:**
   - Highlight changed text (if edited from original)
   - Add subtle border glow when focused

3. **Mobile Optimization:**
   - Larger touch targets for buttons
   - Adjust textarea height for mobile

4. **Accessibility:**
   - Add aria-labels to buttons
   - Add keyboard navigation
   - Add screen reader announcements

**Implementation:**
```typescript
// Add to DraftEditor.tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleRegenerate();
    }
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      handleClear();
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      handleCopy();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [draft, initialDraft]);
```

---

### Step 4: Testing (20 min)

#### Test Matrix:

| Test Case | Device | Theme | Status |
|-----------|--------|-------|--------|
| Generate draft → appears in editor | Desktop | Dark | ⏳ |
| Edit draft → counts update | Desktop | Dark | ⏳ |
| Copy button → copies to clipboard | Desktop | Dark | ⏳ |
| Clear button → prompts confirmation | Desktop | Dark | ⏳ |
| Re-generate → warns if edited | Desktop | Dark | ⏳ |
| Keyboard shortcuts work | Desktop | Dark | ⏳ |
| Responsive on mobile | Mobile | Dark | ⏳ |
| Existing features (OAuth, threads) work | Desktop | Dark | ⏳ |

#### Edge Cases:
- [ ] Empty draft (0 words, 0 chars)
- [ ] Very long draft (>5000 words)
- [ ] Draft with special characters
- [ ] Draft with emoji
- [ ] Copy fails (test fallback)
- [ ] Rapid typing (debounced counts)

---

## Time Estimation

| Task | Estimated | Notes |
|------|-----------|-------|
| Create DraftEditor component | 30 min | Core functionality |
| Integrate into Playground | 20 min | Replace static display |
| Polish & UX enhancements | 20 min | Keyboard shortcuts, a11y |
| Testing | 20 min | All devices and edge cases |
| **Total** | **90 min** | **Well-scoped** |

---

## Rollback Plan

If this feature causes issues:

```bash
# Option 1: Revert specific commit
git revert <commit-hash>
git push

# Option 2: Restore from MVP baseline
git checkout e009482  # MVP baseline commit
```

**Fallback Code:**
```typescript
// In playground/page.tsx, restore this:
{result?.text || "Your draft will appear here."}
```

---

## Success Criteria

- ✅ Users can edit AI-generated drafts
- ✅ Word and character counts update in real-time
- ✅ Copy to clipboard works reliably
- ✅ Re-generate button triggers new draft
- ✅ Warning shown if re-generating edited draft
- ✅ Works on mobile, tablet, desktop
- ✅ Dark mode compatible
- ✅ Zero breaking changes to existing features
- ✅ No console errors
- ✅ No linter errors

---

## Dependencies

**None** - Pure frontend enhancement

---

## Future Enhancements (Out of Scope)

- Markdown preview toggle
- Save drafts to local storage
- Undo/redo functionality
- Text formatting toolbar
- Export as PDF

---

## Commit Message Template

```bash
git commit -m "feat(playground): add real-time draft editing with live counts

FEATURES:
- New DraftEditor component with textarea
- Live word/character counts
- Copy to clipboard with fallback
- Re-generate button with unsaved changes warning
- Clear button with confirmation
- Keyboard shortcuts (Ctrl+Enter, Ctrl+K, Ctrl+Shift+C)

UX:
- Auto-growing textarea (200px-600px)
- Responsive design (mobile/tablet/desktop)
- Dark mode compatible
- Accessible (aria-labels, keyboard nav)

FILES:
- web/components/DraftEditor.tsx (new, +150)
- web/app/playground/page.tsx (+15)

Time: 90 minutes
Version: v1.1.0"
```

---

**Status:** 📋 Ready to implement  
**Next Step:** Create `DraftEditor.tsx` component  
**Blocked By:** None

---

**Created:** 2025-11-13  
**Author:** Cursor AI + Derril Filemon

