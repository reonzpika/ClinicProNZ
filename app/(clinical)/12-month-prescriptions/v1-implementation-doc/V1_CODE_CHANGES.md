# v1 Code Changes: Implementation Guide

**Step-by-step instructions for modifying existing code to implement v1**

---

## Implementation Order

Follow this order to minimize errors:

1. ✅ Create new DecisionWizard component (complete rewrite)
2. ✅ Update page.tsx (remove unused sections, add medication guidance)
3. ✅ Test checklist flow
4. ✅ Test medication accordion
5. ✅ Final QA

**Estimated time:** 4-6 hours

---

## File 1: `DecisionWizard.tsx` (COMPLETE REWRITE)

**Location:** `src/features/12-month-prescriptions/components/DecisionWizard.tsx`

**Action:** Replace entire file with new implementation

### New Type Definitions

```typescript
type Step =
  | 'controlled-drug'
  | 'nzf-check'
  | 'monitoring-frequency'
  | 'patient-stability'
  | 'clinical-judgment'
  | 'result';

type Answer = {
  step: string;
  question: string;
  answer: string;
};

type Result = {
  type: 'stop' | 'suitable';
  duration: string;
  reason: string;
};
```

### State Variables

```typescript
const [currentStep, setCurrentStep] = useState<Step>('controlled-drug');
const [answers, setAnswers] = useState<Answer[]>([]);
const [monitoringConcern, setMonitoringConcern] = useState(false);
const [stabilityFlags, setStabilityFlags] = useState<string[]>([]);
const [result, setResult] = useState<Result | null>(null);
const [copyFeedback, setCopyFeedback] = useState(false);
```

### Step Numbers for Progress Bar

```typescript
const totalSteps = 5;
const stepNumber = {
  'controlled-drug': 1,
  'nzf-check': 2,
  'monitoring-frequency': 3,
  'patient-stability': 4,
  'clinical-judgment': 5,
  'result': 5, // Keep at 5 to show 100%
}[currentStep];
```

### Progress Bar Component (reuse existing)

```tsx
<div className="mb-2 flex items-center justify-between">
  <span className="text-sm font-medium text-text-tertiary">
    Step {stepNumber} of {totalSteps}
  </span>
  <div className="mx-4 h-2 flex-1 rounded-full bg-gray-200">
    <div
      className="h-2 rounded-full bg-primary transition-all duration-300"
      style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
    />
  </div>
</div>
```

### Question 1: Controlled Drug

**Full JSX:**

```tsx
if (currentStep === 'controlled-drug') {
  return (
    <div className="mx-auto w-full max-w-5xl rounded-lg border border-border bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
      {/* Progress bar - use existing component */}
      <div className="mb-6">
        {/* ... progress bar code ... */}
        <h3 className="text-2xl font-bold text-text-primary">
          Is this a controlled drug?
        </h3>
        <p className="mt-2 text-sm text-text-secondary">
          Controlled drugs have legal maximum durations
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => {
            addAnswer('Is this a controlled drug?', 'Yes');
            setResult({
              type: 'stop',
              duration: 'Maximum 1-3 months (legal limit)',
              reason: 'This is a controlled drug. Class B controlled drugs: max 1 month (morphine, oxycodone, methylphenidate, dexamphetamine). Class C controlled drugs: max 3 months (tramadol, benzodiazepines, zopiclone, zolpidem).',
            });
            setCurrentStep('result');
          }}
          className="w-full rounded-lg border-2 border-red-500 bg-red-50 px-6 py-4 text-left font-medium text-red-900 transition-colors hover:bg-red-100"
        >
          <span className="text-lg">🔴 YES</span>
          <p className="mt-1 text-sm opacity-80">This is a controlled drug</p>
        </button>

        <button
          type="button"
          onClick={() => {
            addAnswer('Is this a controlled drug?', 'No');
            setCurrentStep('nzf-check');
          }}
          className="w-full rounded-lg border-2 border-green-500 bg-green-50 px-6 py-4 text-left font-medium text-green-900 transition-colors hover:bg-green-100"
        >
          <span className="text-lg">🟢 NO</span>
          <p className="mt-1 text-sm opacity-80">Not a controlled drug</p>
        </button>
      </div>

      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>Controlled drugs:</strong>
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-800">
          <li>Class B (max 1 month): morphine, oxycodone, methylphenidate</li>
          <li>Class C (max 3 months): tramadol, benzodiazepines, zopiclone</li>
        </ul>
      </div>
    </div>
  );
}
```

