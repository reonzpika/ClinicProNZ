'use client';

import { useState } from 'react';

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

type Scenario =
  | 'monitoring-concern'
  | 'monitoring-concern-high-risk'
  | 'monitoring-concern-some-risk'
  | 'high-risk'
  | 'some-risk'
  | 'suitable';

type DurationChoice = '3 months' | '6 months' | '12 months';

type BoxType = 'green' | 'blue' | 'amber';

type Result =
  | { type: 'stop'; duration: string; reason: string }
  | {
      type: 'suitable';
      duration: string;
      reason: string;
      title: string;
      contextLine: string;
      boxType: BoxType;
    };

const CONTEXT_BY_SCENARIO: Record<Scenario, string> = {
  'monitoring-concern':
    'One or more of the patient\'s medications require frequent monitoring',
  'monitoring-concern-high-risk':
    'One or more of the patient\'s medications require frequent monitoring, multiple patient risk factors identified',
  'monitoring-concern-some-risk':
    'One or more of the patient\'s medications require frequent monitoring, patient factors identified',
  'high-risk': 'Multiple patient risk factors identified',
  'some-risk': 'Patient factors identified',
  suitable: 'No significant risk factors identified',
};

const RESULT_LOOKUP: Record<
  string,
  { boxType: BoxType; title: string; rationale: string }
> = {
  'monitoring-concern-3 months': {
    boxType: 'green',
    title: '3 months',
    rationale:
      'One or more of the patient\'s medications require monitoring more frequently than annually. This duration aligns with monitoring schedule.',
  },
  'monitoring-concern-6 months': {
    boxType: 'green',
    title: '6 months',
    rationale:
      'One or more of the patient\'s medications require monitoring more frequently than annually. This duration aligns with monitoring schedule.',
  },
  'monitoring-concern-high-risk-3 months': {
    boxType: 'green',
    title: '3 months',
    rationale:
      'One or more of the patient\'s medications require frequent monitoring and multiple patient risk factors identified. This duration allows appropriate monitoring.',
  },
  'monitoring-concern-high-risk-6 months': {
    boxType: 'green',
    title: '6 months',
    rationale:
      'One or more of the patient\'s medications require frequent monitoring and multiple patient risk factors identified. This duration aligns with monitoring needs.',
  },
  'monitoring-concern-some-risk-3 months': {
    boxType: 'green',
    title: '3 months',
    rationale:
      'One or more of the patient\'s medications require frequent monitoring with additional patient factors to consider. This duration allows appropriate monitoring.',
  },
  'monitoring-concern-some-risk-6 months': {
    boxType: 'green',
    title: '6 months',
    rationale:
      'One or more of the patient\'s medications require frequent monitoring with additional patient factors to consider. This duration aligns with monitoring needs.',
  },
  'high-risk-3 months': {
    boxType: 'blue',
    title: '3 months',
    rationale:
      'Multiple patient risk factors identified. Conservative duration chosen for closer monitoring.',
  },
  'high-risk-6 months': {
    boxType: 'green',
    title: '6 months',
    rationale:
      'Multiple patient risk factors identified. Six months allows more frequent medication reconciliation as recommended by RNZCGP.',
  },
  'high-risk-12 months': {
    boxType: 'amber',
    title: '12 months',
    rationale:
      'Multiple patient risk factors identified but 12 months judged appropriate.',
  },
  'some-risk-3 months': {
    boxType: 'blue',
    title: '3 months',
    rationale:
      'Patient factors identified. Conservative duration chosen for closer monitoring.',
  },
  'some-risk-6 months': {
    boxType: 'green',
    title: '6 months',
    rationale:
      'Patient factors identified. Six months duration chosen for monitoring needs.',
  },
  'some-risk-12 months': {
    boxType: 'green',
    title: '12 months',
    rationale:
      'Patient factors identified but 12 months judged appropriate.',
  },
  'suitable-3 months': {
    boxType: 'blue',
    title: '3 months',
    rationale:
      'No significant risk factors identified. Conservative duration chosen for frequent touchpoints.',
  },
  'suitable-6 months': {
    boxType: 'green',
    title: '6 months',
    rationale:
      'No significant risk factors identified. Six months aligns with RNZCGP recommendation as safer than 12 months.',
  },
  'suitable-12 months': {
    boxType: 'green',
    title: '12 months',
    rationale:
      'No significant risk factors identified. Patient suitable for maximum duration prescription.',
  },
};

