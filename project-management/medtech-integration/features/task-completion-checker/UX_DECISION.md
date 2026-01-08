# Task Completion Checker; UX Decision (Claude.ai)
 
**Last Updated**: 2026-01-08  
**Status**: Documented; not building until ALEX READ unblocked  
**Owner**: Solo founder (GP)  
 
## Decision
Proceed with **Approach C: Passive background checking + dedicated Task Checker tab** as the preferred UX; defer final commitment until the ALEX READ 403 blocker is resolved, then reassess with real data and Medtech constraints.
 
## Why this approach
- **Passive > active**: clicking “check tasks” becomes another task; passive checking is more likely to be used.
- **Non-interrupting**: no modals or popups during consult; background checks only.
- **Review when convenient**: GP checks during breaks or end-of-day; not mid-consult.
 
## UX concept (high level)
- **Trigger**: when the patient context changes (close Patient A, open Patient B), enqueue a background check for the previous patient.
- **Surface**: a dedicated **Task Checker** tab/pane with a badge count (for example `Task Checker (3)`).
- **Queue behaviour**:
  - Sequential processing (rate-limited); ~2 second delay between patients.
  - Deduplicate to “one check per patient per day”.
  - Show states: `Checking now`, `Queued`, `Needs review`, `All clear`, `Failed`.
- **Results list** (accumulates throughout day):
  - Needs review: patient name/time; incomplete task count.
  - All clear: checked patients with zero outstanding items.
  - Optional: quiet toast when a check completes; never interrupt.
 
## Task model (conceptual)
`ExtractedTask`:
- `id`
- `type`: `lab | prescription | referral | other`
- `description`
- `confidence` (0-100)
- `evidence`: text snippet from note (Plan section)
- `status`: `pending | verified_complete | verified_incomplete | dismissed | failed`
- `verification`: resource id(s) and timestamps when matched (if available)
 
`TaskReviewSession`:
- key: `task-review:<patientIdentifier>:<YYYY-MM-DD>`
- retention: ~30 days (audit trail)
 
## Progressive delivery plan
These are the planned phases; build only after feasibility is confirmed.
 
### Phase 1; UI skeleton (can be built before ALEX READ)
- Tab layout; badge count; patient list sections.
- Task cards with states and one-click dismissal.
- Mock queue and mock data.
 
### Phase 2; AI extraction (can be built before ALEX READ)
- Prompt and parsing focused on SOAP Plan section.
- Confidence scoring and evidence extraction.
- Verification remains mocked.
 
### Phase 3; ALEX verification (blocked)
- Fetch: `DocumentReference` (and `Binary` if needed), `DiagnosticReport`, `MedicationRequest`, `Communication`, optional `Task`.
- Matching logic; retries; error handling.
 
### Phase 4; end-to-end integration
- Lightsail BFF routes; rate limiting; Ably for UI updates.
 
## Current blockers (must resolve before MVP)
1. **ALEX READ permissions**: ALEX returns 403 for `DocumentReference`, `DiagnosticReport`, `MedicationRequest`, `Communication`, `Task` via BFF.
2. **Medtech host support for passive mode**: need confirmation whether patient context changes can be detected, or whether the app is only “launch in context” with no runtime events.
 
## Fallback modes (if Medtech does not support passive hooks)
- If “tab/badge” not possible, keep the same UI but require manual refresh or manual queue; still avoid interrupting the consult.
- If neither patient-change detection nor a persistent surface is possible, revert to an explicit “Check tasks” action (Approach A); treat as last resort.
 
## Reassess point
After ALEX READ permissions are granted and we can retrieve real note text; rerun the validation script and reassess:
- feasibility of passive triggers in real Medtech environment
- extraction accuracy on real notes
- verification reliability and latency
 
