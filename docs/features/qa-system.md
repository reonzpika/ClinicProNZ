# Minimal Notes Tracking & Quality Assessment (Design)

## 1. Purpose and Scope

**Goal:** Track and assess LLM-generated clinical notes with minimal overhead.

**Scope:** Notes only (not chat). Preview branch. No external observability tools. No per-template tokens. No LLM-judge.

## 2. Outcomes

- **Auditability:** Full chain from inputs → model → output → edits
- **Safety signal:** Hallucination/omission flags on content
- **Medication safety (NZ):** Detect medication mentions in transcription; validate against NZ list
- **User feedback:** Rating + comment on draft quality

## 3. High-Level Flow

1. GP clicks Generate → create trace (pending)
2. Call LLM → store output → create revision v0
3. Run heuristics → store hallucination/omission
4. Run NZ med checks on transcription → store metrics and suspects
5. Capture user rating/comment (before first edit)
6. On edit → append revision v1+ with diffs; compute edit distance

## 4. Data Model (DB)

### `note_traces`
- `id` (uuid)
- `session_id` (uuid)
- `user_id` (text)
- `trace_id` (text, idempotency)
- `created_at` (ts)
- `model` (text)
- `status` ('success'|'failed'|'partial')
- `latency_ms` (int, nullable)
- `tokens_used` (int, nullable)
- `system_prompt` (text)
- `user_prompt` (text)
- `template_id` (text, nullable)
- `output_text` (text)
- `output_hash` (text)
- `user_rating` (smallint 0–5, nullable)
- `user_feedback` (text, nullable)
- `user_feedback_at` (ts, nullable)

### `note_revisions`
- `id` (uuid)
- `trace_id` (uuid, nullable)
- `session_id` (uuid)
- `user_id` (text)
- `version_index` (int; 0=draft, 1+ edits)
- `source` ('generated'|'manual')
- `note_text` (text)
- `diff` (text)
- `created_at` (ts)

### `trace_evals`
- `id` (uuid)
- `trace_id` (uuid)
- `created_at` (ts)
- `evaluator` ('heuristic')
- `hallucination_flag` (bool)
- `omission_flag` (bool)
- `notes` (text, nullable)
- `nz_meds_total` (int)
- `nz_meds_matched` (int)
- `nz_meds_unknown_count` (int)
- `nz_meds_unknown_list` (jsonb array of strings)
- `stt_meds_total` (int)
- `stt_meds_matched_nz` (int)
- `stt_meds_unknown_count` (int)
- `stt_meds_suspects` (jsonb array of { heard, suggested, confidence })
- `nz_meds_data_version` (text; e.g., "NZULM 2025-03")

## 5. API/Service Behaviour

### Notes Generation (Server)
- **On request:** create note_traces row (pending), save system/user prompts, model, template_id, timestamps
- **After LLM:** update row with output_text, output_hash, status, latency_ms, tokens_used (if available)
- Create note_revisions v0 (source='generated', diff='')
- Run heuristics + NZ meds checks → write one trace_evals row

### User Feedback (Server)
Accept rating/comment for the trace_id until first manual edit exists; afterwards return 409.

### Manual Edits (Client → Server)
**On blur:** create note_revisions v1+ with diff vs previous; compute draft→final edit distance (stored in memory or added later to traces if needed).

## 6. Heuristics (Content-First)

### Hallucination (Yes/No)
- Extract entities/claims from note: medications (also captured by NZ scan), conditions/diagnoses, procedures/investigations, numbers/dates
- Normalise and fuzzy-match against input text (transcription + typed input). If novel entity/claim lacks support in inputs → flag = true
- **Examples:** "CT shows pneumonia" when transcript has no CT; "started warfarin" with no med initiation mentioned

### Omission (Yes/No)
- From input, extract salient items: explicit requests/tasks (e.g., "sick note", "repeat script"), top N noun phrases/symptoms, obvious constraints
- Check coverage: each salient item appears (or clear paraphrase) in note; compute coverage ratio; below threshold (e.g., <0.6) → flag = true

### Notes
Simple, deterministic patterns; fast (<50 ms target). No section parsing required.

## 7. NZ Medication Checks (Transcription)

### Dictionary
NZULM generics + NZ brands; monthly refresh. Brand→generic map.

### Extraction
- Normalise transcription; Aho–Corasick/trie exact scan for speed
- Windowed n-grams (1–5) around cue words ("on", "taking", "prescribe", "mg", "tablet")

### Matching
- **Exact match** → NZ-valid
- **Fuzzy/phonetic** for near-miss (Levenshtein + Double-Metaphone); keep top 1–2 suggestions with confidence
- Suspects recorded as { heard, suggested, confidence }; advisory only

