# Apply Button Placement Options

**Current Implementation**: Option B (Below each field)

## Option A: Inline Next to Label
**Layout**: Small "Apply" button inline with the field label

```
Laterality * (is required) [Apply (3)]
┌─────────────────────────────────────┐
│ [Right] [Left] [Bilateral] [N/A]   │
└─────────────────────────────────────┘
```

**Pros**: 
- Immediate access next to field
- Saves vertical space

**Cons**: 
- Can feel cluttered
- May be hard to click if label is long

---

## Option B: Below Each Field (Current)
**Layout**: Apply button appears directly below the chips for Laterality and Body Site

```
Laterality * (is required)
┌─────────────────────────────────────┐
│ [Right] [Left] [Bilateral] [N/A]   │
└─────────────────────────────────────┘
[→ Apply (3)]
```

**Pros**: 
- Clear separation
- Easy to scan
- Intuitive placement

**Cons**: 
- Takes more vertical space
- Button appears/disappears dynamically

---

## Option C: Compact Toolbar Above Form
**Layout**: Horizontal toolbar with both apply buttons above all fields

```
[→ Apply Laterality (3)]  [→ Apply Body Site (3)]
─────────────────────────────────────────────────
Laterality * (is required)
┌─────────────────────────────────────┐
│ [Right] [Left] [Bilateral] [N/A]   │
└─────────────────────────────────────┘
```

**Pros**: 
- Always visible
- Consistent placement
- Saves space below fields

**Cons**: 
- Less context (buttons separated from fields)
- May be less discoverable

---

## Option D: Icon-Only Floating Buttons
**Layout**: Small icon buttons that appear on hover over the field

```
Laterality * (is required) [→]  ← appears on hover
┌─────────────────────────────────────┐
│ [Right] [Left] [Bilateral] [N/A]   │
└─────────────────────────────────────┘
```

**Pros**: 
- Very compact
- Clean when not needed

**Cons**: 
- Less discoverable (hidden until hover)
- Mobile/touch devices may struggle

---

## Recommendation

**Option B (Current)** is recommended because:
- Clear visual connection between field and apply action
- Easy to discover (always visible when field has value)
- Follows common form patterns
- Works well on all devices

**Alternative**: If space is tight, consider **Option C** (toolbar above) for a more compact layout.
