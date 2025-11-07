# Claims Toolkit ? Templates and Checklists
## Submission-Ready

---

## Timesheet Template (Weekly; Copy/Paste into a Doc or Sheet)

### Header

- **Company:** NexWave Solutions Ltd
- **Employee:** [Your name] (shareholder-employee; PAYE)
- **Week commencing:** [YYYY-MM-DD]
- **Location:** NZ; AU compute is transient only (no persistent PHI outside NZ)

### Objectives and Codes

**R&D Objectives:**
- **O1** Baseline/datasets
- **O2** NZ domain adaptation
- **O3** Safety/assist-only
- **O4** Medtech sandbox/inbox
- **O5** Pilot-readiness

**Capability Development:**
- **CD-A** Regulatory & Compliance
- **CD-B** R&D Information Management
- **CD-C** PM set-up

### Daily Entries (One Line Per Session)

| Date | Start?End | Hours | Objective | Task Summary | Artefact/Evidence |
|------|-----------|-------|-----------|--------------|-------------------|
| 2026-02-03 | 09:00?12:00 | 3.0 | O3 | Implement refusal scaffolds; test safety classifier on synthetic set v0.3 | MLflow run ID cp-safety-003 |
| 2026-02-03 | 13:00?15:00 | 2.0 | CD-A | Draft DPIA (IPP 12 annex + region locks) | DPIA_v0.4 sections 6?7 |
| 2026-02-04 | 10:00?13:00 | 3.0 | O2 | LoRA tuning pass on NZ term set; eval | DVC tag nz-terms-v1 |
| 2026-02-04 | 14:00?17:00 | 3.0 | O1 | Curate synthetic inbox dataset; tag and version | DVC tag inbox-synth-v2 |
| 2026-02-05 | 09:00?12:00 | 3.0 | O4 | Build Medtech sandbox connector; least-privilege scopes | GitHub commit abc123 |
| 2026-02-06 | 10:00?12:30 | 2.5 | CD-B | Configure MLflow tracking; create project workspace | MLflow project init |
| 2026-02-07 | 09:00?11:00 | 2.0 | O3 | Run safety regression pack; document refusal rates | Safety-Dashboard_2026-02 |

### Weekly Summary and Sign-Offs

**Hours by Objective:**
- O1: [h] O2: [h] O3: [h] O4: [h] O5: [h]
- CapDev: CD-A [h] CD-B [h] CD-C [h]

**Total eligible hours this week:** [sum]

**Signatures:**
- **Employee:** ___________________ Date: ___________
- **Director:** ___________________ Date: ___________

---

## Quarterly Claim Evidence Checklist (Attach in Forge)

### Required Every Claim (Minimum Quarterly)

- [ ] **Completed Cost Template** (Excel) with all tabs and Objective links
- [ ] **GST tax invoice** to Callaghan for 40% of eligible costs (excl. GST), dated on or after the claim period end
- [ ] **Timesheets** (signed) mapped to Objectives/CapDev
- [ ] **Payroll evidence** for internal labour (PAYE report and bank transaction proof)
- [ ] **Materials & consumables invoices** and proof of payment (monthly statements acceptable)
- [ ] **If any international invoices** (not expected): NZD proof of payment (bank statement)

### Q1 Specific (Capability Completion)

**Certificates:**
- [ ] OPC Privacy Act 2020
- [ ] OPC HIPC Health 101
- [ ] Ko Awatea Privacy (National)

**Regulatory & Compliance Artefacts:**
- [ ] DPIA v1.0 (Option B)
- [ ] IPP 12 checklist
- [ ] HISO 10029 mapping
- [ ] DPA templates (draft)
- [ ] Transparency SOP

**R&D Information Management Artefacts:**
- [ ] MLflow/DVC screenshots
- [ ] Safety dashboard initial setup

**Project Management Artefacts:**
- [ ] Stage-gates (O1?O5)
- [ ] Risk/change logs (initial)
- [ ] Release checklist

### Q2?Q4 Updates

- [ ] **Transparency page v1** and monthly updates (export PDF)
- [ ] **Safety dashboard screenshots** and monthly safety regression summary
- [ ] **Any updated DPAs** and sub-processor list
- [ ] **Change log entries**

---

## GST Invoice Template (To Callaghan; Copy/Paste)

```
INVOICE

Supplier:
NexWave Solutions Ltd
NZBN: [xxxx xxxx xxxx]
GST No: [xx-xxx-xxx]
[Address]
[Email]
[Phone]

To:
Callaghan Innovation
[Grants team email/portal reference]

Invoice Details:
Invoice Number: NWS-RND-Q[1/2/3/4]-2026
Date: [dd mmm yyyy]
Contract ID: [from portal]

Description:
New to R&D Grant claim for period [start date] to [end date]
40% of eligible costs as per attached Cost Template

Amounts:                                    NZD
Subtotal (excl. GST):                  $[amount]
GST (15%):                             $[0.15 ? subtotal]
Total (incl. GST):                     $[1.15 ? subtotal]

Payment Details:
Bank Account: [Account name]
Account Number: [xx-xxxx-xxxxxxx-xxx]

Contact:
[Name]
[Email]
[Phone]
```

