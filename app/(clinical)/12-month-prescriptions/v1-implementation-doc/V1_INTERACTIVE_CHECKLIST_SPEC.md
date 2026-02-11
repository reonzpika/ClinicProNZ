# v1 Interactive Checklist Specification

**Complete question flow, branching logic, and result calculation for v1**

---

## Overview

**5 Questions → 1 Result**

The checklist guides GPs through:
1. Legal exclusions (controlled drugs)
2. Medication monitoring check (NZF reference)
3. Patient stability assessment
4. Clinical judgment (choose duration)
5. Result summary

**Design principle:** No forced pathways. GPs can proceed through all questions even if "red flags" appear. The tool guides, doesn't mandate.

---

## Question 1: Controlled Drugs

### Display

```
Step 1 of 5

Is this a controlled drug?

[🔴 YES - This is a controlled drug] ← Red button
[🟢 NO - Not a controlled drug]      ← Green button
```

### Helper Text (below buttons)

"Controlled drugs have legal maximum durations:
- Class B (morphine, oxycodone, methylphenidate): Max 1 month
- Class C (tramadol, benzodiazepines, zopiclone): Max 3 months"

### Branching Logic

**If YES:**
- Store answer: "Controlled drug: Yes"
- Jump to RESULT
- Result type: 'stop'
- Result data:
  ```
  {
    type: 'stop',
    duration: 'Maximum 1-3 months (legal limit)',
    reason: 'This is a controlled drug. Class B controlled drugs: max 1 month (morphine, oxycodone, methylphenidate). Class C controlled drugs: max 3 months (tramadol, benzodiazepines, zopiclone, zolpidem).'
  }
  ```

**If NO:**
- Store answer: "Controlled drug: No"
- Continue to Q2

---

## Question 2: NZF Medication Check

### Display

```
Step 2 of 5

Have you checked this medication's monitoring requirements in NZF?

[📋 Yes, I've checked NZF]  ← Primary button
[⏭️ Skip for now]          ← Secondary/gray button
```

### Helper Text (below buttons)

**Expandable section: "What to check in NZF"**

```
▶ What should I check in NZF?

[When expanded:]
Check the medication in NZF for:
- Monitoring requirements (blood tests, ECG, etc.)
- How often monitoring is needed
- Renal dose adjustments
- Specific patient warnings

Common examples:
• Warfarin → INR monitoring (weekly to monthly)
• Metformin → eGFR monitoring (dose adjust if <45)
• ACE inhibitors → Renal function + K+ monitoring
• DOACs → CrCl monitoring (varies by drug)

→ Open NZF: https://nzf.org.nz
```

### Branching Logic

**If "Yes, I've checked":**
- Store answer: "NZF checked: Yes"
- Continue to Q3

**If "Skip for now":**
- Store answer: "NZF checked: Skipped"
- Continue to Q3

**Note:** Both options continue. This is just to encourage good practice.

---

## Question 3: Monitoring Frequency

### Display

```
Step 3 of 5

Based on NZF (or your clinical knowledge), does this medication require monitoring more often than annually?

Examples:
• Warfarin (INR monthly) → YES
• Statins (lipids annually) → NO
• Metformin in stable patient (renal annually) → NO
• Lithium (levels 3-monthly) → YES

[🔴 YES - Requires <annual monitoring]  ← Red button
[🟢 NO - Annual monitoring sufficient]   ← Green button
```

### Helper Text (below buttons)

"Medications requiring frequent monitoring (monthly, 3-monthly, 6-monthly) are generally not suitable for 12-month prescriptions."

### Branching Logic

**If YES (requires <annual monitoring):**
- Store answer: "Monitoring frequency: <Annual"
- Flag: monitoring_concern = true
- Continue to Q4

**If NO (annual sufficient):**
- Store answer: "Monitoring frequency: Annual or less"
- Flag: monitoring_concern = false
- Continue to Q4

---

## Question 4: Patient Stability

### Display

```
Step 4 of 5

Patient stability assessment

Check all that apply:

☐ Patient age <18 or pregnant
☐ Patient age ≥65
☐ Condition unstable or recently changed
☐ Medication dose changed in last 6 months
☐ Polypharmacy (5+ medications)
☐ Poor medication adherence history
☐ Barriers to accessing annual review

[Continue →]  ← Only shown after at least attempting selection (can select 0)
```

### Helper Text (above checkboxes)

"These are considerations for clinical judgment, NOT exclusions. Select any that apply to help inform your decision."

### Branching Logic

