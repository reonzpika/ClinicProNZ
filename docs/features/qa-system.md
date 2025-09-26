# ClinicPro QA Systems

## Purpose

This document defines the end-to-end Quality Assurance (QA) signals, tracking, and verification flows across ClinicPro, with emphasis on consultation workflows, transcription, generated notes, structured Additional Notes, and cost tracking systems.

## Scope

- Desktop and mobile recording QA checkpoints
- Transcription persistence and reconstruction checks
- Consultation note generation QA
- Additional Notes structure and persistence (implemented)
- API cost tracking and monitoring (implemented)
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

- `database/schema/api_usage_costs.ts` (NEW)
  - `userId`: user identifier for cost attribution
  - `sessionId`: patient session for cost attribution
  - `apiProvider`: 'deepgram' | 'openai' | 'perplexity'
  - `apiFunction`: 'transcription' | 'note_generation' | 'chat'
  - `usageMetrics`: JSONB with provider-specific metrics (duration, tokens, requests)
  - `costUsd`: calculated cost in USD (precision: 10,6)

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

## API Cost Tracking System (IMPLEMENTED)

### Purpose
Real-time tracking and monitoring of API usage costs across Deepgram, OpenAI, and Perplexity services for administrative oversight and cost management.

### Implementation Status: ✅ COMPLETE

#### Cost Calculation Services
- **Real-time pricing**: Updated 2024 API costs
  - **Deepgram Nova-3**: $0.0043/minute
  - **OpenAI GPT-5 mini**: $0.25/1M input, $2.00/1M output tokens
  - **Perplexity Sonar**: $1/1M input, $1/1M output tokens + $5-12 per 1000 requests
- **Precision**: 6 decimal places for accurate micro-cost tracking
- **Service**: `src/features/admin/cost-tracking/services/costCalculator.ts`

#### API Integration Points
1. **Deepgram Transcription** (`/api/(clinical)/deepgram/transcribe/route.ts`)
   - Tracks audio duration in minutes for both persist/non-persist modes
   - Calculates cost: `duration × $0.0043`
   - Records usage per user and session

2. **OpenAI Note Generation** (`/api/(clinical)/consultation/notes/route.ts`)
   - Tracks input/output tokens from streaming responses
   - Calculates cost: `(input_tokens × $0.25/1M) + (output_tokens × $2.00/1M)`
   - Supports cached input token pricing

3. **Perplexity Chat** (`/api/(clinical)/consultation/chat/route.ts`)
   - Tracks input/output tokens plus request counts
   - Calculates cost: `(tokens × $1/1M) + (requests × $5-12/1000)`
   - Context size awareness (low/medium/high)

#### Admin Dashboard
- **Location**: `/admin` → "Cost Tracking" tab
- **Features**:
  - Total cost metrics and breakdowns
  - Per-user cost analysis with provider/function breakdowns
  - Real-time cost visualization with charts and tables
- **Access Control**: Admin-only via existing RBAC
- **Components**: `src/features/admin/cost-tracking/components/`

#### Database Storage
- **Table**: `api_usage_costs` with foreign keys to users and sessions
- **Retention**: Permanent storage for historical analysis
- **Performance**: Indexed queries for efficient cost aggregation

#### API Endpoints
- **`/api/admin/cost-tracking/summary`**: Overall cost metrics
- **`/api/admin/cost-tracking/users`**: Per-user cost breakdowns
- **Protection**: Admin-only access with RBAC validation

### Cost Tracking QA Signals
- **API Call Logging**: Every API request logs cost data to database
- **Error Handling**: Cost tracking failures don't affect core functionality
- **Data Integrity**: Foreign key constraints ensure cost attribution accuracy
- **Real-time Updates**: Admin dashboard reflects latest costs within 5 minutes

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

## Implementation Status Summary

### ✅ IMPLEMENTED FEATURES

1. **API Cost Tracking System**
   - Real-time cost calculation for all APIs (Deepgram, OpenAI, Perplexity)
   - Database storage with user/session attribution
   - Admin dashboard with metrics and breakdowns
   - Per-user cost analysis and visualization

2. **Structured Additional Notes**
   - Four-field SOAP structure (Problems, Objective, Assessment, Plan)
   - Database persistence in dedicated columns
   - UI components for structured input
   - Template compilation with SOAP sections

3. **Core Session Management**
   - Session creation, switching, and clearing functionality
   - Transcription persistence and reconstruction
   - Generated notes storage and retrieval
   - Mobile image handling with Ably synchronization

### 🔄 PARTIALLY IMPLEMENTED

1. **QA Checkpoints**
   - Basic persistence verification for sessions and notes
   - Manual testing workflows for core functionality
   - Server-client state synchronization via Ably

### ❌ NOT YET IMPLEMENTED

1. **Advanced Change Tracking**
   - `diff-match-patch` integration for text change tracking
   - Automated QA validation workflows
   - Historical change audit trails

2. **Clinical NLP Enhancement**
   - `medspaCy` integration for clinical entity extraction
   - Automated section detection and validation
   - NZ-specific clinical terminology rules

3. **Automated QA Signals**
   - Systematic validation of transcription reconstruction
   - Additional Notes persistence verification
   - Cross-session state consistency checks

### Recommended Next Steps

1. **Immediate (High Priority)**
   - Implement automated QA validation for session state consistency
   - Add transcription reconstruction verification tests

2. **Medium Term**
   - Integrate `diff-match-patch` for change tracking
   - Enhance Additional Notes validation with canonical markers

3. **Long Term**
   - Implement `medspaCy` for clinical text analysis
   - Build comprehensive QA monitoring dashboard

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

### Cost Tracking Enhancements
- Session-level cost analysis and breakdown
- Cost alerts and budget thresholds
- Historical cost trending and forecasting
- Export cost reports for accounting/billing

### QA System Enhancements
- Automated QA test suites for session state consistency
- Real-time validation of transcription reconstruction
- Change tracking with `diff-match-patch` integration
- Clinical NLP with `medspaCy` for entity extraction

### Additional Notes Enhancements
- Export helpers to render/parse the four Additional Notes fields with canonical headers
- Automated validation of SOAP section markers
- Template-driven section suggestions and auto-completion