---

## Claim Calculation Steps (Keep Consistent with Cost Template)

### For Each Quarter:

1. **Sum eligible costs:**
   - Internal labour (timesheets ? $96/hr)
   - CapDev one-off set-up labour
   - M&C for the quarter

2. **Exclude:**
   - Any ineligible costs
   - Outside-period costs

3. **Calculate claim:**
   ```
   Claim amount (excl. GST) = 0.40 ? Quarter's eligible costs
   ```

4. **Issue GST invoice:**
   - Invoice Callaghan for the claim amount (excl. GST)
   - Add 15% GST on the invoice total

### Example (Q1):

- **Eligible costs:** $22,568
- **Claim (40%):** $9,027 (excl. GST)
- **GST (15%):** $1,354
- **Invoice total:** $10,381 (incl. GST)

---

## Claim Calendar (Start 27 Jan 2026)

| Quarter | Period | Claim Submission | Grant Receipt |
|---------|--------|------------------|---------------|
| **Q1** | Jan?Mar (Months 1?3) | By 30 Apr latest | Month 4 |
| **Q2** | Apr?Jun (Months 4?6) | By 31 Jul latest | Month 7 |
| **Q3** | Jul?Sep (Months 7?9) | By 31 Oct latest | Month 10 |
| **Q4** (final) | Oct?Dec (Months 10?12) | By 31 Jan latest | Month 13 |

**Note:** Final report due within 3 months of project end date (26 Jan 2027)

---

## Progress Note Template (Reuse Each Claim; 1?2 Pages)

### Summary

- **Period covered:** [Q1/Q2/Q3/Q4: start date ? end date]
- **Headline progress:** [Brief summary of achievements]
- **Status:** On-track / Off-track / At-risk
- **Key risks and mitigations:** [Bullet points]

### Objectives Update

#### O1: Baseline and Dataset Curation
- **Deliverables completed:** [List]
- **Metrics:** [Baseline latency P95, edit distance, etc.]
- **Next steps:** [If applicable]

#### O2: NZ GP Domain Adaptation
- **Experiments:** [Continual pretraining, instruction tuning passes]
- **Improvements:** [% edit-distance reduction vs baseline; template conformity]
- **Next steps:** [Further tuning, evaluation]

#### O3: Safety and Assist-Only Enforcement
- **Policy/classifier updates:** [Refusal scaffolds, claim/PII classifiers]
- **Refusal metrics:** [Appropriateness %, prohibited-claim rate]
- **Next steps:** [Monthly regression pack; refinements]

#### O4: Medtech Sandbox and Synthetic Inbox
- **Connectors:** [Sandbox setup, least-privilege scopes]
- **Synthetic loads:** [Inbox generators, test scenarios]
- **Latency/throughput:** [P95 response time; stable throughput]
- **Next steps:** [Scale tests; transparency page]

#### O5: Pilot-Readiness and Evaluation
- **Telemetry:** [Logging, monitoring setup]
- **Playbooks:** [Incident response, rollback procedures]
- **Evaluation prep:** [Clinician feedback framework]
- **Next steps:** [Pre-pilot checklist]

### Capability Development

- **Certificates completed:** [OPC Privacy Act 2020; OPC HIPC; Ko Awatea] (attach)
- **DPIA/IPP 12/HISO artifacts:** [Status and version]
- **MLflow/DVC:** [Setup complete; sample runs logged]
- **Transparency SOP:** [Published; update cadence established]
- **PM artefacts:** [Stage-gates defined; risk/change logs active]

### Metrics (Current vs Target)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Inbox triage time reduction | ? 30% (Month 10) | [%] | [On/Off track] |
| Coding accuracy | ? 85% | [%] | [On/Off track] |
| Referral acceptance rate | ? 90% | [%] | [On/Off track] |
| Care gap detection accuracy | ? 85% | [%] | [On/Off track] |
| Clinician usefulness | ? 80% (all 4 use cases) | [%] | [On/Off track] |
| Refusal appropriateness | ? 95% | [%] | [On/Off track] |
| Prohibited-claim rate | ? 0.5% | [%] | [On/Off track] |
| Response time P95 | ? 5.0 s (all use cases) | [s] | [On/Off track] |

### Spend Summary (excl. GST)

| Category | This Quarter (NZD) | Cumulative (NZD) |
|----------|-------------------|------------------|
| Labour (R&D) | $[amount] | $[amount] |
| Labour (CapDev) | $[amount] | $[amount] |
| Materials/consumables | $[amount] | $[amount] |
| **Total eligible** | **$[amount]** | **$[amount]** |
| **Claimed (40%)** | **$[amount]** | **$[amount]** |

### Changes/Approvals

- **Scope/time shifts:** [None / Detail any changes]
- **Risk escalations:** [None / Detail any new risks]
- **Requests:** [None / Any approvals or guidance needed]

---

## File Naming Conventions (To Keep Evidence Tidy)

