# Medtech Integration — Images Widget PRD (v0.1)

> **⚠️ IMPORTANT — Source of Truth**  
> This PRD outlines the **product vision and planned architecture** for the Images Widget. Where technical integration details are concerned, the **[ALEX API Documentation](https://alexapidoc.medtechglobal.com/) is the authoritative source of truth**.  
> 
> **Key areas where ALEX API docs supersede this PRD**:
> - API endpoints, request/response schemas, and FHIR resource structures
> - Required HTTP headers (`mt-facilityid`, `Authorization`, `Content-Type`) - per Medtech support, only mt-facilityid is needed
> - Authentication flow and token management
> - Custom FHIR extension URLs for clinical metadata (awaiting examples from Medtech support)
> - Error codes and troubleshooting guidance
> 
> **What this PRD provides**:
> - Product requirements, user flows, and acceptance criteria
> - Integration Gateway abstraction layer (simplified REST API for frontend)
> - UI/UX specifications and clinical workflow requirements
> 
> **Always defer to ALEX API Documentation** (Sections 7-12) for implementation details. This PRD's API contracts may represent planned abstractions or aspirational patterns that require validation against ALEX's actual FHIR endpoints.

---

## Objectives
- Enable GPs to capture/attach clinical photos to the active Medtech encounter in ≤ 20s.
- Make images instantly available for HealthLink/ALEX referrals (no extra filing).
- Keep flows simple, safe (EXIF), and auditable.

## Success metrics (v1)
- Median capture→commit ≤ 20s; p95 ≤ 45s
- First‑attempt attach success ≥ 98%
- Duplicate uploads within an encounter ≤ 2% (hash‑based)
- Locked‑tile click → request access conversion ≥ 10%

## Users / contexts
- GPs (primary), Nurses/HCAs (optional per org policy)
- Desktop Medtech (embedded iFrame preferred; new‑tab fallback)
- Mobile capture via QR handoff (no PIN; 10‑min TTL)

## Scope (MVP)
- Launch from Medtech button and from Widget Launcher
- Capture via device camera; upload from library (JPG/PNG/PDF)
- Client‑side compress to <1 MB; strip EXIF; size meter
- Metadata (chips-first, coded where possible):
  - Laterality (chips only: Right, Left, Bilateral, N/A; sticky-last)
  - Body site (chips for common coded sites; "Other" opens inline typeahead; uncoded free text allowed if no match)
  - View (chips: Close‑up, Dermoscopy, Other; if Other, optional text)
  - Type (chips: Lesion, Rash, Wound, Infection, Other; if Other, optional text)
  - Label (free text to differentiate multiple images of same site)
- Save to encounter as DocumentReference (+ Binary); optional Media
- Desktop‑only actions: send to Inbox (recipient selectable) and/or create Task (assignee selectable)
- Session list of attachments; show EMR IDs; status badge (orange: Not committed; green: Committed — ready for referral)
- Desktop editing: crop, rotate, arrow annotation; non‑destructive for committed images (save as new copy)
- Edit clinical date/time on desktop; allow backdating; disallow future dates; audit logged
 - Image formats: normalise all images to JPEG on commit; PDFs remain PDF

### Desktop widget UI (embedded)
- Shown only when Medtech has an active patient/encounter context
- Do not duplicate patient header (no patient name, NHI, or encounter display in widget)
- No status pill UI; QR tile shows 10‑min countdown and Expired state
- No "Open in new tab" control (new‑tab fallback remains if iFrame blocked)
- Main pane: live gallery grid only (no filter or search)
- Image card actions: Edit (crop, rotate, arrow), Change date/time, Attach, Send to Inbox/Task, More
- Status badge on cards: green = Committed; orange = Not committed

## Out of scope (v1)
- Scribe/notes/meds/obs
- DICOM/ImagingStudy
- eReferral composition (GP uses HealthLink/ALEX UI to attach)
- Advanced markup (measurements, layers)

## Mobile capture flow (no PIN)
1. Desktop shows QR (one‑time, 10‑min TTL; regenerating QR resets TTL and revokes prior token)
2. User scans → mobile upload page opens with encounter context; header shows patient name and NHI
3. Tap “Open camera” → capture (HTML Media Capture)
4. Per‑image review: chips for Laterality and Body site (coded); optional chips for View and Type. Selecting "Other" opens inline text input (typeahead for Body site). No crop/rotate on mobile.
5. “Take more” loops capture; thumbnails grid builds up; sticky‑last selections apply per field until changed
6. Batch upload: compress (<1 MB), upload in parallel, commit; success ticks
7. Desktop updates live; token revoked after upload or TTL
8. If QR is regenerated on desktop, existing mobile session shows "Session expired — please rescan" and blocks further uploads

## Compression policy (<1 MB)
- Client: HEIC→JPEG, EXIF orientation applied then stripped; longest edge 1600px (fallback 1280→1024), quality auto‑tune; show size badge
- Server: hard limit 1 MB; actionable error if exceeded
 - PNG uploads may be transcoded to JPEG on commit to meet size/compatibility requirements

## Edits & originals policy
- Edits on desktop use "Save as new" for committed images, creating a new JPEG while keeping the original immutable.
- By default, only the edited copy is selected for commit; the original remains in ClinicPro (uncommitted) unless explicitly chosen.
- The commit dialog provides an "Include original" option to also commit the source image.
- Uncommitted originals are retained in temporary storage and auto‑purged after 24 hours.
- If the original was already committed previously, edited copies are committed as additional images and linked via provenance; both remain available in Medtech.
- Provenance mapping: `derivedFromDocumentReferenceId` is stored internally, and if both artefacts are in Medtech, `DocumentReference.relatesTo` is set with `code = transforms` pointing to the original.

## UX — quick chips (coded)
- Laterality: Right, Left, Bilateral, N/A (sticky‑last; coded)
- Body site: Common coded set (Face, Scalp, Trunk, Arm, Forearm, Hand, Thigh, Leg, Foot). "Other" opens inline typeahead to search coded sites; fallback to text if no match.
- View: Close‑up, Dermoscopy, Other (coded internal). If Other, optional text.
- Type: Lesion, Rash, Wound, Infection, Other (coded internal). If Other, optional text.
- No "apply to remaining"; no recents/favourites badges. Keep taps minimal.

## Data mapping (canonical → ALEX)
- DocumentReference (primary): content.attachment (contentType, size, hash, filename); context encounter+patient; category=clinical‑photo; metadata fields in extensions
- Binary: raw bytes upload
- Media (optional): type=photo; bodySite/laterality; link to DocumentReference

## Authentication & Security
- Desktop (Medtech SSO):
  - The widget is launched within Medtech. The server establishes a user session using Medtech‑provided signed context (e.g., SSO JWT or signed POST).
  - All desktop‑initiated APIs require this session; the server derives `tenantId`, `userId`, and `encounterId` from Medtech context.
- Mobile (QR token):
  - No sign‑in. Mobile uses a one‑time token (10‑min TTL) obtained from the desktop QR. Pass token via `x-mobile-token` header on mobile APIs.
  - Regenerating QR immediately revokes the previous token. Expired/revoked tokens return actionable errors.
- Realtime sync:
  - Desktop receives live updates (e.g., via server‑issued realtime tokens) based on the Medtech SSO session. Mobile does not require realtime credentials.

## API contracts (Integration Gateway)

> **Note**: These API contracts represent a **simplified REST abstraction layer** (Integration Gateway) that sits between the widget frontend and ALEX's FHIR API. The Gateway handles:
> - OAuth token management (55-min cache, auto-refresh)
> - FHIR ↔ REST translation
> - Required ALEX headers injection (`mt-facilityid`, `Authorization`, `Content-Type`) - per Medtech support, only mt-facilityid is needed
> - Error code mapping (FHIR OperationOutcome → user-friendly messages)
> - Clinical metadata mapping (PRD schema → FHIR extensions)
> 
> **Implementation**: Backend must map these Gateway endpoints to actual ALEX FHIR resources:
> - `/attachments/commit` → `POST /FHIR/Media` (+ optional `POST /FHIR/Communication` for inbox routing)
> - Metadata fields → FHIR extensions (awaiting schema from Medtech support — email sent 2025-10-31)
> - Refer to [ALEX API Documentation](https://alexapidoc.medtechglobal.com/) for FHIR endpoint schemas.

---

### GET /capabilities
Auth: Desktop (Medtech SSO session)
Returns server‑authoritative feature flags, limits, and dictionaries.

```json
{
  "provider": { "name": "alex", "environment": "sandbox" },
  "features": {
    "images": {
      "enabled": true,
      "mobileHandoff": { "qr": true, "ttlSeconds": 600 },
      "inbox": { "enabled": true },
      "tasks": { "enabled": true },
      "quickChips": {
        "laterality": [
          {"code":"24028007","display":"Right"},
          {"code":"7771000","display":"Left"},
          {"code":"51440002","display":"Bilateral"},
          {"code":"373067005","display":"Not applicable"}
        ],
        "bodySitesCommon": [
          {"code":"89545001","display":"Face"},
          {"code":"40983000","display":"Forearm"},
          {"code":"53120007","display":"Hand"},
          {"code":"22335008","display":"Leg"},
          {"code":"56459004","display":"Foot"},
          {"code":"43799004","display":"Scalp"},
          {"code":"22943007","display":"Trunk"}
        ],
        "views": [
          {"code":"close-up","display":"Close-up"},
          {"code":"dermoscopy","display":"Dermoscopy"},
          {"code":"other","display":"Other"}
        ],
        "types": [
          {"code":"lesion","display":"Lesion"},
          {"code":"rash","display":"Rash"},
          {"code":"wound","display":"Wound"},
          {"code":"infection","display":"Infection"},
          {"code":"other","display":"Other"}
        ]
      }
    },
    "scribe": { "enabled": false }
  },
  "limits": {
    "attachments": {
      "acceptedTypes": ["image/jpeg","image/png","application/pdf"],
      "maxSizeBytes": 1048576,
      "maxPerRequest": 10,
      "maxTotalBytesPerEncounter": 52428800
    }
  },
  "recipients": {
    "inbox": [
      { "id": "user:gp-123", "type": "user", "display": "Dr A Smith" },
      { "id": "team:triage", "type": "team", "display": "Triage Inbox" }
    ],
    "tasks": [
      { "id": "user:nurse-9", "type": "user", "display": "Nurse B Lee" }
    ]
  }
}
```

### POST /attachments/mobile/initiate
Auth: Desktop (Medtech SSO session)
Creates one‑time mobile upload session and QR. Regenerating QR creates a new session and resets TTL; the previous token is revoked immediately.

```json
{
  "encounterId": "enc-abc",
  "inboxDefault": { "enabled": false },
  "taskDefault": { "enabled": false }
}
```
Response
```json
{
  "mobileUploadUrl": "https://widget.example.com/mobile-upload?t=one-time-token",
  "qrSvg": "data:image/svg+xml;base64,...",
  "ttlSeconds": 600
}
```

### POST /attachments/upload-initiate
Auth: Mobile (header `x-mobile-token: <one-time-token>`)
Initiate signed upload URLs for client‑compressed files.

```json
{
  "encounterId": "enc-abc",
  "files": [
    {
      "clientRef": "img-1",
      "contentType": "image/jpeg",
      "sizeBytes": 482113,
      "hash": "sha256:...",
      "clientCompression": { "longestEdgePx": 1600, "quality": 0.8, "stripExif": true },
      "proposedMeta": {
        "title": "Left forearm lesion",
        "label": "Lesion 1 (superior)",
        "bodySite": {"system":"http://snomed.info/sct","code":"40983000","display":"Forearm"},
        "laterality": {"system":"http://snomed.info/sct","code":"7771000","display":"Left"},
        "view": {"system":"clinicpro/view","code":"dermoscopy","display":"Dermoscopy"},
        "type": {"system":"clinicpro/type","code":"lesion","display":"Lesion"}
      }
    }
  ]
}
```
Response
```json
{
  "uploadSessionId": "sess-1",
  "files": [
    {
      "clientRef": "img-1",
      "fileId": "temp-xyz",
      "uploadUrl": "https://signed-upload.example.com/...",
      "headers": { "Content-Type": "image/jpeg" },
      "expiresAt": "2025-10-21T10:00:00Z"
    }
  ]
}
```

### POST /attachments/commit
Auth: Desktop (Medtech SSO session)
Create DocumentReference (+ optional Media) and optional Inbox/Task.

```json
{
  "encounterId": "enc-abc",
  "files": [
    {
      "fileId": "temp-xyz",
      "meta": {
        "title": "Left forearm lesion",
        "label": "Lesion 1 (superior)",
        "bodySite": {"system":"http://snomed.info/sct","code":"40983000","display":"Forearm"},
        "laterality": {"system":"http://snomed.info/sct","code":"7771000","display":"Left"},
        "view": {"system":"clinicpro/view","code":"dermoscopy","display":"Dermoscopy"},
        "type": {"system":"clinicpro/type","code":"lesion","display":"Lesion"}
      },
      "derivedFromDocumentReferenceId": null,
      "alsoInbox": { "enabled": true, "recipientId": "user:gp-123", "note": "Please review" },
      "alsoTask": { "enabled": true, "assigneeId": "user:nurse-9", "due": "2025-10-30", "note": "Prep referral" },
      "idempotencyKey": "enc-abc:sha256:..."
    }
  ]
}
```
Response
```json
{
  "files": [
    {
      "fileId": "temp-xyz",
      "status": "committed",
      "documentReferenceId": "dr-123",
      "mediaId": "med-456",
      "inboxMessageId": "inb-789",
      "taskId": "task-246",
      "warnings": []
    }
  ]
}
```

## Acceptance criteria (MVP)
- From Medtech, capture/upload and commit ≥ 3 images to the active encounter in one session; they appear in ALEX/HealthLink referral pickers.
- Each image <1 MB; EXIF stripped; correct orientation.
- Metadata via mobile chips (and inline "Other" where used) is saved and visible on desktop before commit.
- Duplicate uploads within an encounter are idempotent.
- Inbox and Task flows are desktop‑initiated (not shown on mobile) and create artefacts referencing the images.
- iFrame blocked → new‑tab fallback works with preserved context.
 - Images are stored as JPEG in Medtech (PDFs preserved); edited copies are saved as new; originals remain in ClinicPro unless explicitly committed (uncommitted originals auto‑purge after 24 hours).

## Risks & mitigations
- CSP/iFrame limits → new‑tab fallback
- Large images/slow networks → aggressive client compression, chunked uploads
- Vendor API variation → gateway capability negotiation; UI gating
