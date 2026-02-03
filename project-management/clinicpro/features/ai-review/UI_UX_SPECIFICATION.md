# UI/UX Specification - AI Clinical Review Feature

## Visual Layout Overview

This document specifies EXACTLY where the AI Review feature appears and how it behaves.

---

## 1. BUTTON PLACEMENT - Left Sidebar

### Location
The AI Review button appears in the **LEFT COLUMN** of the consultation interface, next to existing clinical tools.

```
┌─────────────────────────┐
│ 📋 Patient Info         │
│ Date: 03/02/2026        │
│ Switch Session ▼        │
├─────────────────────────┤
│ Template: SOAP          │
│ Input: Audio            │
├─────────────────────────┤
│ [📷] [📄] [✨]          │ ← HERE: Camera, Referral, AI Review
├─────────────────────────┤
│                         │
│ (Rest of left sidebar)  │
│                         │
└─────────────────────────┘
```

### Visual Style
- **Icon**: ✨ Sparkles icon (from lucide-react)
- **Size**: 40px × 40px (matches camera/referral icons)
- **Background**: 
  - Enabled: `bg-blue-50 text-blue-600`
  - Disabled: `bg-gray-100 text-gray-400`
  - Hover: `hover:bg-blue-100`
- **Shape**: Rounded square (same as other icons)

### States
1. **Disabled** (no consultation content): Gray, not clickable
2. **Enabled** (has consultation content): Blue, clickable
3. **Active** (module selection open): Highlighted

---

## 2. MODULE SELECTION PANEL - Below Button

When the AI Review button is clicked, a panel appears **BELOW the button** in the left column.

```
┌─────────────────────────┐
│ [📷] [📄] [✨]          │ ← Button clicked
├─────────────────────────┤
│ ┌─ Select Review Type ─┐│ ← Panel appears here
│ │                       ││
│ │ [🚩 Red Flags        ]││
│ │     Scanner           ││
│ │                       ││
│ │ [🔬 Differential     ]││
│ │     Diagnosis         ││
│ │                       ││
│ │ [🧪 Investigation    ]││
│ │     Advisor           ││
│ │                       ││
│ │ [💊 Management       ]││
│ │     Review            ││
│ │                       ││
│ └───────────────────────┘│
└─────────────────────────┘
```

### Visual Style
- **Container**: White background, border, shadow
- **Width**: Fills left column
- **Padding**: 16px
- **Buttons**: Full-width, left-aligned, with icon and description
- **Each button**: 
  - Height: ~60px (3-line: emoji, title, description)
  - Border on hover
  - Click → opens modal

---

## 3. MODAL OVERLAY - Covers Left Column

When a module is selected, a modal appears that **OVERLAYS THE LEFT COLUMN** so the GP can view the consultation note on the right while reviewing AI suggestions on the left.

```
┌──────────────────────────────────────────────────────────────┐
│                    FULL SCREEN VIEW                          │
├──────────────────┬───────────────────────────────────────────┤
│ LEFT COLUMN      │ RIGHT COLUMN                              │
│ (covered by      │ (visible - GP can read their note)        │
│  modal)          │                                            │
│                  │                                            │
│ ┌──────────────┐ │ S: Main Problems Discussed                │
│ │ 🚩 Red Flags │ │ 1. Type 2 diabetes                        │
│ │ Scanner      │ │ - On metformin...                         │
│ │ [X] Close    │ │                                            │
│ ├──────────────┤ │ O: Objective Findings                     │
│ │              │ │ - BP 140/90                               │
│ │ Analyzing... │ │ - BMI 32                                  │
│ │     ⏳       │ │                                            │
│ │              │ │ A: Assessment                             │
│ │              │ │ - Type 2 DM, suboptimal control           │
│ │              │ │                                            │
│ │              │ │ P: Plan                                   │
│ │              │ │ - Continue metformin                      │
│ │              │ │                                            │
│ └──────────────┘ │                                            │
│                  │                                            │
└──────────────────┴───────────────────────────────────────────┘
```

### Modal Specifications