### Cost and Financial Evidence
- `Cost-Template_Q[1?4]_2026.xlsx`
- `GST-Invoice_Callaghan_Q[1?4]_2026.pdf`
- `Timesheets_Q[1?4]_2026.pdf`
- `Payroll-Summary_Q[1?4]_2026.pdf`
- `M&C-Invoices_Q[1?4]_2026.pdf`

### Compliance and Safety Artefacts
- `DPIA_v1.0.pdf`
- `IPP12-Checklist_v1.0.pdf`
- `HISO-Mapping_v1.0.pdf`
- `Transparency-SOP_v1.0.pdf`
- `Transparency-Page_v1.0_[date].pdf`
- `Safety-Dashboard_[yyyy-mm].pdf`

### Project Management Artefacts
- `Stage-Gates_O1-O5_v1.0.pdf`
- `Risk-Register_[date].xlsx`
- `Change-Log_[date].xlsx`
- `Release-Checklist_v1.0.pdf`

### Certificates
- `OPC-Privacy-Act-Certificate_[YYYYMMDD].pdf`
- `OPC-HIPC-Health101-Certificate_[YYYYMMDD].pdf`
- `KoAwatea-Privacy-Certificate_[YYYYMMDD].pdf`

---

## Common Pitfalls and How to Avoid Them

### 1. Drawings Instead of PAYE

**Pitfall:** Claiming drawings as eligible labour
**Solution:**
- Set yourself on PAYE
- Claim eligible R&D/CapDev hours only
- Provide payroll reports and PAYE evidence

### 2. Missing Evidence

**Pitfall:** Incomplete documentation at claim time
**Solution:**
- Attach timesheets, payroll proofs, invoices, certificates
- Keep a quarterly evidence folder
- Use checklist before submitting each claim

### 3. Claiming Unlinked Costs

**Pitfall:** Costs not mapped to Objectives/CapDev
**Solution:**
- Ensure each cost is linked to an Objective/CapDev in the Objective Costing tab
- Review Cost Template before each claim

### 4. Capability Development < 5%

**Pitfall:** CapDev falls below 5% of grant
**Solution:**
- Keep 30 hours of one-off set-ups ($2,880)
- Adjust up before Q1 claim if needed
- Current allocation: 6.7% ?

### 5. Overseas Labour

**Pitfall:** Accidentally claiming overseas labour
**Solution:**
- Avoid overseas labour entirely
- AU compute only is OK under IPP 12
- No labour outside NZ without express approval

### 6. GST Mismatches

**Pitfall:** GST incorrectly calculated or claimed
**Solution:**
- Issue GST invoice for 40% portion (excl. GST base)
- Track GST in/out in your cashflow
- Invoice Callaghan with 15% GST added to the 40% claim amount

---

## Submission Steps in Forge (Each Claim)

### Step 1: Prepare Evidence Pack
- [ ] Complete Cost Template for the quarter
- [ ] Generate and sign timesheets
- [ ] Collect payroll evidence (PAYE reports, bank proofs)
- [ ] Collect M&C invoices and payment proofs
- [ ] Compile CapDev evidence (Q1 only: certificates, DPIA, etc.)
- [ ] Create GST invoice to Callaghan

### Step 2: Log In to Forge
- [ ] Navigate to your application
- [ ] Go to Claims section

### Step 3: Upload Documents
- [ ] Upload Cost Template (XLSX)
- [ ] Upload GST invoice (PDF)
- [ ] Upload evidence pack PDFs
- [ ] Upload progress note

### Step 4: Enter Claim Details
- [ ] Enter claim totals (excl. GST)
- [ ] Enter period dates (start/end)
- [ ] Confirm all declarations

### Step 5: Submit and Track
- [ ] Submit claim
- [ ] Note confirmation number
- [ ] Note any follow-up requests from your Funding Engagement Specialist
- [ ] Expect grant payment in following month

---

## Ready-to-Use Artefacts (Available on Request)

1. **Timesheet (fillable PDF/Doc and Google Sheet)**
   - Pre-formatted with Objective codes
   - Automatic hour calculations
   - Sign-off fields

2. **Quarterly evidence pack folder structure (ZIP)**
   - Pre-organized folders for each quarter
   - File naming templates
   - Checklist for each claim

3. **Progress note (Doc template)**
   - All sections pre-formatted
   - Objectives update tables
   - Metrics tracking template

4. **GST invoice (Word/PDF template with your details)**
   - Pre-filled with NexWave details
   - Automatic GST calculation
   - Professional formatting

---

## Quarterly Claim Summary Table

| Quarter | Eligible Costs | Grant (40%) | Key Evidence |
|---------|----------------|-------------|--------------|
| **Q1** | $22,568 | $9,027 | Certificates (3), DPIA, IPP 12, HISO, MLflow/DVC, PM artefacts |
| **Q2** | $25,560 | $10,224 | DPA templates, NAIAEAG note, Transparency page, Safety dashboard |
| **Q3** | $30,552 | $12,221 | Safety regressions, Transparency updates, Change logs |
| **Q4** | $30,552 | $12,221 | Final report, All cumulative evidence, Pilot-readiness checklist |
| **Total** | **$109,232** | **$43,693** | |

---

**END OF CLAIMS TOOLKIT**