const TOTAL_STEPS = 5;
const STEP_ORDER: Step[] = [
  'controlled-drug',
  'nzf-check',
  'monitoring-frequency',
  'patient-stability',
  'clinical-judgment',
];

const STEP_NUMBER: Record<Step, number> = {
  'controlled-drug': 1,
  'nzf-check': 2,
  'monitoring-frequency': 3,
  'patient-stability': 4,
  'clinical-judgment': 5,
  result: 5,
};

const STABILITY_FLAG_OPTIONS = [
  'Patient age <18 or pregnant',
  'Patient age ≥65',
  'Condition unstable or recently changed',
  'Medication dose changed in last 6 months',
  'Polypharmacy (5+ medications)',
  'Poor medication adherence history',
  'Barriers to accessing annual review',
];

function ProgressBar({ stepNumber }: { stepNumber: number }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <span className="text-sm font-medium text-text-tertiary">
        Step {stepNumber} of {TOTAL_STEPS}
      </span>
      <div className="mx-4 h-2 flex-1 rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-300"
          style={{ width: `${(stepNumber / TOTAL_STEPS) * 100}%` }}
          role="progressbar"
          aria-valuenow={stepNumber}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
        />
      </div>
    </div>
  );
}

export function DecisionWizard() {
  const [currentStep, setCurrentStep] = useState<Step>('controlled-drug');
  const [_answers, setAnswers] = useState<Answer[]>([]);
  const [monitoringConcern, setMonitoringConcern] = useState(false);
  const [stabilityFlags, setStabilityFlags] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const stepNumber = STEP_NUMBER[currentStep];

  const addAnswer = (question: string, answer: string) => {
    setAnswers((prev) => [...prev, { step: currentStep, question, answer }]);
  };

  const goBack = () => {
    setAnswers((prev) => prev.slice(0, -1));
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEP_ORDER[currentIndex - 1]!);
    }
  };

  const reset = () => {
    setCurrentStep('controlled-drug');
    setAnswers([]);
    setMonitoringConcern(false);
    setStabilityFlags([]);
    setResult(null);
  };

  const copySummary = () => {
    if (!result) return;
    const decision = result.type === 'stop' ? result.duration : result.title;
    const context =
      result.type === 'stop'
        ? 'Controlled drug - legal maximum applies'
        : result.contextLine;
    const summary = `12-Month Prescription

Decision: ${decision}
Context: ${context}
Rationale: ${result.reason}

Tool: https://clinicpro.co.nz/12-month-prescriptions`;
    navigator.clipboard.writeText(summary);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  // Q1: Controlled drug
  if (currentStep === 'controlled-drug') {
    return (
      <div className="mx-auto w-full max-w-5xl rounded-lg border border-border bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <ProgressBar stepNumber={stepNumber} />
          <h3 className="text-2xl font-bold text-text-primary">
            Is the patient on any controlled drugs?
          </h3>
          <p className="mt-2 text-sm text-text-secondary">
            Controlled drugs have legal maximum durations
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              addAnswer('Is the patient on any controlled drugs?', 'Yes');
              setResult({
                type: 'stop',
                duration: 'Maximum 1-3 months (legal limit)',
                reason:
                  'One or more of the patient\'s medications are controlled drugs. Max 1 month: all opioids (morphine, oxycodone, fentanyl, codeine, tramadol). Max 3 months: ADHD stimulants, benzodiazepines, zopiclone, cannabis preparations.',
              });
              setCurrentStep('result');
            }}
            className="w-full rounded-lg border-2 border-red-500 bg-red-50 px-6 py-4 text-left font-medium text-red-900 transition-colors hover:bg-red-100"
          >
            <span className="text-lg">🔴 YES</span>
            <p className="mt-1 text-sm opacity-80">
              Yes, this patient has controlled drug(s)
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              addAnswer('Is the patient on any controlled drugs?', 'No');
              setCurrentStep('nzf-check');
            }}
            className="w-full rounded-lg border-2 border-green-500 bg-green-50 px-6 py-4 text-left font-medium text-green-900 transition-colors hover:bg-green-100"
          >
            <span className="text-lg">🟢 NO</span>
            <p className="mt-1 text-sm opacity-80">
              No, this patient has no controlled drugs
            </p>
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-900">
            <strong>Controlled drugs:</strong>
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-800">
            <li><strong>Max 1 month:</strong> All opioids (morphine, oxycodone, fentanyl, codeine, tramadol)</li>
            <li><strong>Max 3 months:</strong> ADHD stimulants (methylphenidate, dexamfetamine), benzodiazepines, zopiclone, cannabis preparations</li>
          </ul>
        </div>
      </div>
    );
  }

  // Q2: NZF check
  if (currentStep === 'nzf-check') {
    return (
      <div className="mx-auto w-full max-w-5xl rounded-lg border border-border bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <ProgressBar stepNumber={stepNumber} />
          <h3 className="text-2xl font-bold text-text-primary">
            Have you checked monitoring requirements for the relevant
            medications in NZF?
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
            <span className="text-lg">📋 Yes, I&apos;ve checked NZF</span>
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
            <p>Check each relevant medication in NZF for:</p>
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

  // Q3: Monitoring frequency
  if (currentStep === 'monitoring-frequency') {
    return (
      <div className="mx-auto w-full max-w-5xl rounded-lg border border-border bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <ProgressBar stepNumber={stepNumber} />
          <h3 className="text-2xl font-bold text-text-primary">
            Does any of the patient&apos;s medications require monitoring more
            often than annually?
          </h3>
        </div>

        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-900">
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
            <p className="mt-1 text-sm opacity-80">
              Requires monitoring &lt; annually
            </p>
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
            <p className="mt-1 text-sm opacity-80">
              Annual monitoring sufficient
            </p>
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-900">
            Medications requiring frequent monitoring (monthly, 3-monthly,
            6-monthly) are generally not suitable for 12-month prescriptions.
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

  // Q4: Patient stability
  if (currentStep === 'patient-stability') {
    const toggleFlag = (flag: string) => {
      setStabilityFlags((prev) =>
        prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
      );
    };

    return (
      <div className="mx-auto w-full max-w-5xl rounded-lg border border-border bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <ProgressBar stepNumber={stepNumber} />
          <h3 className="text-2xl font-bold text-text-primary">
            Patient stability assessment
          </h3>
          <p className="mt-2 text-sm text-text-secondary">
            These are considerations for clinical judgment, NOT exclusions.
            Select any that apply.
          </p>
        </div>

        <div className="space-y-2">
          {STABILITY_FLAG_OPTIONS.map((flag) => (
            <label
              key={flag}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-white p-4 transition-colors hover:bg-surface"
            >
              <input
                type="checkbox"
                checked={stabilityFlags.includes(flag)}
                onChange={() => toggleFlag(flag)}
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
              const answerText =
                stabilityFlags.length === 0
                  ? 'None identified'
                  : stabilityFlags.join(', ');
              addAnswer('Patient stability factors', answerText);
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

  // Q5: Clinical judgment
  if (currentStep === 'clinical-judgment') {
    const scenario = monitoringConcern && stabilityFlags.length >= 3
      ? 'monitoring-concern-high-risk'
      : monitoringConcern && stabilityFlags.length >= 1
        ? 'monitoring-concern-some-risk'
        : monitoringConcern
          ? 'monitoring-concern'
          : stabilityFlags.length >= 3
            ? 'high-risk'
            : stabilityFlags.length >= 1
              ? 'some-risk'
              : 'suitable';

    const handleDurationChoice = (duration: DurationChoice) => {
      const key = `${scenario}-${duration}`;
      const lookup = RESULT_LOOKUP[key];
      if (!lookup) {
        addAnswer('Duration chosen', duration);
        setResult({
          type: 'suitable',
          duration,
          reason: '',
          title: duration,
          contextLine: CONTEXT_BY_SCENARIO[scenario],
          boxType: 'green',
        });
      } else {
        const { boxType, title, rationale } = lookup;
        addAnswer('Duration chosen', duration);
        setResult({
          type: 'suitable',
          duration,
          reason: rationale,
          title,
          contextLine: CONTEXT_BY_SCENARIO[scenario],
          boxType,
        });
      }
      setCurrentStep('result');
    };

    return (
      <div className="mx-auto w-full max-w-5xl rounded-lg border border-border bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <ProgressBar stepNumber={stepNumber} />
          <h3 className="text-2xl font-bold text-text-primary">
            Choose prescription duration
          </h3>
          <p className="mt-2 text-text-secondary">
            Based on your clinical judgment
          </p>
        </div>

        {scenario === 'monitoring-concern' && (
          <div className="mb-6 rounded-lg border-2 border-red-200 bg-red-50 p-5">
            <p className="mb-2 font-semibold text-red-900">
              ⚠️ Why 12 months is not available:
            </p>
            <p className="mb-3 text-sm text-red-800">
              One or more of the patient&apos;s medications require monitoring
              more frequently than annually (e.g., INR monthly, lithium levels
              3-monthly).
            </p>
            <p className="text-sm text-red-800">
              Choose a duration that aligns with your monitoring plan - typically
              3 or 6 months depending on the specific monitoring frequency.
            </p>
          </div>
        )}

        {scenario === 'monitoring-concern-high-risk' && (
          <div className="mb-6 rounded-lg border-2 border-red-200 bg-red-50 p-5">
            <p className="mb-2 font-semibold text-red-900">
              ⚠️ Why 12 months is not available:
            </p>
            <p className="mb-3 text-sm text-red-800">
              One or more of the patient&apos;s medications require monitoring
              more frequently than annually (e.g., INR monthly, lithium levels
              3-monthly).
            </p>
            <p className="mb-4 text-sm text-red-800">
              Choose a duration that aligns with your monitoring plan - typically
              3 or 6 months depending on the specific monitoring frequency.
            </p>
            <p className="mb-2 text-sm text-red-900">
              <strong>Additional patient risk factors identified:</strong>
            </p>
            <ul className="ml-5 list-disc text-sm text-red-800">
              {stabilityFlags.map((flag) => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
          </div>
        )}

        {scenario === 'monitoring-concern-some-risk' && (
          <div className="mb-6 rounded-lg border-2 border-red-200 bg-red-50 p-5">
            <p className="mb-2 font-semibold text-red-900">
              ⚠️ Why 12 months is not available:
            </p>
            <p className="mb-3 text-sm text-red-800">
              One or more of the patient&apos;s medications require monitoring
              more frequently than annually (e.g., INR monthly, lithium levels
              3-monthly).
            </p>
            <p className="mb-4 text-sm text-red-800">
              Choose a duration that aligns with your monitoring plan - typically
              3 or 6 months depending on the specific monitoring frequency.
            </p>
            <p className="mb-2 text-sm text-red-900">
              <strong>Additional patient factors to consider:</strong>
            </p>
            <ul className="ml-5 list-disc text-sm text-red-800">
              {stabilityFlags.map((flag) => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
          </div>
        )}

        {scenario === 'high-risk' && (
          <div className="mb-6 rounded-lg border-2 border-amber-200 bg-amber-50 p-5">
            <p className="mb-2 font-semibold text-amber-900">
              ⚠️ Clinical recommendation: 6 months
            </p>
            <p className="mb-2 text-sm text-amber-800">
              Multiple risk factors identified:
            </p>
            <ul className="mb-3 ml-5 list-disc text-sm text-amber-800">
              {stabilityFlags.map((flag) => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
            <p className="text-sm text-amber-800">
              RNZCGP recommends 6-month prescriptions when multiple risk factors
              are present. You can still choose 12 months if you judge it
              appropriate for this patient.
            </p>
          </div>
        )}

        {scenario === 'some-risk' && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-5">
            <p className="mb-2 text-sm text-blue-900">
              ℹ️ <strong>Patient factors to consider:</strong>
            </p>
            <ul className="mb-3 ml-5 list-disc text-sm text-blue-800">
              {stabilityFlags.map((flag) => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
            <p className="text-sm text-blue-800">
              12 months is permitted but requires careful clinical judgment for
              this patient.
            </p>
          </div>
        )}

        {scenario === 'suitable' && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-5">
            <p className="mb-2 font-semibold text-green-900">
              ✅ Patient appears suitable for longer prescription
            </p>
            <p className="text-sm text-green-800">
              No significant risk factors identified. Both 6 and 12 months are
              appropriate.
            </p>
            <p className="mt-2 text-sm text-green-700">
              Note: RNZCGP recommended 6 months as safer than 12 months, but 12
              months is the new policy maximum.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleDurationChoice('3 months')}
            className="w-full rounded-lg border-2 border-gray-400 bg-white px-6 py-4 text-left font-medium text-gray-900 transition-colors hover:bg-gray-50"
          >
            <span className="text-lg">3 months</span>
            <p className="mt-1 text-sm opacity-80">
              Traditional standard - more frequent clinical touchpoints
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleDurationChoice('6 months')}
            className={
              scenario === 'high-risk'
                ? 'w-full rounded-lg border-[3px] border-green-600 bg-green-50 px-6 py-4 text-left font-bold text-green-900 transition-colors hover:bg-green-100'
                : scenario === 'some-risk' || scenario === 'suitable'
                  ? 'w-full rounded-lg border-2 border-blue-500 bg-blue-50 px-6 py-4 text-left font-medium text-blue-900 transition-colors hover:bg-blue-100'
                  : 'w-full rounded-lg border-2 border-gray-400 bg-white px-6 py-4 text-left font-medium text-gray-900 transition-colors hover:bg-gray-50'
            }
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="text-lg">6 months</span>
                <p className="mt-1 text-sm opacity-80">
                  {scenario === 'high-risk'
                    ? 'Recommended for multiple risk factors'
                    : scenario.includes('monitoring-concern')
                      ? 'Balances monitoring needs with reduced pharmacy visits'
                      : 'RNZCGP recommended - more frequent touchpoints'}
                </p>
              </div>
              {scenario === 'high-risk' && (
                <span className="ml-3 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                  RECOMMENDED
                </span>
              )}
            </div>
          </button>

          {!scenario.includes('monitoring-concern') && (
            <button
              type="button"
              onClick={() => handleDurationChoice('12 months')}
              className={
                scenario === 'suitable'
                  ? 'w-full rounded-lg border-[3px] border-green-600 bg-green-50 px-6 py-4 text-left font-bold text-green-900 transition-colors hover:bg-green-100'
                  : scenario === 'high-risk'
                    ? 'w-full rounded-lg border-2 border-orange-500 bg-orange-50 px-6 py-4 text-left font-medium text-orange-900 transition-colors hover:bg-orange-100'
                    : 'w-full rounded-lg border-2 border-gray-400 bg-white px-6 py-4 text-left font-medium text-gray-900 transition-colors hover:bg-gray-50'
              }
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="text-lg">
                    {scenario === 'high-risk' && '⚠️ '}
                    12 months
                  </span>
                  <p className="mt-1 text-sm opacity-80">
                    {scenario === 'suitable'
                      ? 'Maximum duration - patient appears suitable'
                      : scenario === 'high-risk'
                        ? 'Use with caution - ensure robust monitoring plan'
                        : 'Maximum duration - ensure annual review booked'}
                  </p>
                </div>
                {scenario === 'suitable' && (
                  <span className="ml-3 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                    SUITABLE
                  </span>
                )}
              </div>
            </button>
          )}
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

  // Result screen
  if (currentStep === 'result' && result) {
    const isStop = result.type === 'stop';
    const resultBoxClass = isStop
      ? 'border-red-500 bg-red-50 text-red-900'
      : result.boxType === 'blue'
        ? 'border-blue-600 bg-blue-50 text-blue-900'
        : result.boxType === 'amber'
          ? 'border-amber-600 bg-amber-50 text-amber-900'
          : 'border-green-600 bg-green-50 text-green-900';
    const resultTitle = isStop ? result.duration : result.title;

    return (
      <div className="mx-auto w-full max-w-5xl rounded-lg border border-border bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
        <div className={`mb-6 rounded-lg border-2 p-6 ${resultBoxClass}`}>
          <h3 className="mb-2 text-2xl font-bold">
            {isStop
              ? '🔴 Not Suitable for 12 Months'
              : '✅ Prescription Decision'}
          </h3>
          <p className="mb-3 text-xl font-semibold">{resultTitle}</p>
          <p className="text-sm opacity-90">{result.reason}</p>
        </div>

        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h4 className="mb-3 font-semibold text-text-primary">
            Decision Summary
          </h4>
          <div className="space-y-2 text-sm text-text-secondary">
            <div>
              <p className="font-medium text-text-primary">Decision</p>
              <p className="mt-1">{resultTitle}</p>
            </div>
            <div>
              <p className="font-medium text-text-primary">Rationale</p>
              <p className="mt-1">{result.reason}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={copySummary}
            className="rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
          >
            📋 Copy Summary
          </button>
          {copyFeedback && (
            <span className="text-sm font-medium text-green-600" role="status">
              Copied!
            </span>
          )}
          <button
            type="button"
            onClick={reset}
            className="flex-1 rounded-lg border border-border bg-white px-6 py-3 font-medium text-text-primary transition-colors hover:bg-surface"
          >
            ↻ Start New Decision
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-text-tertiary">
          Summary copied to clipboard can be pasted into patient notes
        </p>
      </div>
    );
  }

  return null;
}