### Question 2: NZF Check

**Full JSX:**

```tsx
if (currentStep === 'nzf-check') {
  return (
    <div className="mx-auto w-full max-w-5xl rounded-lg border border-border bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
      {/* Progress bar */}
      <div className="mb-6">
        {/* ... progress bar ... */}
        <h3 className="text-2xl font-bold text-text-primary">
          Have you checked this medication's monitoring requirements in NZF?
        </h3>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => {
            addAnswer('Checked NZF?', 'Yes');
            setCurrentStep('monitoring-frequency');
          }}
          className="w-full rounded-lg border-2 border-blue-500 bg-blue-50 px-6 py-4 text-left font-medium text-blue-900 transition-colors hover:bg-blue-100"
        >
          <span className="text-lg">📋 Yes, I've checked NZF</span>
        </button>

        <button
          type="button"
          onClick={() => {
            addAnswer('Checked NZF?', 'Skipped');
            setCurrentStep('monitoring-frequency');
          }}
          className="w-full rounded-lg border-2 border-gray-400 bg-gray-50 px-6 py-4 text-left font-medium text-gray-900 transition-colors hover:bg-gray-100"
        >
          <span className="text-lg">⏭️ Skip for now</span>
        </button>
      </div>

      <details className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <summary className="cursor-pointer font-medium text-blue-900">
          What should I check in NZF?
        </summary>
        <div className="mt-3 space-y-2 text-sm text-blue-800">
          <p>Check the medication in NZF for:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Monitoring requirements (blood tests, ECG, etc.)</li>
            <li>How often monitoring is needed</li>
            <li>Renal dose adjustments</li>
            <li>Specific patient warnings</li>
          </ul>
          <p className="mt-3">Common examples:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Warfarin → INR monitoring (weekly to monthly)</li>
            <li>Metformin → eGFR monitoring (dose adjust if &lt;45)</li>
            <li>ACE inhibitors → Renal function + K+ monitoring</li>
            <li>DOACs → CrCl monitoring (varies by drug)</li>
          </ul>
          <a
            href="https://nzf.org.nz"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block font-medium text-blue-700 hover:underline"
          >
            → Open NZF
          </a>
        </div>
      </details>

      <div className="mt-6">
        <button
          type="button"
          onClick={goBack}
          className="px-4 py-2 text-text-secondary transition-colors hover:text-text-primary"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
```

### Question 3: Monitoring Frequency

**Full JSX:**

```tsx
if (currentStep === 'monitoring-frequency') {
  return (
    <div className="mx-auto w-full max-w-5xl rounded-lg border border-border bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
      {/* Progress bar */}
      <div className="mb-6">
        {/* ... progress bar ... */}
        <h3 className="text-2xl font-bold text-text-primary">
          Does this medication require monitoring more often than annually?
        </h3>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-900">
          <strong>Examples:</strong>
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-700">
          <li>Warfarin (INR monthly) → YES</li>
          <li>Statins (lipids annually) → NO</li>
          <li>Metformin in stable patient (renal annually) → NO</li>
          <li>Lithium (levels 3-monthly) → YES</li>
        </ul>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => {
            addAnswer('Monitoring frequency', 'Requires <annual monitoring');
            setMonitoringConcern(true);
            setCurrentStep('patient-stability');
          }}
          className="w-full rounded-lg border-2 border-red-500 bg-red-50 px-6 py-4 text-left font-medium text-red-900 transition-colors hover:bg-red-100"
        >
          <span className="text-lg">🔴 YES</span>
          <p className="mt-1 text-sm opacity-80">Requires monitoring &lt; annually</p>
        </button>

        <button
          type="button"
          onClick={() => {
            addAnswer('Monitoring frequency', 'Annual monitoring sufficient');
            setMonitoringConcern(false);
            setCurrentStep('patient-stability');
          }}
          className="w-full rounded-lg border-2 border-green-500 bg-green-50 px-6 py-4 text-left font-medium text-green-900 transition-colors hover:bg-green-100"
        >
          <span className="text-lg">🟢 NO</span>
          <p className="mt-1 text-sm opacity-80">Annual monitoring sufficient</p>
        </button>
      </div>

      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          Medications requiring frequent monitoring (monthly, 3-monthly, 6-monthly) are generally not suitable for 12-month prescriptions.
        </p>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={goBack}
          className="px-4 py-2 text-text-secondary transition-colors hover:text-text-primary"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
```