### Outputs (stored on trace_evals)
- `nz_meds_total`, `nz_meds_matched`, `nz_meds_unknown_count`, `nz_meds_unknown_list`
- `stt_meds_total`, `stt_meds_matched_nz`, `stt_meds_unknown_count`, `stt_meds_suspects`
- `nz_meds_data_version`

## 8. Idempotency and Retries

`trace_id` uniquely identifies a generation attempt.

**Re-submit with same trace_id:**
- If existing success → return existing record
- If pending/failed → update in place

## 9. Feature Flags and Config

- **`NOTES_EVALS_ENABLED`:** enable heuristics and NZ meds checks (on in preview)

### Thresholds (env or config)
- Omission coverage threshold (default 0.6)
- Fuzzy match threshold for meds (e.g., distance score ≥ 0.8)
- Max suspects per trace (e.g., 5)

## 10. Security, Privacy, Retention

- Store raw prompts/outputs (approved)
- Restrict access to staff/admin roles; tag environment (preview/prod)
- **NZULM data:** store version/date; refresh monthly
- **PHI:** all on your infra; no third-party submission in this design

## 11. Performance Targets

- Heuristics + meds checks add <50 ms p95 per generation
- NZ meds scan: tens of ms on 2k-word transcripts (Aho–Corasick + limited fuzzy)

## 12. Acceptance Tests

### Tracing/Idempotency
Same trace_id → one note_traces row, one v0 note_revisions.

### Heuristics
- **Hallucination:** crafted examples trigger true/false as expected
- **Omission:** explicit request in input missing in note → true; covered → false

### NZ Meds
- "paracetamol", "ibuprofen", "escitalopram", "metformin" → matched
- "acetaminophen", "Tylenol" → unknown
- "Augmentin", "Panadol" → matched via brand map
- **Suspect example:** heard "amoxycillin" → suggested "amoxicillin" (confidence high)

### Feedback
Rating/comment saved before first edit; blocked after first manual edit (409).

### Revisions
v0 draft present; v1+ edits with diffs; edit distance computed.

## 13. Rollout Plan (Preview)

- **Phase A:** DB migration + minimal tracing + v0 revision
- **Phase B:** Heuristics + NZ meds checks
- **Phase C:** Manual edit revisions + feedback capture

Observe metrics; tune thresholds; promote.

## 14. Risks and Mitigations

### False Positives on Hallucination/Omission
Keep thresholds conservative; allow manual override later (not in scope).

### NZ List Coverage
Start with NZULM + common brands; monitor unknown list to patch aliases.

### Tokens_used Availability
If provider doesn't return tokens on stream, approximate via tokenizer (optional later).

## 15. Open Items / Uncertainties

### Input Scope for Checks
**Assumption:** compare against both transcription and typed input. [Confirm]

### NZULM Licensing/Source
**Assumption:** permissible to host a local copy for matching. [Confirm]

### Fuzzy Thresholds
**Defaults proposed:** (coverage 0.6; med match 0.8). Adjust after preview telemetry. [Tunable]

### Edit Distance Storage
**Assumption:** compute and store later as needed (not required in v1 schema). [Optional]

### Feedback UX
**Assumption:** 0–5 stars + optional short comment, shown after generation, dismissible. [Confirm]

## 16. Example Trace Payload

```json
{
  "trace_id": "gen_1234",
  "session_id": "sess_abc",
  "user_id": "user_gp1",
  "created_at": "2025-09-02T21:10:00Z",
  "model": "gpt-4.1-mini",
  "system_prompt": "You are a medical scribe...",
  "user_prompt": "TEMPLATE: ...\\nTRANSCRIPTION: ...",
  "template_id": "tpl_default_gp",
  "output_text": "S: ...\\nO: ...\\nA+P: ...",
  "status": "success",
  "latency_ms": 1100,
  "tokens_used": 900,
  "user_rating": 5
}
```

## 17. Example Eval Record (Heuristics + NZ Meds)

```json
{
  "trace_id": "gen_1234",
  "evaluator": "heuristic",
  "created_at": "2025-09-02T21:10:02Z",
  "hallucination_flag": false,
  "omission_flag": true,
  "nz_meds_total": 3,
  "nz_meds_matched": 2,
  "nz_meds_unknown_count": 1,
  "nz_meds_unknown_list": ["acetaminophen"],
  "stt_meds_total": 4,
  "stt_meds_matched_nz": 3,
  "stt_meds_unknown_count": 1,
  "stt_meds_suspects": [
    { "heard": "amoxycillin", "suggested": "amoxicillin", "confidence": 0.93 }
  ],
  "nz_meds_data_version": "NZULM 2025-03"
}
```