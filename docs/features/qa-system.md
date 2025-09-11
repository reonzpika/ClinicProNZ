# ClinicPro QA Systems

## Purpose

This document defines the end-to-end Quality Assurance (QA) signals, tracking, and verification flows across ClinicPro, with emphasis on consultation workflows, transcription, generated notes, and structured Additional Notes.

## Scope

- Desktop and mobile recording QA checkpoints
- Transcription persistence and reconstruction checks
- Consultation note generation QA
- Additional Notes structure and persistence (updated)
- API/DB invariants and monitoring hooks

---

## Key Concepts

- "QA Signal": an observable state change or persisted artefact we can validate.
- "Authoritative Store": server database (`patient_sessions`) is source of truth.
- "Client Store": Zustand stores reflect UI state and must rehydrate from server accurately.

---

## Data Model References

- `database/schema/patient_sessions.ts`
  - `transcriptions`: JSON string array of `{ id, text, timestamp, source, deviceId? }`
  - `notes`: AI-generated consultation notes (string)
  - `typedInput`: free text entered by user
  - `templateId`: template used for generation
  - `problems_text`: structured Additional Notes – Problems (string)
  - `objective_text`: structured Additional Notes – Objective (string)
  - `assessment_text`: structured Additional Notes – Assessment (string)
  - `plan_text`: structured Additional Notes – Plan (string)
  - `clinicalImages`: JSON string array of uploaded images

- `src/types/consultation.ts`
  - `PatientSession` mirrors above for client usage

---

## Consultation Additional Notes – Structured Tracking (Updated: field-based)

Additional Notes now include a structured set of fields aligned with SOAP:

- Problems: free-form list or bullets of active problems/issues
- Objective: vitals, exam findings, investigations
- Assessment: working diagnoses/differentials
- Plan: management plan including Rx, Ix, f/u, advice

### UI and Behaviour

- The `AdditionalNotes` experience is retained, persisted in four dedicated columns: `problems_text`, `objective_text`, `assessment_text`, `plan_text`.
- For generation/export, these are compiled into a single text block (see Canonical Markers) to provide consistent downstream behaviour.

### Canonical Section Markers

Implementers MUST use the exact markers when composing the concatenated text so that other subsystems (e.g., AI prompts, exports) can parse reliably:

```
PROBLEMS:
<free text>

OBJECTIVE:
<free text>

ASSESSMENT:
<free text>

PLAN:
<free text>
```

Notes:
- Sections may be omitted if empty; preserve order when present.
- Do not invent content; only include explicitly captured data.

### API/Generation Integration

- `app/(clinical)/consultation/page.tsx` composes `rawConsultationData` by combining main input (audio transcript or typed input) with a concatenation of `problems_text`, `objective_text`, `assessment_text`, `plan_text` (when present), using the canonical headers.
- `app/api/(clinical)/consultation/notes/route.ts` consumes the combined `rawConsultationData` and templates map SOAP (see `systemPrompt.ts`).
- No API shape change is required; structured Additional Notes are sourced from the four dedicated fields.

### Validation Rules

At save time or generation time, apply lightweight validation:
- Allow empty sections; trim trailing whitespace.
- Enforce the section header tokens exactly as above if any SOAP-aligned content is detected.
- Total concatenated length should remain within UI limits to avoid streaming truncation.

---

## QA Checkpoints

### 1) Transcription Persistence
- Each pause-triggered chunk is appended to `patient_sessions.transcriptions`.
- QA: After Ably signal, desktop refetch joins chunks to reconstruct full transcript; compare against UI transcript buffer.

### 2) Additional Notes Persistence (Updated)
- Edits in `AdditionalNotes` save directly to `problems_text`, `objective_text`, `assessment_text`, `plan_text` via `PUT /api/patient-sessions`.
- QA: Switch sessions then return; fields rehydrate identically and concatenated view preserves section order and content.

### 3) Generated Notes
- `POST /api/consultation/notes` streams AI output.
- QA: Ensure `notes` saved to `patient_sessions.notes`. Reopen session: generated notes display matches last saved.

