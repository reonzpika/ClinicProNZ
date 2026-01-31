---
name: ""
overview: ""
todos: []
isProject: false
---

# Referral Images: Filename (Date + Time, No ID) and Desktop Overlay

## Overview

1. **Filename:** Include date and time in generated filenames, remove the random short ID (e.g. Pue9VP), so filenames are human-readable and multiple "left wound" images are distinguishable.
2. **Desktop overlay:** Change the card label so the visible "naming" reflects side (and optionally the full filename), instead of only showing description and ignoring left/right.

---

## Part 1: Filename generator

### Current behaviour

- Filename is built in `[src/lib/services/referral-images/utils.ts](src/lib/services/referral-images/utils.ts)` by `generateFilename()`.
- Pattern: `[side]-[description]-[date]-[shortId].jpg` (e.g. `left-wound-image-2026-01-31-Pue9VP.jpg`).
- Date is `createdAt` date only (YYYY-MM-DD). Time is not used. The 6-character `imageId` prefix is added for uniqueness.

### Desired behaviour

- **Keep:** side (left/right), description (sanitized), date (YYYY-MM-DD).
- **Add:** time so multiple images of the same "left wound" are distinguishable (e.g. 14:30:52).
- **Remove:** the short random ID (Pue9VP).

Resulting example: `left-wound-image-2026-01-31-143052.jpg` (date + time in HHmmss).

### Implementation (utils.ts)

1. Parse date and time from `createdAt` (ISO string): keep `date` as YYYY-MM-DD; add `time` as HHmmss (or HHmmssSSS for milliseconds).
2. Build `parts`: optional side, optional sanitized description, then `date`, then `time`. Do not append `imageId`.
3. Fallback (no side, no description): return `clinical-photo-${date}-${time}.jpg`.
4. Optional: use milliseconds in time if you want to avoid same-second collisions.

### Call sites (no changes needed)

- Status and download APIs already pass `createdAt` and call `generateFilename()`; they get the new format automatically.

### Example outputs


| Scenario                         | Current                                  | New                                      |
| -------------------------------- | ---------------------------------------- | ---------------------------------------- |
| Left wound, 31 Jan 2026 14:30:52 | `left-wound-image-2026-01-31-Pue9VP.jpg` | `left-wound-image-2026-01-31-143052.jpg` |
| No metadata, same time           | `clinical-photo-2026-01-31-Pue9VP.jpg`   | `clinical-photo-2026-01-31-143052.jpg`   |


---

## Part 2: Desktop overlay (card label)

### Current behaviour

In `[app/(clinical)/referral-images/desktop/page.tsx](app/(clinical)`/referral-images/desktop/page.tsx), the metadata overlay under each image (lines 520–525) uses:

```tsx
{image.metadata.description ||
  (image.metadata.side === 'R' ? 'Right' : image.metadata.side === 'L' ? 'Left' : null) ||
  image.filename}
```

So when `description` is set, the label shows only the description and never shows side or the full filename. The visible "naming" on desktop therefore ignores left/right.

### Desired behaviour

- The overlay "naming" should reflect **side** (and optionally the full filename).
- Options:
  - **Option A:** Build a label that always includes side when present, e.g. "Right – wound image" or "Left – wound image", then fallback to description-only or filename if no side.
  - **Option B:** Show the **full filename** (e.g. `image.filename`) as the primary label so what the user sees matches the downloaded file name (which already includes side, description, date, time).
  - **Option C:** Combine: e.g. "Right – wound image" on one line and the filename on a second line (or as tooltip), so both human-readable label and exact filename are visible.

### Implementation (desktop/page.tsx)

1. Replace the current overlay expression with logic that:
  - Includes side when present (e.g. "Left" or "Right" as prefix or suffix).
  - Optionally uses the full filename so the label matches the download name.
2. Keep the existing `formatBytes(image.fileSize)` line below the label.
3. Ensure truncation (e.g. `truncate` class) still works if the filename is long; optionally show full filename on hover/title if needed.

### Suggested approach

- Prefer showing a label that includes **side + description** when both exist (e.g. "Right – wound image"), and fall back to **full filename** when that’s the only or clearest option. That way the overlay reflects side and, optionally, the full filename as requested.