### Question 4: Patient Stability

**Full JSX with checkboxes:**

```tsx
if (currentStep === 'patient-stability') {
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);

  const flagOptions = [
    'Patient age <18 or pregnant',
    'Patient age ≥65',
    'Condition unstable or recently changed',
    'Medication dose changed in last 6 months',
    'Polypharmacy (5+ medications)',
    'Poor medication adherence history',
    'Barriers to accessing annual review',
  ];

  return (
    <div className="mx-auto w-full max-w-5xl rounded-lg border border-border bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
      {/* Progress bar */}
      <div className="mb-6">
        {/* ... progress bar ... */}
        <h3 className="text-2xl font-bold text-text-primary">
          Patient stability assessment
        </h3>
        <p className="mt-2 text-sm text-text-secondary">
          These are considerations for clinical judgment, NOT exclusions. Select any that apply.
        </p>
      </div>

      <div className="space-y-2">
        {flagOptions.map((flag) => (
          <label
            key={flag}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-white p-4 transition-colors hover:bg-surface"
          >
            <input
              type="checkbox"
              checked={selectedFlags.includes(flag)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedFlags([...selectedFlags, flag]);
                } else {
                  setSelectedFlags(selectedFlags.filter((f) => f !== flag));
                }
              }}
              className="mt-1 size-4"
            />
            <span className="text-sm text-text-secondary">{flag}</span>
          </label>
        ))}
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => {
            const answerText = selectedFlags.length === 0
              ? 'None identified'
              : selectedFlags.join(', ');
            addAnswer('Patient stability factors', answerText);
            setStabilityFlags(selectedFlags);
            setCurrentStep('clinical-judgment');
          }}
          className="rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Continue →
        </button>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={goBack}
          className="px-4 py-2 text-text-secondary transition-colors hover:text-text-primary"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
```

### Question 5: Clinical Judgment

**Full JSX with conditional messaging:**