Count selected items:
- Store answer: List of selected items
- Calculate stability_flags = number of items checked
- Continue to Q5

---

## Question 5: Clinical Judgment

### Display

**If monitoring_concern = true:**

```
Step 5 of 5

Choose prescription duration

⚠️ Note: This medication requires monitoring more often than annually.

Based on your clinical judgment:

[3 months]   ← Recommended based on monitoring needs
[6 months]   ← RNZCGP recommended as safer
[12 months]  ← Your discretion (ensure monitoring plan)

```

**If monitoring_concern = false AND stability_flags = 0-1:**

```
Step 5 of 5

Choose prescription duration

✓ Patient appears suitable for longer prescription.

Based on your clinical judgment:

[3 months]   ← Traditional standard
[6 months]   ← RNZCGP recommended as safer  
[12 months]  ← Maximum duration
```

**If monitoring_concern = false AND stability_flags ≥ 2:**

```
Step 5 of 5

Choose prescription duration

⚠️ Note: Multiple patient factors identified (see below)

Based on your clinical judgment:

[3 months]   ← More frequent touchpoints
[6 months]   ← RNZCGP recommended (safer)
[12 months]  ← Your discretion (ensure support)
```

### Helper Text (below buttons)

Show the stability flags selected in Q4 as reminder

### Branching Logic

**If 3 months selected:**
- Store answer: "Duration chosen: 3 months"
- Result type: 'suitable'
- Result data:
  ```
  {
    type: 'suitable',
    duration: '3 months (traditional standard)',
    reason: 'You chose 3 months for closer monitoring. This is the traditional prescription standard and provides more frequent clinical touchpoints.'
  }
  ```

**If 6 months selected:**
- Store answer: "Duration chosen: 6 months"
- Result type: 'suitable'
- Result data:
  ```
  {
    type: 'suitable',
    duration: '6 months (RNZCGP recommended)',
    reason: 'You chose 6 months. This aligns with RNZCGP\'s recommended duration as safer than 12 months - allows for more frequent medication reconciliation and monitoring.'
  }
  ```

**If 12 months selected:**
- Store answer: "Duration chosen: 12 months"
- Result type: 'suitable'
- Result data:
  ```
  {
    type: 'suitable',
    duration: '12 months',
    reason: 'You chose 12 months. Ensure annual review is booked and patient understands to contact practice if condition changes. Document monitoring plan.'
  }
  ```

---

## Result Screen

### Display

```
[Color-coded box based on result type]

[Emoji + Heading]
Decision: [duration]

Rationale: [reason]

[📋 Copy Summary]  ← Primary button
[↻ Start New Decision]  ← Secondary button
```

### Copy Summary Format

```
12-Month Prescription Decision

Decision: [duration]

Rationale: [reason]

Questions answered:
- Controlled drug: [Yes/No]
- NZF checked: [Yes/Skipped]
- Monitoring frequency: [Annual/More frequent]
- Patient factors: [list or "None identified"]
- Duration chosen: [3mo/6mo/12mo]

Tool: https://clinicpro.co.nz/12-month-prescriptions
Date: [Today's date]
```

### Result Types

**Type: 'stop'** (Controlled drug)
- Border: Red
- Emoji: 🔴
- Heading: "Not Suitable for 12 Months"

**Type: 'suitable'** (All other outcomes)
- Border: Green
- Emoji: ✅
- Heading: "Prescription Decision"

---

## Progress Indicator

All screens show:

```
Step X of 5
[Progress bar: X/5 filled]
```

Progress bar:
- Q1 = 20% filled
- Q2 = 40% filled
- Q3 = 60% filled
- Q4 = 80% filled
- Q5 = 100% filled
- Result = 100% filled (stays full)

---

## Back Button

- Q1: No back button (start of flow)
- Q2-Q5: "← Back" button (top left or bottom left)
- Result: No back button (use "Start New Decision")

Back button behavior:
- Goes to previous question
- Preserves previous answers (pre-filled)
- Can change answer and continue

---

## Example Walkthroughs

### Example 1: Simple Green Case (Amlodipine)

**Q1:** Controlled drug? → NO  
**Q2:** Checked NZF? → Yes, I've checked  
**Q3:** Requires <annual monitoring? → NO (BP annually)  
**Q4:** Patient factors? → None selected  
**Q5:** Duration? → 12 months  

**Result:**
```
✅ Prescription Decision
Decision: 12 months
Rationale: You chose 12 months. Ensure annual review is booked and patient understands to contact practice if condition changes. Document monitoring plan.
```

---

### Example 2: Elderly Patient on Metformin

