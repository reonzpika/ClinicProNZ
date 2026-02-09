# Scroll Issue Debug Log - Consultation Page

## Problem Description

**Symptom:** Mouse wheel scrolling only works when cursor is over the left sidebar. Scrolling does NOT work anywhere on the main content area of `/ai-scribe/consultation` page.

**Specific Observations:**
- During loading overlay: Scrolling works briefly on main content
- After loading overlay disappears: Scrolling stops working on main content
- Sidebar: Always scrolls correctly (has its own scroll container)
- **CRITICAL: Scrolling WORKS when mouse is on the actual scrollbar (right edge)** ← This means scroll container IS working!
- **CRITICAL: Scrolling DOES NOT WORK when mouse is over the main content area** ← Something is blocking wheel events!

**This tells us:**
- ✅ The scroll container has overflow (scrollbar is visible)
- ✅ The scrolling mechanism works (can scroll via scrollbar)
- ❌ Mouse wheel events are being blocked/captured on the content area
- **Conclusion: This is NOT a CSS layout issue - it's an event blocking issue!**

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

## NEW HYPOTHESIS (Based on Scrollbar Working)

**The scroll container is working correctly!** The issue is that wheel events are being blocked on the content area.

Possible causes:
1. **Transparent overlay** covering the content area
2. **JavaScript event listener** capturing wheel/scroll events and preventing default
3. **pointer-events: none** on content elements
4. **touch-action: none** preventing scroll gestures
5. **Fixed/absolute positioned element** with high z-index covering content
6. **React component** capturing wheel events (modal, overlay, etc.)

## Next Steps to Try

### PRIORITY 1: Find Event Blocking Source
1. ✅ Check for transparent overlays with z-index
2. ✅ Search for wheel event listeners in code
3. ✅ Search for scroll event preventDefault calls
4. ✅ Check for pointer-events CSS on content
5. ✅ Check for touch-action CSS
6. Check React components that might capture events (modals, providers, etc.)

### PRIORITY 2: Test Fixes
1. Add `pointer-events: auto !important` to main content
2. Remove any wheel/scroll event listeners
3. Check if loading overlay is still mounted (hidden but blocking)
4. Test with all conditional overlays disabled

---

## Analysis & Plan

### KEY INSIGHT FROM USER FEEDBACK
**Scrolling WORKS on:**
- Left sidebar ✅
- Right scrollbar (actual scrollbar element) ✅  
- Main content DURING loading overlay ✅

**Scrolling DOES NOT WORK on:**
- Main content area AFTER loading completes ❌

**This means:**
1. The scroll container IS working (scrollbar is present and functional)
2. The content DOES have overflow (otherwise no scrollbar)
3. Something about the RENDERED CONTENT is blocking wheel events
4. The loading overlay itself doesn't block (scrolling works with it shown)

### HYPOTHESIS
After the loading overlay disappears, the fully-rendered consultation page content contains something that's capturing or blocking wheel events. Possibilities:
1. A component with wheel event listener that prevents default
2. A transparent element with high z-index over content
3. CSS property on rendered content blocking pointer events
4. React component interfering with events (provider, portal, etc.)

### NEXT DIAGNOSTIC STEPS
1. ✅ Enhanced console logging to check:
   - pointer-events CSS on all levels
   - Actual wheel event firing (attach test listener)
   - Boot loading state
2. User to test and provide console output
3. Based on output, identify which component/element is blocking
4. Apply targeted fix

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