```tsx
if (currentStep === 'clinical-judgment') {
  return (
    <div className="mx-auto w-full max-w-5xl rounded-lg border border-border bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
      {/* Progress bar */}
      <div className="mb-6">
        {/* ... progress bar ... */}
        <h3 className="text-2xl font-bold text-text-primary">
          Choose prescription duration
        </h3>
        <p className="mt-2 text-text-secondary">
          Based on your clinical judgment
        </p>
      </div>

      {/* Conditional warning messages */}
      {monitoringConcern && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-900">
            ⚠️ <strong>Note:</strong> This medication requires monitoring more often than annually.
          </p>
        </div>
      )}

      {!monitoringConcern && stabilityFlags.length >= 2 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-900">
            ⚠️ <strong>Note:</strong> Multiple patient factors identified:
          </p>
          <ul className="mt-2 list-inside list-disc text-sm text-amber-800">
            {stabilityFlags.map((flag) => (
              <li key={flag}>{flag}</li>
            ))}
          </ul>
        </div>
      )}

      {!monitoringConcern && stabilityFlags.length < 2 && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-900">
            ✓ <strong>Patient appears suitable for longer prescription.</strong>
          </p>
        </div>
      )}

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => {
            addAnswer('Duration chosen', '3 months');
            setResult({
              type: 'suitable',
              duration: '3 months (traditional standard)',
              reason: 'You chose 3 months for closer monitoring. This is the traditional prescription standard and provides more frequent clinical touchpoints.',
            });
            setCurrentStep('result');
          }}
          className="w-full rounded-lg border-2 border-gray-400 bg-gray-50 px-6 py-4 text-left font-medium text-gray-900 transition-colors hover:bg-gray-100"
        >
          <span className="text-lg">3 months</span>
          <p className="mt-1 text-sm opacity-80">Traditional standard - most frequent monitoring</p>
        </button>

        <button
          type="button"
          onClick={() => {
            addAnswer('Duration chosen', '6 months');
            setResult({
              type: 'suitable',
              duration: '6 months (RNZCGP recommended)',
              reason: "You chose 6 months. This aligns with RNZCGP's recommended duration as safer than 12 months - allows for more frequent medication reconciliation and monitoring.",
            });
            setCurrentStep('result');
          }}
          className="w-full rounded-lg border-2 border-blue-500 bg-blue-50 px-6 py-4 text-left font-medium text-blue-900 transition-colors hover:bg-blue-100"
        >
          <span className="text-lg">6 months</span>
          <p className="mt-1 text-sm opacity-80">RNZCGP recommended as safer</p>
        </button>

        <button
          type="button"
          onClick={() => {
            addAnswer('Duration chosen', '12 months');
            setResult({
              type: 'suitable',
              duration: '12 months',
              reason: 'You chose 12 months. Ensure annual review is booked and patient understands to contact practice if condition changes. Document monitoring plan.',
            });
            setCurrentStep('result');
          }}
          className="w-full rounded-lg border-2 border-green-500 bg-green-50 px-6 py-4 text-left font-medium text-green-900 transition-colors hover:bg-green-100"
        >
          <span className="text-lg">12 months</span>
          <p className="mt-1 text-sm opacity-80">Maximum duration - ensure annual review booked</p>
        </button>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={goBack}
          className="px-4 py-2 text-text-secondary transition-colors hover:text-text-primary"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
```

### Result Screen

**Keep existing result screen JSX, update copy format:**

```tsx
if (currentStep === 'result' && result) {
  const copySummary = () => {
    const summary = `12-Month Prescription Decision

Decision: ${result.duration}

Rationale: ${result.reason}

Questions answered:
${answers.map(a => `- ${a.question}: ${a.answer}`).join('\n')}

Tool: https://clinicpro.co.nz/12-month-prescriptions
Date: ${new Date().toLocaleDateString('en-NZ')}`;

    navigator.clipboard.writeText(summary);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  // ... rest of result screen JSX (same as existing)
}
```

### Helper Functions

```typescript
const addAnswer = (question: string, answer: string) => {
  setAnswers([...answers, { step: currentStep, question, answer }]);
};

const goBack = () => {
  const newAnswers = [...answers];
  newAnswers.pop();
  setAnswers(newAnswers);

  const stepOrder: Step[] = [
    'controlled-drug',
    'nzf-check',
    'monitoring-frequency',
    'patient-stability',
    'clinical-judgment',
  ];
  const currentIndex = stepOrder.indexOf(currentStep);
  if (currentIndex > 0) {
    setCurrentStep(stepOrder[currentIndex - 1]);
  }
};

const reset = () => {
  setCurrentStep('controlled-drug');
  setAnswers([]);
  setMonitoringConcern(false);
  setStabilityFlags([]);
  setResult(null);
};
```

---

## File 2: `page.tsx` (MODERATE CHANGES)

**Location:** `app/(clinical)/12-month-prescriptions/page.tsx`

### Changes Required:

#### 1. Remove Imports (DELETE these lines)

```typescript
// DELETE these imports:
import { InteractiveFlowchart, TrafficLightModal, TrafficLightPanel } from '@/src/features/12-month-prescriptions';
```

#### 2. Remove State Variables (DELETE these lines)

```typescript
// DELETE these state variables:
const [modalOpen, setModalOpen] = useState(false);
const [modalSection, setModalSection] = useState<'green' | 'amber' | 'red' | null>(null);
const [activeTab, setActiveTab] = useState<'wizard' | 'flowchart'>('wizard');
```

#### 3. Remove Functions (DELETE these functions)

```typescript
// DELETE:
const scrollToFlowchart = () => { ... };
const openChecker = (section?: 'green' | 'amber' | 'red') => { ... };
```