**Position**: Overlays the left column ONLY (doesn't cover the note on the right)

**Dimensions**:
- Width: Same as left column (~600px)
- Height: 85vh (to allow scrolling if needed)
- Position: Fixed to left side of screen

**Sections**:

1. **Header** (fixed at top):
   ```
   ┌────────────────────────────────────┐
   │ 🚩 Red Flags Scanner          [X]  │
   │ AI-generated suggestions for       │
   │ your review                        │
   └────────────────────────────────────┘
   ```

2. **Content Area** (scrollable):
   ```
   ┌────────────────────────────────────┐
   │                                    │
   │ [Loading state with spinner]       │
   │        OR                          │
   │ [AI response with formatting]      │
   │        OR                          │
   │ [Error message]                    │
   │                                    │
   └────────────────────────────────────┘
   ```

3. **Footer** (fixed at bottom):
   ```
   ┌────────────────────────────────────┐
   │ Was this helpful?                  │
   │ [👍 Helpful] [👎 Not helpful]     │
   │                                    │
   │                        [Close]     │
   └────────────────────────────────────┘
   ```

---

## 4. INTERACTION FLOW

### Step-by-Step User Journey

**STEP 1: Initial State**
```
GP is on consultation page → AI Review button visible but disabled (no content yet)
```

**STEP 2: Content Added**
```
GP edits consultation note → AI Review button becomes enabled (blue)
```

**STEP 3: Button Click**
```
GP clicks AI Review button (✨) → Module selection panel slides down below button
```

**STEP 4: Module Selection**
```
Panel shows 4 options:
├─ 🚩 Red Flags Scanner
├─ 🔬 Differential Diagnosis
├─ 🧪 Investigation Advisor
└─ 💊 Management Review

GP clicks one → Panel closes, Modal opens
```

**STEP 5: Modal Opens**
```
Modal overlays left column
├─ Header: Shows module title
├─ Content: Shows "Analyzing..." with spinner
└─ Footer: Hidden during loading

Background: Right column (consultation note) still visible for reference
```

**STEP 6: AI Response**
```
After 3-5 seconds:
├─ Spinner disappears
├─ AI suggestions appear (formatted with emojis, bullets)
└─ Footer appears with feedback buttons
```

**STEP 7: GP Reviews**
```
GP reads suggestions while viewing their note on the right
└─ Can scroll within modal if content is long
```

**STEP 8: GP Provides Feedback**
```
GP clicks 👍 or 👎
└─ Buttons become disabled, show "Thanks!"
```

**STEP 9: Close**
```
GP clicks [Close] button or [X]
└─ Modal closes, back to consultation page
└─ Module selection panel also closes
```

**STEP 10: Repeat (Optional)**
```
GP can click AI Review button again
└─ Can select a different module
└─ Previous suggestions not shown (fresh review each time)
```

---

## 5. RESPONSIVE BEHAVIOR

### Desktop (>1024px)
- Modal: Overlays left column (600px width)
- Right column: Remains fully visible (consultation note readable)
- Side-by-side layout preserved

### Tablet (768px - 1024px)
- Modal: Overlays left column
- Right column: May be partially covered if screen is narrow
- Still functional but less ideal

### Mobile (<768px)
- Modal: Full-screen overlay (covers everything)
- User cannot see note while reviewing suggestions
- Less ideal UX (future enhancement: make suggestions copyable)

---

## 6. VISUAL EXAMPLES

### Example 1: Red Flags Module Response

```
┌──────────────────────────────────────┐
│ 🚩 Red Flags Scanner            [X] │
│ AI-generated suggestions             │
├──────────────────────────────────────┤
│                                      │
│ 🚩 RED FLAGS:                        │
│ - Bilateral leg weakness +           │
│   urinary retention: Possible        │
│   cauda equina syndrome -            │
│   Requires immediate ED              │
│   assessment within 4 hours          │
│                                      │
│ ✅ SAFETY ASSESSMENT:                │
│ Urgent red flag present requiring    │
│ emergency referral                   │
│                                      │
│ ⚠️ Clinical Judgment Required        │
│ These AI suggestions are for         │
│ consideration only...                │
│                                      │
├──────────────────────────────────────┤
│ Was this helpful?                    │
│ [👍 Helpful] [👎 Not helpful]       │
│                                      │
│                          [Close]     │
└──────────────────────────────────────┘
```

### Example 2: DDx Module Response

```
┌──────────────────────────────────────┐
│ 🔬 Differential Diagnosis       [X] │
│ AI-generated suggestions             │
├──────────────────────────────────────┤
│                                      │
│ 📊 KEY FEATURES SUMMARY:             │
│ - Symptoms: Chest pain, dyspnea      │
│ - Risk factors: DM, smoking          │
│                                      │
│ 🤔 ALTERNATIVE DIFFERENTIALS:        │
│                                      │
│ 1. Acute Coronary Syndrome          │
│    Likelihood: High                  │
│    ✓ Supports: Cardiac risk          │
│      factors, radiation pattern      │
│    ✗ Against: Normal troponin        │
│    → Next: ECG, cardiology           │
│                                      │
│ 2. Pulmonary Embolism               │
│    Likelihood: Moderate              │
│    ✓ Supports: Dyspnea, tachycardia │
│    ✗ Against: No DVT symptoms        │
│    → Next: D-dimer, CTPA if high     │
│                                      │
│ ⚠️ Clinical Judgment Required        │
│                                      │
├──────────────────────────────────────┤
│ Was this helpful?                    │
│ [👍 Helpful] [👎 Not helpful]       │
│                                      │
│                          [Close]     │
└──────────────────────────────────────┘
```

---

## 7. TECHNICAL IMPLEMENTATION NOTES

### Modal Component Properties
```typescript
<AIReviewModal
  isOpen={true}
  onClose={() => setIsOpen(false)}
  reviewType="red_flags"  // or ddx, investigations, management
  noteContent={{
    problemsText: "...",
    objectiveText: "...",
    assessmentText: "...",
    planText: "...",
  }}
/>
```

### Modal Styling (Tailwind)
```typescript
className="
  fixed 
  left-0 
  top-0 
  h-[85vh] 
  w-[600px]
  max-w-3xl 
  overflow-hidden 
  flex 
  flex-col
  z-50
  bg-white
  shadow-2xl
  rounded-r-lg
"
```

### Content Scrolling
- Header: `sticky top-0`
- Content: `flex-1 overflow-y-auto`
- Footer: `sticky bottom-0`

---

## 8. ACCESSIBILITY CONSIDERATIONS

- **Keyboard Navigation**: 
  - Tab to button
  - Enter to open panel
  - Arrow keys to navigate modules
  - Enter to select module
  - Esc to close modal

- **Screen Readers**: 
  - Button: "AI Review, button, disabled/enabled"
  - Modal: Announces module title when opened
  - Feedback buttons: Clear labels

- **Focus Management**: 
  - Focus trapped within modal when open
  - Returns to button on close

---

## 9. WHAT CURSOR NEEDS TO IMPLEMENT

### Component Hierarchy
```
AIReviewButton.tsx
├─ Button (AI Review icon)
├─ Module Selection Panel (conditional)
│  ├─ Red Flags button
│  ├─ DDx button
│  ├─ Investigations button
│  └─ Management button
└─ AIReviewModal (conditional)
   ├─ Dialog (from UI library)
   ├─ DialogHeader
   ├─ DialogContent (scrollable)
   │  ├─ Loading state
   │  ├─ AI response
   │  └─ Error state
   └─ DialogFooter
      ├─ Feedback buttons
      └─ Close button
```

### Integration Point
The `<AIReviewButton />` component should be added where camera and referral icons are currently rendered in the left sidebar.

---

## 10. SUMMARY - QUICK REFERENCE

| Element | Location | Behavior |
|---------|----------|----------|
| **AI Review Button** | Left sidebar, next to camera/referral icons | Click → opens module panel |
| **Module Selection Panel** | Below button, in left column | Click module → opens modal |
| **AI Review Modal** | Overlays left column | Shows AI suggestions, side-by-side with note on right |
| **Modal Content** | Scrollable area in modal | Formatted AI response with emojis, bullets |
| **Feedback Buttons** | Modal footer | 👍 👎 for tracking usefulness |
| **Close Behavior** | X button or Close button | Returns to consultation page |

---

**This specification ensures:**
✅ GP can see their note while reviewing AI suggestions (side-by-side)
✅ Modal doesn't cover the consultation note on the right
✅ Clear visual hierarchy and interaction flow
✅ Consistent with existing UI patterns (camera/referral)
✅ Accessible and keyboard-navigable

**Implementation Priority:**
1. Button placement (most critical)
2. Module selection panel
3. Modal overlay positioning (left column only)
4. Content formatting
5. Feedback mechanism
