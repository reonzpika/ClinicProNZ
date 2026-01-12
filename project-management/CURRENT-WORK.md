# Current Work

> Canonical root-level ops doc for the AI and founder.
> For detailed history and evidence, use each project’s `LOG.md`.

## Top priorities (this week)
1. Implement ALEX Vendor Forms launch mechanism (proper Medtech integration): create icon, implement BFF decode endpoint, implement frontend launch route, test with F99669-C.
2. Re-test UI integration after proper launch (may fix Inbox/Daily Record issues).
3. Customer-side launch prep for Medtech Images (pricing constraints, competitor pricing, tester follow-up).

## Active work queue (max 10)
- [x] Bring `F99669-C` online (Windows desktop always-on; Hybrid Connection Manager running) and capture Phase 1D UI evidence.
- [x] Phase 1D UI validation complete: images reach Medtech but UI integration incomplete (broken links in Inbox, missing from Daily Record).
- [x] Received launch mechanism guidance from Defne (ALEX Vendor Forms integration method).
- [x] Create icon for ClinicPro Images widget (32x32 or 64x64 PNG).
- [ ] Implement BFF launch decode endpoint: `/api/medtech/launch/decode` (calls ALEX vendorforms API).
- [ ] Implement frontend launch route: `/medtech-images/launch` (decodes context and redirects to widget).
- [ ] Load icon into F99669-C via MT Icon Loader and configure ALEX Apps Configuration.
- [ ] Test launch mechanism locally with F99669-C.
- [ ] Re-test UI integration: do images now appear inline in Inbox/Daily Record after proper launch?
- [ ] Wait for Medtech commercial terms reply; update pricing approach accordingly.

## Constraints and targets (this week)
- Customer work target: 5 touches; current: 1/5.
- Active build projects: 2 (Medtech Integration primary; PM AI SaaS maintenance only).
- Key blocker: Images commit successfully to ALEX but UI integration incomplete (broken links in Inbox, missing from Daily Record); implementing proper launch mechanism may resolve this; estimate 4-6 hours implementation time.

## Key metrics (quick)
- Paying clinics: 0 (target: 5 by end of Q1)
- MRR: $0 (target: $500 by end of Q1)
- Features launched: 0/5 (target: 1 by Jan 31)
