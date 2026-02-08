# Scroll Issue Debug Log - Consultation Page

## Problem Description

**Symptom:** Mouse wheel scrolling only works when cursor is over the left sidebar. Scrolling does NOT work anywhere on the main content area of `/ai-scribe/consultation` page.

**Specific Observation:**
- During loading overlay: Scrolling works briefly on main content
- After loading overlay disappears: Scrolling stops working on main content
- Sidebar: Always scrolls correctly (has its own scroll container)

---

## Architecture Overview

### Current Scroll Container Structure

```
AppLayout.tsx
└─ <div className="flex min-h-svh md:min-h-dvh">
    ├─ <Sidebar /> (independent scroll container)
    └─ <div className="grid min-h-dvh grid-rows-[auto_1fr_auto]">
        ├─ Header spacer (row 1)
        ├─ <main ref={mainRef} className="min-h-0 overflow-auto overscroll-y-contain"> (row 2 - THE SCROLL CONTAINER)
        │   └─ {children} ← Consultation page renders here
        └─ Footer slot (row 3)
```

**Expected behavior:** The `<main>` element with `overflow-auto` should scroll when content exceeds its height.

**Actual behavior:** Content doesn't create overflow, so there's nothing to scroll.

---

## Attempts Made

### Attempt 1: Remove overflow-y-auto from nested columns (Previous fix by another agent)
**Commit:** f1f6b713 (previous branch)
**Changes:** Removed `overflow-y-auto` from 4 locations in consultation page columns
**Reasoning:** Nested scroll containers were capturing scroll events but couldn't scroll
**Result:** ❌ Still not working

### Attempt 2: Remove h-full from inner containers
**Commit:** 4c908ba3
**Changes:** Removed `h-full` from 10 locations:
- Main clinical documentation area (line 967)
- Large desktop dual-column container (line 971)
- Large desktop left column (line 973)
- Large desktop right column (line 1059)
- Documentation mode sections (lines 1065, 1079)
- Mobile Stack (line 1132)
- Mobile layouts (lines 1137, 1152)
- Tablet Stack (line 1240)

**Reasoning:** `h-full` constraints prevented content from overflowing beyond viewport
**Result:** ❌ Still not working

### Attempt 3: Remove h-full from immediate child of main
**Commit:** cdd24496
**Changes:** Removed `h-full` from line 917
```tsx
// Before
<div className="flex h-full flex-col">

// After
<div className="flex flex-col">
```

**Reasoning:** Immediate child of scroll container had h-full, preventing overflow creation
**Result:** ❌ Still not working

### Attempt 4: Remove min-h-dvh from wrapper div
**Commit:** 8ecc7ee2
**Changes:** Removed `min-h-dvh` from line 925
```tsx
// Before
<div className="flex min-h-dvh flex-col transition-all duration-300 ease-in-out">

// After
<div className="flex flex-col transition-all duration-300 ease-in-out">
```

**Reasoning:** `min-h-dvh` was forcing content to exactly viewport height, preventing overflow
**Result:** ❌ Still not working

---

## Current State of Code

### AppLayout.tsx (Lines 145-153)
```tsx
<main
  ref={mainRef}
  className="min-h-0 overflow-auto overscroll-y-contain"
  style={(isMobile || isTablet)
    ? ({ scrollPaddingBottom: keyboardOpen ? '0px' : 'var(--footer-h, 76px)' } as React.CSSProperties)
    : undefined}
>
  {children}
</main>
```

### Consultation page.tsx (Lines 915-930)
```tsx
return (
  <RecordingAwareSessionContext.Provider value={contextValue}>
    <div className="flex flex-col">
      <SessionModal ... />
      <div className="flex flex-col transition-all duration-300 ease-in-out">
        <Container size="fluid" className="min-h-0">
          <div className="flex min-h-0 flex-col ${...}">
            {/* Content */}
          </div>
        </Container>
      </div>
    </div>
  </RecordingAwareSessionContext.Provider>
);
```

---

## What We've Checked

✅ **Transparent overlays:** No fixed overlays blocking pointer events (only loading overlays when active)
✅ **Container component:** No scroll-blocking CSS (just width constraints and padding)
✅ **Global CSS:** No body/html scroll prevention or touch-action issues
✅ **Fixed/absolute elements:** Only loading overlays (conditionally rendered)
✅ **Nested scroll containers:** Removed all overflow-y-auto from inner elements

---

## Questions to Investigate

1. **Is the main element actually receiving scroll events?**
   - Could test with dev tools event listeners
   - Check if `mainRef.current.scrollHeight > mainRef.current.clientHeight`

2. **Is there a CSS property we're missing?**
   - pointer-events: none?
   - user-select: none?
   - touch-action: none?

3. **Is the grid layout constraining the main element's height?**
   - Grid row `1fr` might be limiting height to viewport
   - Main element might not have scrollable overflow despite overflow-auto

4. **Is content actually tall enough to scroll?**
   - Need to verify content height > viewport height
   - Check computed height of all wrapper divs

5. **Is there JavaScript preventing default scroll behavior?**
   - Event listeners capturing wheel events?
   - Scroll prevention in any components?

6. **Could it be the RecordingAwareSessionContext or other providers?**
   - Provider wrappers affecting layout?

7. **Is the flex layout preventing overflow?**
   - `flex flex-col` might be constraining children?

---

## Next Steps to Try

### Diagnostic Steps
1. Add `console.log` to check actual computed heights
2. Inspect element in browser dev tools to see actual applied CSS
3. Check if scroll events are firing on main element
4. Verify `scrollHeight` vs `clientHeight` of main container
5. Test with a minimal reproduction (simple tall div in main)

### Potential Fixes to Test
1. Add explicit `height: 100%` to html/body in globals.css
2. Change AppLayout grid from `grid-rows-[auto_1fr_auto]` to different approach
3. Add explicit `overflow-y: scroll` instead of `overflow-auto`
4. Remove `overscroll-y-contain` from main element
5. Test if `min-h-0` is causing issues on any element
6. Add `will-change: scroll-position` to main element

---

## Browser/Environment Info Needed
- Which browser? (Chrome, Firefox, Safari?)
- Desktop or mobile?
- Screen size / viewport dimensions?
- Any browser extensions that might interfere?

---

## Files Modified
- `app/(clinical)/ai-scribe/consultation/page.tsx` (multiple commits)
- No changes to `src/shared/components/AppLayout.tsx` yet

## Branch
`cursor/consultation-page-scroll-30c2`
