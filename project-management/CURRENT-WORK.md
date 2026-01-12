# Current Work

> Canonical root-level ops doc for the AI and founder.
> For detailed history and evidence, use each project’s `LOG.md`.

## Top priorities (this week)
1. Investigate Medtech Evolution UI integration issue (images show as broken links, not inline; missing from Daily Record) and contact Medtech support for guidance.
2. Customer-side launch prep for Medtech Images (pricing constraints, competitor pricing, tester follow-up).
3. Keep system stable; minimal maintenance for non-primary projects.

## Active work queue (max 10)
- [x] Bring `F99669-C` online (Windows desktop always-on; Hybrid Connection Manager running) and capture Phase 1D UI evidence.
- [x] Phase 1D UI validation complete: images reach Medtech but UI integration incomplete (broken links in Inbox, missing from Daily Record).
- [ ] Contact Medtech support: ask how to properly commit images for inline display in Inbox and Daily Record (not as links).
- [ ] Investigate whether DocumentReference or Communication resource is required alongside Media for proper UI integration.
- [ ] Review ALEX docs for Media upload best practices and required resource structure.
- [ ] Wait for Medtech commercial terms reply; update pricing approach accordingly.
- [ ] Wait for Intellimed (QuickShot) pricing reply; compare positioning.
- [ ] Defer GP tester follow-up until UI integration is fixed (not production-ready yet).
- [ ] Defer Ting post coordination until UI integration is fixed.

## Recent context (last 3 sessions)
- 2026-01-11 Sat: Phase 1D UI validation complete; images commit successfully but UI integration incomplete (show as broken links in Inbox, not in Daily Record); need Medtech guidance.
- 2026-01-10 Sat: Learned correct ALEX search URL format from Medtech (use patient.identifier, not patient=id); updated BFF media endpoint.
- 2026-01-08 Thu: ALEX UAT investigation; token roles confirmed; direct ALEX searches return 403; emailed Medtech support; launched customer-side pricing intel requests.

## Constraints and targets (this week)
- Customer work target: 5 touches; current: 1/5.
- Active build projects: 2 (Medtech Integration primary; PM AI SaaS maintenance only).
- Key blocker: Images commit successfully to ALEX but UI integration incomplete (display as broken links in Inbox, missing from Daily Record); need Medtech support guidance on proper FHIR resource structure for inline image display.

## Key metrics (quick)
- Paying clinics: 0 (target: 5 by end of Q1)
- MRR: $0 (target: $500 by end of Q1)
- Features launched: 0/5 (target: 1 by Jan 31)