#### 4. Update Hero Section

**REPLACE the button group:**

```tsx
{/* OLD - DELETE: */}
<div className="mb-6 flex flex-wrap justify-center gap-4">
  <button onClick={scrollToFlowchart}>Start Decision Tool ↓</button>
  <button onClick={() => openChecker()}>Open Medication Checker</button>
</div>

{/* NEW - REPLACE WITH: */}
<div className="mb-6 flex flex-wrap justify-center gap-4">
  <a
    href="#checklist"
    className="rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
  >
    Start Decision Tool ↓
  </a>
  <a
    href="https://nzf.org.nz"
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-lg border border-border bg-white px-6 py-3 font-medium text-text-primary transition-colors hover:bg-surface"
  >
    Open NZF
  </a>
</div>
```

#### 5. Remove Quick Start Section (DELETE entire section)

```tsx
{/* DELETE THIS ENTIRE SECTION: */}
<section className="bg-surface px-6 py-8">
  <div className="mx-auto max-w-3xl">
    <details className="quick-start-details">
      {/* ... all Quick Start content ... */}
    </details>
  </div>
</section>
```

#### 6. Update Decision Tools Section

**REPLACE entire section:**

```tsx
{/* OLD - DELETE everything with tabs and flowchart */}
<section id="flowchart" ...>
  {/* tabs, wizard, flowchart, TrafficLightPanel */}
</section>

{/* NEW - REPLACE WITH: */}
<section id="checklist" className="scroll-mt-20 bg-white px-6 py-16">
  <div className="mx-auto max-w-5xl">
    <h2 className="mb-6 text-3xl font-bold text-text-primary">
      Interactive Decision Tool
    </h2>
    <DecisionWizard />
  </div>
</section>
```

#### 7. Add Medication Guidance Section (NEW)

**INSERT after checklist section, before "Evidence & Resources":**

```tsx
<section className="bg-surface px-6 py-16">
  <div className="mx-auto max-w-4xl">
    <details className="rounded-lg border border-border bg-white p-6">
      <summary className="cursor-pointer text-2xl font-bold text-text-primary [&::-webkit-details-marker]:hidden">
        📋 Medication Reference Guide
      </summary>
      
      <div className="mt-6 space-y-6">
        {/* Blue callout box */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-3 text-lg font-semibold text-blue-900">
            Why we link to NZF instead of listing all medications
          </h3>
          <p className="mb-3 text-sm text-blue-800">
            The New Zealand Formulary is the gold-standard, authoritative source for medication information in NZ. It's updated monthly and includes monitoring requirements, dose adjustments, interactions, and latest safety alerts.
          </p>
          <p className="mb-4 text-sm text-blue-800">
            We've requested API access from NZF to integrate medication data directly. If approved, future versions will auto-populate monitoring requirements.
          </p>
          <a
            href="https://nzf.org.nz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Open NZF
          </a>
        </div>

        {/* Sub-accordion 1: NOT Suitable */}
        <details className="rounded-lg border border-border bg-white p-4">
          <summary className="cursor-pointer font-semibold text-text-primary">
            🔴 Generally NOT Suitable for 12 Months
          </summary>
          <div className="mt-4 space-y-4 text-sm text-text-secondary">
            {/* Insert content from V1_MEDICATION_GUIDANCE_CONTENT.md */}
            {/* Tables and lists for controlled drugs + high-risk meds */}
          </div>
        </details>

        {/* Sub-accordion 2: Individual Assessment */}
        <details className="rounded-lg border border-border bg-white p-4">
          <summary className="cursor-pointer font-semibold text-text-primary">
            🟡 Requires Individual Assessment
          </summary>
          <div className="mt-4 space-y-4 text-sm text-text-secondary">
            {/* Insert content from V1_MEDICATION_GUIDANCE_CONTENT.md */}
            {/* Lists for metformin, ACEi, DOACs, etc. */}
          </div>
        </details>

        {/* Sub-accordion 3: Generally Suitable */}
        <details className="rounded-lg border border-border bg-white p-4">
          <summary className="cursor-pointer font-semibold text-text-primary">
            🟢 Generally Suitable for 12 Months
          </summary>
          <div className="mt-4 space-y-4 text-sm text-text-secondary">
            {/* Insert content from V1_MEDICATION_GUIDANCE_CONTENT.md */}
            {/* Lists for statins, CCBs, ICS, etc. */}
          </div>
        </details>

        {/* Important Notes */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="mb-2 font-semibold text-amber-900">🔴 Important Notes:</p>
          <ol className="ml-4 list-decimal space-y-1 text-sm text-amber-800">
            <li>These are EXAMPLES, not comprehensive lists.</li>
            <li>Lists are GUIDANCE, not rules. You have full clinical discretion.</li>
            <li>NZF is the authoritative source.</li>
            <li>When in doubt: Prescribe shorter duration.</li>
            <li>6 months is completely acceptable.</li>
          </ol>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-text-tertiary">
          <strong>Disclaimer:</strong> This medication reference is for educational purposes only and does not replace clinical judgment or official prescribing guidance. Always consult NZF, Medsafe data sheets, and relevant clinical guidelines.
        </p>
      </div>
    </details>
  </div>
</section>
```