**Q1:** Controlled drug? → NO  
**Q2:** Checked NZF? → Yes, I've checked  
**Q3:** Requires <annual monitoring? → NO (eGFR >45, annual OK)  
**Q4:** Patient factors? → ☑ Age ≥65  
**Q5:** Duration? → 6 months  

**Result:**
```
✅ Prescription Decision
Decision: 6 months (RNZCGP recommended)
Rationale: You chose 6 months. This aligns with RNZCGP's recommended duration as safer than 12 months - allows for more frequent medication reconciliation and monitoring.
```

---

### Example 3: Controlled Drug (Diazepam)

**Q1:** Controlled drug? → YES  

**Result (immediate):**
```
🔴 Not Suitable for 12 Months
Decision: Maximum 1-3 months (legal limit)
Rationale: This is a controlled drug. Class B controlled drugs: max 1 month (morphine, oxycodone, methylphenidate). Class C controlled drugs: max 3 months (tramadol, benzodiazepines, zopiclone, zolpidem).
```

---

### Example 4: Warfarin

**Q1:** Controlled drug? → NO  
**Q2:** Checked NZF? → Yes, I've checked  
**Q3:** Requires <annual monitoring? → YES (INR monthly)  
**Q4:** Patient factors? → ☑ Age ≥65  
**Q5:** Duration? → 3 months  

**Result:**
```
✅ Prescription Decision
Decision: 3 months (traditional standard)
Rationale: You chose 3 months for closer monitoring. This is the traditional prescription standard and provides more frequent clinical touchpoints.
```

---

### Example 5: Polypharmacy + Barriers

**Q1:** Controlled drug? → NO  
**Q2:** Checked NZF? → Skip for now  
**Q3:** Requires <annual monitoring? → NO  
**Q4:** Patient factors? → ☑ Polypharmacy (5+ meds), ☑ Barriers to accessing annual review  
**Q5:** Duration? → 12 months  

**Result:**
```
✅ Prescription Decision
Decision: 12 months
Rationale: You chose 12 months. Ensure annual review is booked and patient understands to contact practice if condition changes. Document monitoring plan.

[Note: The tool doesn't force a decision - GP chose 12mo despite barriers, possibly because 12mo IMPROVES access by reducing transport burden]
```

---

## Edge Cases

### User navigates back and changes answer

**Scenario:** Q1: NO → Q2: Skip → Q3: YES → [Back] → Q2: Yes checked

**Behavior:**
- Allow answer change
- When they continue from Q2, flow proceeds normally to Q3
- Previous Q3 answer can be pre-filled (optional) or reset

### User selects contradictory options

**Example:** Q3: NO (annual monitoring OK) + Q4: Multiple stability flags → Q5: Still chooses 12mo

**Behavior:**
- Tool allows this - it's GP's clinical judgment
- Result doesn't judge the decision
- Summary reflects their choices accurately

### User closes browser mid-flow

**Behavior:**
- State is lost (no persistence in v1)
- Must start over
- Future: Could add localStorage persistence

---

## Technical Notes for Implementation

### State Management

```typescript
type Answer = {
  step: string;
  question: string;
  answer: string;
};

const [answers, setAnswers] = useState<Answer[]>([]);
```

Store each answer as user progresses.

### Result Calculation Logic

```typescript
// After Q5, calculate result:

if (controlledDrug === 'yes') {
  // Already handled at Q1
}

const result = {
  type: 'suitable',
  duration: durationChosen, // from Q5
  reason: getReasonText(durationChosen), // helper function
};
```

### Copy to Clipboard

```typescript
const copySummary = () => {
  const summary = `
12-Month Prescription Decision

Decision: ${result.duration}

Rationale: ${result.reason}

Questions answered:
${answers.map(a => `- ${a.question}: ${a.answer}`).join('\n')}

Tool: https://clinicpro.co.nz/12-month-prescriptions
Date: ${new Date().toLocaleDateString('en-NZ')}
  `.trim();

  navigator.clipboard.writeText(summary);
  // Show "Copied!" feedback
};
```

---

## Accessibility Requirements

- All buttons must have clear focus states
- Keyboard navigation (Tab, Enter, Escape)
- Progress indicator must be ARIA-labeled
- Expandable sections must use proper ARIA attributes
- Color not sole indicator (use icons + text)

---

## Mobile Responsiveness

- All buttons stack vertically on mobile (<640px)
- Text remains readable (min 16px)
- Touch targets min 44x44px
- Progress bar visible on all screen sizes

---

**End of Specification**
