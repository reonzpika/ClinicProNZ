# Medtech Integration — Images Widget PRD (v0.1)

## Objectives
- Enable GPs to capture/attach clinical photos to the active Medtech encounter in ≤ 20s.
- Make images instantly available for HealthLink/ALEX referrals (no extra filing).
- Keep flows simple, safe (consent/EXIF), and auditable.

## Success metrics (v1)
- Median capture→commit ≤ 20s; p95 ≤ 45s
- First‑attempt attach success ≥ 98%
- Duplicate uploads within an encounter ≤ 2% (hash‑based)
- Locked‑tile click → request access conversion ≥ 10%

## Users / contexts
- GPs (primary), Nurses/HCAs (optional per org policy)
- Desktop Medtech (embedded iFrame preferred; new‑tab fallback)
- Mobile capture via QR handoff (no PIN; 5‑min TTL)

## Scope (MVP)
- Launch from Medtech button and from Widget Launcher
- Capture via device camera; upload from library (JPG/PNG/PDF)
- Client‑side compress to <1 MB; strip EXIF; size meter
- Quick annotations (crop, arrow, circle)
- Metadata: title, body site, laterality, indication; consent toggle
- Save to encounter as DocumentReference (+ Binary); optional Media
- Optional: send to Inbox (recipient selectable) and/or create Task (assignee selectable)
- Session list of attachments; show EMR IDs; ready‑for‑referral badge

## Out of scope (v1)
- Scribe/notes/meds/obs
- DICOM/ImagingStudy
- eReferral composition (GP uses HealthLink/ALEX UI to attach)
- Advanced markup (measurements, layers)

## Mobile capture flow (no PIN)
1. Desktop shows QR (one‑time, 5‑min TTL)
2. User scans → mobile upload page opens with encounter context
3. Tap “Open camera” → capture (HTML Media Capture)
4. Per‑image review: quick chips (Laterality, Body site, Modality, Indication), crop/rotate
5. “Add another” loops capture; thumbnails grid builds up
6. Optional routing: Inbox/Task toggles; recipient/assignee pickers; notes
7. Batch upload: compress (<1 MB), upload in parallel, commit; success ticks
8. Desktop updates live; token revoked after upload or TTL

## Compression policy (<1 MB)
- Client: HEIC→JPEG, EXIF orientation applied then stripped; longest edge 1600px (fallback 1280→1024), quality auto‑tune; show size badge
- Server: hard limit 1 MB; actionable error if exceeded

## UX — quick chips (coded)
- Laterality: Right, Left, Bilateral, N/A (sticky)
- Body site: Recents + common set (Face, Scalp, Trunk, Arm, Forearm, Hand, Thigh, Leg, Foot)
- Modality: Clinical, Dermoscopy, Wound, Rash
- Indication: Lesion, Rash, Wound, Infection
- Apply‑to‑remaining option; per‑user Favourites; offline code cache

## Data mapping (canonical → ALEX)
- DocumentReference (primary): content.attachment (contentType, size, hash, filename); context encounter+patient; category=clinical‑photo; metadata fields in extensions
- Binary: raw bytes upload
- Media (optional): type=photo; bodySite/laterality; link to DocumentReference

## API contracts (Integration Gateway)

### GET /capabilities
Returns server‑authoritative feature flags, limits, and dictionaries.

```json
{
  "provider": { "name": "alex", "environment": "sandbox" },
  "features": {
    "images": {
      "enabled": true,
      "mobileHandoff": { "qr": true, "ttlSeconds": 300 },
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
        "modalities": [
          {"code":"clinical","display":"Clinical"},
          {"code":"dermoscopy","display":"Dermoscopy"},
          {"code":"wound","display":"Wound"},
          {"code":"rash","display":"Rash"}
        ],
        "indications": [
          {"code":"399982007","display":"Skin lesion"},
          {"code":"271807003","display":"Rash"},
          {"code":"416471007","display":"Wound"},
          {"code":"312608009","display":"Skin infection"}
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
Creates one‑time mobile upload session and QR.

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
  "ttlSeconds": 300
}
```

### POST /attachments/upload-initiate
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
        "title": "Left forearm lesion (dermoscopy)",
        "bodySite": {"system":"http://snomed.info/sct","code":"40983000","display":"Forearm"},
        "laterality": {"system":"http://snomed.info/sct","code":"7771000","display":"Left"},
        "modality": {"system":"clinicpro/modality","code":"dermoscopy","display":"Dermoscopy"},
        "indication": {"system":"http://snomed.info/sct","code":"399982007","display":"Skin lesion"}
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
Create DocumentReference (+ optional Media) and optional Inbox/Task.

```json
{
  "encounterId": "enc-abc",
  "files": [
    {
      "fileId": "temp-xyz",
      "meta": {
        "title": "Left forearm lesion (dermoscopy)",
        "bodySite": {"system":"http://snomed.info/sct","code":"40983000","display":"Forearm"},
        "laterality": {"system":"http://snomed.info/sct","code":"7771000","display":"Left"},
        "modality": {"system":"clinicpro/modality","code":"dermoscopy","display":"Dermoscopy"},
        "indication": {"system":"http://snomed.info/sct","code":"399982007","display":"Skin lesion"}
      },
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
- Metadata via mobile chips is saved and visible on desktop before commit.
- Duplicate uploads within an encounter are idempotent.
- Inbox and Task flows create artefacts for the selected recipients and reference the images.
- iFrame blocked → new‑tab fallback works with preserved context.

## Risks & mitigations
- CSP/iFrame limits → new‑tab fallback
- Large images/slow networks → aggressive client compression, chunked uploads
- Vendor API variation → gateway capability negotiation; UI gating
- Consent gaps → first‑time consent gate; audit trail