### 4) Session Clearing
- `POST /api/patient-sessions/clear` clears `notes`, `typedInput`, `transcriptions`, and all Additional Notes fields (`problems_text`, `objective_text`, `assessment_text`, `plan_text`).
- QA: After clear, UI shows empty sources, and refetch confirms server-side cleared state.

### 5) Mobile Images
- Upload via presigned URLs; Ably signals desktop to refetch.
- QA: `clinicalImages` JSON parses and images appear in session context.

---

## Change Tracking & NLP Extraction (Technical Updates)

### Replace Custom Diff Implementation → diff-match-patch

Current:
- Manual diff computation and edit distance calculations described for note changes.

Change:
- Use a well-established diff library such as `diff-match-patch` for text change tracking.

Reasons:
- Improved reliability and performance on large texts
- Robust handling of complex edits and Unicode edge cases
- Built-in semantic cleanup (`diff_cleanupSemantic`) for human-friendly diffs

Implementation Notes:
- Frontend/Node: `diff-match-patch` npm package
- Apply `diff_main(oldText, newText)` → `diff_cleanupSemantic(diff)` for readable QA diffs
- Persist minimal delta if needed, or store full before/after with rendered diff for audits

Migration Risk:
- None to data model; replace call sites where custom diff was referenced in QA workflows.

### Upgrade Entity Extraction → spaCy clinical model (medspaCy)

Current:
- Simple, deterministic patterns and regex-based entity extraction.

Change:
- Use spaCy with a clinical/biomedical pipeline. Recommended: `medspaCy` for clinical text; alternatively `scispaCy` for biomedical literature or `Med7` for medication-centric use cases.

Recommendation for ClinicPro QA:
- Adopt `medspaCy` as default clinical NER/sectionizer for consultation notes. It aligns with clinical narratives and supports section detection (useful alongside SOAP).

Reasons:
- Higher recall/precision on clinical entities than regex heuristics
- Domain-adapted tokenisation and section detection
- Extensible with rules for NZ-specific terminology

Implementation Notes:
- Service layer (Python) with spaCy + medspaCy
- Expose HTTP endpoint for entity extraction if app layer is Node/TS
- Start with core medspaCy components: `TargetMatcher`, `Sectionizer`; add rules for SOAP headers and NZ abbreviations

Migration Risk:
- Operational: add Python service/runtime. Mitigate with containerised microservice and health checks.
- Model choice: evaluate medspaCy vs scispaCy on sample datasets; retain fallback regex for edge conditions initially.

---

## API Contracts (No Schema Change Required)

- `PUT /api/patient-sessions` accepts `problems_text`, `objective_text`, `assessment_text`, `plan_text`, plus other session fields as applicable.
- `GET /api/patient-sessions` returns these four fields (strings), along with `notes`, `typedInput`, and parsed `transcriptions`.
- `POST /api/consultation/notes` expects `rawConsultationData` that may include structured Additional Notes sections (concatenated from the four fields).

Legacy Notes:
- Any legacy `consultationNotes` or `consultationItems` usage is deprecated and should not be written in new flows.

---

## Risks & Mitigations

- Risk: Free-text Additional Notes without markers → not parsable into SOAP.
  - Mitigation: Encourage UI affordances to insert section headers; gentle validation on save.
- Risk: Over-long Additional Notes causing model truncation.
  - Mitigation: Soft limits and character counters; advise summarising Problems.
- Risk: Divergence of section labels.
  - Mitigation: Enforce exact tokens: PROBLEMS, OBJECTIVE, ASSESSMENT, PLAN.

---

## Test Plan (Smoke)

1. Enter audio transcript, add structured Additional Notes (all four sections), generate notes → AI includes content appropriately.
2. Switch sessions and return → structured Additional Notes persist and render intact.
3. Clear all → Additional Notes emptied; server confirms clear.
4. Type-only flow → structured Additional Notes still used in generation.

---

## Future Enhancements

- Export helpers to render/parse the four Additional Notes fields with canonical headers for interoperable exports.
- Export helpers to parse structured Additional Notes back into sections.