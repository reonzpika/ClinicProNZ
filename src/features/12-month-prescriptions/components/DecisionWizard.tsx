'use client';

import { useState } from 'react';

type Step =
  | 'controlled-drug'
  | 'medication-zone'
  | 'amber-criteria'
  | 'patient-stability'
  | 'clinical-judgment'
  | 'result';

type Answer = {
  step: string;
  question: string;
  answer: string;
};

type DecisionWizardProps = {
  onOpenChecker?: (section?: 'green' | 'amber' | 'red') => void;
};

export function DecisionWizard({ onOpenChecker }: DecisionWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('controlled-drug');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [result, setResult] = useState<{
    type: 'stop' | 'suitable' | 'consider-shorter';
    duration: string;
    reason: string;
    zone?: 'red' | 'amber' | 'green';
  } | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const totalSteps = 5;
  const stepNumber = {
    'controlled-drug': 1,
    'medication-zone': 2,
    'amber-criteria': 3,
    'patient-stability': 4,
    'clinical-judgment': 5,
    'result': 5,
  }[currentStep];

  const addAnswer = (question: string, answer: string) => {
    setAnswers([...answers, { step: currentStep, question, answer }]);
  };

  const handleAnswer = (
    question: string,
    answer: string,
    nextStep: Step | 'result',
    resultData?: typeof result,
  ) => {
    addAnswer(question, answer);

    if (nextStep === 'result' && resultData) {
      setResult(resultData);
      setCurrentStep('result');
    } else if (nextStep !== 'result') {
      setCurrentStep(nextStep);
    }
  };

  const goBack = () => {
    const newAnswers = [...answers];
    newAnswers.pop();
    setAnswers(newAnswers);

    const stepOrder: Step[] = [
      'controlled-drug',
      'medication-zone',
      'amber-criteria',
      'patient-stability',
      'clinical-judgment',
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStep = stepOrder[currentIndex - 1];
      if (prevStep) {
 setCurrentStep(prevStep);
}
    }
  };

  const reset = () => {
    setCurrentStep('controlled-drug');
    setAnswers([]);
    setResult(null);
  };

  const copySummary = () => {
    const url = 'https://clinicpro.co.nz/12-month-prescriptions';
    const summary = `Decision: ${result?.duration}
Rationale: ${result?.reason}
${url}`;

    navigator.clipboard.writeText(summary);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  // Step 1: Controlled Drug
  if (currentStep === 'controlled-drug') {
    return (
      <div className="mx-auto w-full max-w-5xl rounded-lg border border-border bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-text-tertiary">
              Step
{' '}
{stepNumber}
{' '}
of
{' '}
{totalSteps}
            </span>
            <div className="mx-4 h-2 flex-1 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-300"
                style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
              />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-text-primary">
            Is this a controlled drug?
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col rounded-lg border-2 border-red-500 bg-red-50 md:flex-row">
            <button
              type="button"
              onClick={() =>
                handleAnswer(
                  'Is this a controlled drug?',
                  'Yes',
                  'result',
                  {
                    type: 'stop',
                    duration: 'Maximum 1-3 months',
                    reason:
                      'Controlled drugs are legally excluded from 12-month prescriptions. Class B controlled drugs: max 1 month. Class C controlled drugs: max 3 months.',
                    zone: 'red',
                  },
                )
              }
              className="min-w-0 flex-1 rounded-t-md px-6 py-4 text-left font-medium text-red-900 transition-colors hover:bg-red-100 md:rounded-l-md md:rounded-r-none"
            >
              <span className="text-lg">🔴 YES</span>
              <p className="mt-1 text-sm opacity-80">This is a controlled drug</p>
            </button>
            {onOpenChecker && (
              <button
                type="button"
                onClick={() => onOpenChecker('red')}
                className="min-h-[44px] flex-shrink-0 rounded-b-md px-4 py-3 text-sm font-medium text-red-700 hover:underline md:w-auto md:rounded-r-md md:rounded-l-none md:py-2 w-full"
              >
                View in checker →
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              handleAnswer('Is this a controlled drug?', 'No', 'medication-zone')}
            className="w-full rounded-lg border-2 border-green-500 bg-green-50 px-6 py-4 text-left font-medium text-green-900 transition-colors hover:bg-green-100"
          >
            <span className="text-lg">🟢 NO</span>
            <p className="mt-1 text-sm opacity-80">Not a controlled drug</p>
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Medication Zone
  if (currentStep === 'medication-zone') {
    return (
      <div className="mx-auto w-full max-w-5xl rounded-lg border border-border bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-text-tertiary">
              Step
{' '}
{stepNumber}
{' '}
of
{' '}
{totalSteps}
            </span>
            <div className="mx-4 h-2 flex-1 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-300"
                style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
              />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-text-primary">
            What zone is this medication?
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col rounded-lg border-2 border-red-500 bg-red-50 md:flex-row">
            <button
              type="button"
              onClick={() =>
                handleAnswer(
                  'What zone is this medication?',
                  'RED Zone',
                  'result',
                  {
                    type: 'stop',
                    duration: 'Maximum 3 months',
                    reason:
                      'RED zone medications require regular blood test monitoring. These cannot be prescribed for 12 months due to safety monitoring requirements.',
                    zone: 'red',
                  },
                )}
              className="min-w-0 flex-1 rounded-t-md px-6 py-4 text-left font-medium text-red-900 transition-colors hover:bg-red-100 md:rounded-l-md md:rounded-r-none"
            >
              <span className="text-lg">🔴 RED Zone</span>
              <p className="mt-1 text-sm opacity-80">
                Requires regular monitoring (warfarin, lithium, methotrexate,
                etc.)
              </p>
            </button>
            {onOpenChecker && (
              <button
                type="button"
                onClick={() => onOpenChecker('red')}
                className="min-h-[44px] w-full shrink-0 rounded-b-md px-4 py-3 text-sm font-medium text-red-700 hover:underline md:w-auto md:rounded-l-none md:rounded-r-md md:py-2"
              >
                View in checker →
              </button>
            )}
          </div>

          <div className="flex flex-col rounded-lg border-2 border-amber-500 bg-amber-50 md:flex-row">
            <button
              type="button"
              onClick={() =>
                handleAnswer(
                  'What zone is this medication?',
                  'AMBER Zone',
                  'amber-criteria',
                )}
              className="min-w-0 flex-1 rounded-t-md px-6 py-4 text-left font-medium text-amber-900 transition-colors hover:bg-amber-100 md:rounded-l-md md:rounded-r-none"
            >
              <span className="text-lg">🟡 AMBER Zone</span>
              <p className="mt-1 text-sm opacity-80">
                Needs individual assessment (ACEi/ARBs, metformin, DOACs, etc.)
              </p>
            </button>
            {onOpenChecker && (
              <button
                type="button"
                onClick={() => onOpenChecker('amber')}
                className="min-h-[44px] w-full shrink-0 rounded-b-md px-4 py-3 text-sm font-medium text-amber-800 hover:underline md:w-auto md:rounded-l-none md:rounded-r-md md:py-2"
              >
                View in checker →
              </button>
            )}
          </div>

          <div className="flex flex-col rounded-lg border-2 border-green-500 bg-green-50 md:flex-row">
            <button
              type="button"
              onClick={() =>
                handleAnswer(
                  'What zone is this medication?',
                  'GREEN Zone',
                  'patient-stability',
                )}
              className="min-w-0 flex-1 rounded-t-md px-6 py-4 text-left font-medium text-green-900 transition-colors hover:bg-green-100 md:rounded-l-md md:rounded-r-none"
            >
              <span className="text-lg">🟢 GREEN Zone</span>
              <p className="mt-1 text-sm opacity-80">
                Generally suitable (statins, CCBs, beta blockers, ICS, etc.)
              </p>
            </button>
            {onOpenChecker && (
              <button
                type="button"
                onClick={() => onOpenChecker('green')}
                className="min-h-[44px] w-full shrink-0 rounded-b-md px-4 py-3 text-sm font-medium text-green-800 hover:underline md:w-auto md:rounded-l-none md:rounded-r-md md:py-2"
              >
                View in checker →
              </button>
            )}
          </div>
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

  // Step 3: AMBER Criteria (only if AMBER selected)
  if (currentStep === 'amber-criteria') {
    return (
      <div className="mx-auto w-full max-w-5xl rounded-lg border border-border bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-text-tertiary">
              Step
{' '}
{stepNumber}
{' '}
of
{' '}
{totalSteps}
            </span>
            <div className="mx-4 h-2 flex-1 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-300"
                style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
              />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-text-primary">
            Does the medication meet AMBER zone criteria?
          </h3>
        </div>

        <div className="mb-6 flex flex-col rounded-lg border border-amber-200 bg-amber-50 p-4 md:flex-row md:items-start md:gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-amber-900">
              <strong>Common AMBER criteria:</strong>
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-800">
              <li>ACEi/ARBs: eGFR ≥60 = 12mo OK</li>
              <li>Metformin: eGFR &gt;45 = 12mo OK</li>
              <li>DOACs: CrCl varies by drug (see checker)</li>
              <li>Sulfonylureas: Age &lt;70 & eGFR &gt;60 = 12mo OK</li>
            </ul>
          </div>
          {onOpenChecker && (
            <button
              type="button"
              onClick={() => onOpenChecker('amber')}
              className="min-h-[44px] flex-shrink-0 px-4 py-3 text-sm font-medium text-amber-800 hover:underline md:mt-0 md:py-2 w-full md:w-auto"
            >
              View AMBER Table →
            </button>
          )}
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() =>
              handleAnswer(
                'Does the medication meet AMBER zone criteria?',
                'Yes - criteria met',
                'patient-stability',
              )}
            className="w-full rounded-lg border-2 border-green-500 bg-green-50 px-6 py-4 text-left font-medium text-green-900 transition-colors hover:bg-green-100"
          >
            <span className="text-lg">✓ YES - Criteria met</span>
            <p className="mt-1 text-sm opacity-80">
              Patient meets the threshold criteria for this medication
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              handleAnswer(
                'Does the medication meet AMBER zone criteria?',
                'No - criteria NOT met',
                'result',
                {
                  type: 'consider-shorter',
                  duration: '3-6 months recommended',
                  reason:
                    'Patient does not meet AMBER zone criteria. Consider shorter prescription duration with more frequent monitoring.',
                  zone: 'amber',
                },
              )}
            className="w-full rounded-lg border-2 border-amber-500 bg-amber-50 px-6 py-4 text-left font-medium text-amber-900 transition-colors hover:bg-amber-100"
          >
            <span className="text-lg">✗ NO - Criteria NOT met</span>
            <p className="mt-1 text-sm opacity-80">
              Patient doesn't meet threshold (e.g., eGFR too low, age concern)
            </p>
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

  // Step 4: Patient Stability
  if (currentStep === 'patient-stability') {
    return (
      <div className="mx-auto w-full max-w-5xl rounded-lg border border-border bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-text-tertiary">
              Step
{' '}
{stepNumber}
{' '}
of
{' '}
{totalSteps}
            </span>
            <div className="mx-4 h-2 flex-1 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-300"
                style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
              />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-text-primary">
            Is the patient stable on current medication?
          </h3>
        </div>

        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-900">
            <strong>Consider stable if:</strong>
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-800">
            <li>Condition well-controlled (e.g., BP at target, HbA1c stable)</li>
            <li>
              No recent dose changes (guidance suggests 6+ months, but YOUR
              discretion)
            </li>
            <li>No recent exacerbations or hospital admissions</li>
            <li>Good medication adherence</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() =>
              handleAnswer(
                'Is the patient stable on current medication?',
                'Yes - patient stable',
                'clinical-judgment',
              )}
            className="w-full rounded-lg border-2 border-green-500 bg-green-50 px-6 py-4 text-left font-medium text-green-900 transition-colors hover:bg-green-100"
          >
            <span className="text-lg">✓ YES - Patient stable</span>
            <p className="mt-1 text-sm opacity-80">
              Condition controlled, no recent changes, good adherence
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              handleAnswer(
                'Is the patient stable on current medication?',
                'No - patient unstable or uncertain',
                'result',
                {
                  type: 'consider-shorter',
                  duration: '3-6 months recommended',
                  reason:
                    'Patient condition is unstable, has recent dose changes, or requires closer monitoring. Consider shorter prescription duration until stability is established.',
                  zone: 'amber',
                },
              )}
            className="w-full rounded-lg border-2 border-amber-500 bg-amber-50 px-6 py-4 text-left font-medium text-amber-900 transition-colors hover:bg-amber-100"
          >
            <span className="text-lg">⚠ NO - Unstable or uncertain</span>
            <p className="mt-1 text-sm opacity-80">
              Recent changes, poor control, or needs closer monitoring
            </p>
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

  // Step 5: Clinical Judgment
  if (currentStep === 'clinical-judgment') {
    return (
      <div className="mx-auto w-full max-w-5xl rounded-lg border border-border bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-text-tertiary">
              Step
{' '}
{stepNumber}
{' '}
of
{' '}
{totalSteps}
            </span>
            <div className="mx-4 h-2 flex-1 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-300"
                style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
              />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-text-primary">
            Choose prescription duration
          </h3>
          <p className="mt-2 text-text-secondary">
            Based on your clinical judgment
          </p>
        </div>

        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-900">
            <strong>✓ Patient is suitable for longer prescriptions</strong>
          </p>
          <p className="mt-2 text-sm text-green-800">
            All criteria met. You have full discretion to choose duration based
            on individual patient factors.
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() =>
              handleAnswer(
                'Choose prescription duration',
                '12 months',
                'result',
                {
                  type: 'suitable',
                  duration: '12 months',
                  reason:
                    'Patient meets all criteria for 12-month prescription: not a controlled drug, medication suitable (GREEN/AMBER with criteria met), patient stable. Ensure annual review is booked.',
                  zone: 'green',
                },
              )}
            className="w-full rounded-lg border-2 border-green-500 bg-green-50 px-6 py-4 text-left font-medium text-green-900 transition-colors hover:bg-green-100"
          >
            <span className="text-lg">12 months</span>
            <p className="mt-1 text-sm opacity-80">
              Maximum duration - ensure annual review booked
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              handleAnswer(
                'Choose prescription duration',
                '6 months',
                'result',
                {
                  type: 'suitable',
                  duration: '6 months (RNZCGP recommended)',
                  reason:
                    'Patient suitable for longer prescription. 6 months is RNZCGP\'s recommended duration as safer than 12 months - allows for more frequent medication reconciliation and monitoring.',
                  zone: 'green',
                },
              )}
            className="w-full rounded-lg border-2 border-blue-500 bg-blue-50 px-6 py-4 text-left font-medium text-blue-900 transition-colors hover:bg-blue-100"
          >
            <span className="text-lg">6 months</span>
            <p className="mt-1 text-sm opacity-80">
              RNZCGP recommended as safer - more frequent touchpoints
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              handleAnswer(
                'Choose prescription duration',
                '3 months',
                'result',
                {
                  type: 'suitable',
                  duration: '3 months (current standard)',
                  reason:
                    'Patient suitable for longer prescription, but 3 months chosen for closer monitoring or practice preference. This is the traditional standard duration.',
                  zone: 'green',
                },
              )}
            className="w-full rounded-lg border-2 border-gray-400 bg-gray-50 px-6 py-4 text-left font-medium text-gray-900 transition-colors hover:bg-gray-100"
          >
            <span className="text-lg">3 months</span>
            <p className="mt-1 text-sm opacity-80">
              Traditional standard - most frequent monitoring
            </p>
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

  // Result Screen
  if (currentStep === 'result' && result) {
    const zoneColors = {
      red: 'border-red-500 bg-red-50 text-red-900',
      amber: 'border-amber-500 bg-amber-50 text-amber-900',
      green: 'border-green-500 bg-green-50 text-green-900',
    };

    const zoneColor = result.zone
      ? zoneColors[result.zone]
      : 'border-blue-500 bg-blue-50 text-blue-900';

    return (
      <div className="mx-auto w-full max-w-5xl rounded-lg border border-border bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
        <div
          className={`mb-6 rounded-lg border-2 p-6 ${zoneColor}`}
        >
          <h3 className="mb-2 text-2xl font-bold">
            {result.type === 'stop' && '🔴 Not Suitable for 12 Months'}
            {result.type === 'consider-shorter' && '⚠️ Consider Shorter Duration'}
            {result.type === 'suitable' && '✅ Suitable for Longer Prescription'}
          </h3>
          <p className="mb-3 text-xl font-semibold">{result.duration}</p>
          <p className="text-sm opacity-90">{result.reason}</p>
        </div>

        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h4 className="mb-3 font-semibold text-text-primary">
            Decision Summary
          </h4>
          <div className="space-y-2 text-sm text-text-secondary">
            <div>
              <p className="font-medium text-text-primary">Decision</p>
              <p className="mt-1">{result.duration}</p>
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
              Copied to clipboard
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