#### 8. Remove Traffic Light Modal (DELETE at bottom)

```tsx
{/* DELETE: */}
<TrafficLightModal
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  initialSection={modalSection}
/>
```

---

## Testing Checklist

After implementation, test:

### Functionality Tests

- ✅ Q1 (Controlled drug) → YES → Shows result immediately
- ✅ Q1 → NO → Continues to Q2
- ✅ Q2 → Both "Yes" and "Skip" continue to Q3
- ✅ Q2 → "What to check" expands/collapses correctly
- ✅ Q3 → YES → Sets monitoring concern flag
- ✅ Q3 → NO → Continues without flag
- ✅ Q4 → Can select 0-7 checkboxes
- ✅ Q4 → Continue button works
- ✅ Q5 → Shows correct warning messages based on flags
- ✅ Q5 → All 3 duration buttons work (3mo/6mo/12mo)
- ✅ Result screen shows correct decision + rationale
- ✅ "Copy Summary" button copies to clipboard
- ✅ "Copy Summary" shows "Copied!" feedback
- ✅ "Start New Decision" resets entire flow
- ✅ Back button works on Q2-Q5
- ✅ Progress bar shows correct percentage

### Visual Tests

- ✅ All buttons have clear hover states
- ✅ Color coding matches: Red (stop/concern), Green (continue/suitable), Blue (info)
- ✅ Mobile: Buttons stack vertically (<640px)
- ✅ Mobile: All text readable, no horizontal scroll
- ✅ Progress bar visible on all screen sizes

### Content Tests

- ✅ Medication accordion expands/collapses
- ✅ NZF links open in new tab
- ✅ Sub-accordions within main accordion work
- ✅ Tables are horizontally scrollable on mobile
- ✅ No broken links

---

## Rollback Plan

If bugs found in production:

1. Revert `DecisionWizard.tsx` to previous version
2. Revert `page.tsx` to previous version
3. Re-enable Traffic Light components
4. Fix bugs in development
5. Re-deploy

**Keep backups of:**
- Current `DecisionWizard.tsx`
- Current `page.tsx`

---

## Performance Considerations

- All state is in-memory (no API calls)
- No external dependencies added
- Component should render in <100ms
- Copy to clipboard uses native browser API

---

## Accessibility Checklist

- ✅ All buttons have aria-labels if icon-only
- ✅ Progress bar has aria-valuenow/valuemax
- ✅ Focus visible on all interactive elements
- ✅ Keyboard navigation works (Tab, Enter)
- ✅ details/summary semantics correct
- ✅ Color not sole indicator (use icons + text)

---

## Final QA Questions

Before marking as complete:

1. Can a GP complete a decision in <2 minutes? (Time it)
2. Is the copy summary useful for pasting in patient notes?
3. Do the medication lists make sense as quick reference?
4. Is it clear that lists are examples, not comprehensive?
5. Does the tool feel helpful or just "checkbox-ticking"?

---

**End of Implementation Guide**
