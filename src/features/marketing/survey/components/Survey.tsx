'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/src/shared/components/ui/button';
import { Checkbox } from '@/src/shared/components/ui/checkbox';
import { Input } from '@/src/shared/components/ui/input';
import { Label } from '@/src/shared/components/ui/label';

import { emitAnalytics } from '../analytics';
import type { SurveyPayload } from '../types';

const Q1_OPTIONS = [
  'Writing / finishing consultation notes',
  'Completing ACC forms / insurance paperwork',
  'Drafting referrals (time + re-entry)',
  'Looking up clinical guidance or medication info (HealthPathways, doses, interactions) — combined',
  'Capturing & storing clinical images',
  'Other — please specify:',
];

const Q2_OPTIONS = [...Q1_OPTIONS.slice(0, 5), 'Other (specify)'];

const Q3A_OPTIONS = [
  'Trouble remembering everything we discussed in the consult',
  'Notes are messy / require lots of editing for clinical structure',
  'Takes too long to type / finish after consult',
  'Must re-enter/copy info into PMS (workflow friction)',
  'Cannot quickly attach evidence (images, test results) to the note',
  'Other — please specify:',
];

const Q3B_OPTIONS = [
  'Takes too long to find the right page',
  'Guidance not locally relevant / unclear',
  'Hard to confirm doses / interactions quickly',
  'Fragmented sources (too many places)',
  'Other — please specify:',
];

const Q4A_OPTIONS = [
  'Yes — AI scribe (e.g. Heidi, Nabla, Abridge — name it below)',
  'Yes — Dictation only (Dragon or built-in typing)',
  'No — never tried',
];

const Q4B_OPTIONS = [
  'Misses clinical details / accuracy issues',
  'Too wordy / poor structure — needs heavy editing',
  'Doesn’t match NZ practice style / abbreviations',
  'Workflow friction (integration / copying into PMS)',
  'Cost / pricing too high',
  'No issues — works well',
  'Other — please specify:',
];

const Q5_BANDS = ['<$25', '$25–$50', '$50–$100', '$100+', 'Prefer not to say'];

function getQ3Branch(q2: string | null) {
  if (!q2) return { id: 'q3', title: '', options: [] as string[] };
  if (q2 === 'Writing / finishing consultation notes') {
    return { id: 'q3a', title: 'What specifically makes writing notes hard for you?', options: Q3A_OPTIONS };
  }
  if (q2.startsWith('Looking up clinical guidance')) {
    return { id: 'q3b', title: 'What’s the main problem when searching during a consult?', options: Q3B_OPTIONS };
  }
  if (q2.includes('ACC')) {
    return { id: 'q3c', title: 'What’s the single biggest bottleneck with ACC paperwork?', options: ['Takes too long to complete', 'Re-entry into PMS', 'Finding the correct code/info', 'Other — please specify:'] };
  }
  if (q2.toLowerCase().includes('referral')) {
    return { id: 'q3d', title: 'What’s the biggest bottleneck drafting referrals?', options: ['Collecting required details', 'Re-entering into PMS/specialist forms', 'Formatting / structure', 'Other — please specify:'] };
  }
  if (q2.toLowerCase().includes('image')) {
    return { id: 'q3e', title: 'What’s the biggest bottleneck with clinical images?', options: ['Capturing quickly in consult', 'Attaching to PMS record', 'Organisation / retrieval later', 'Other — please specify:'] };
  }
  return { id: 'q3', title: 'Tell us more about this priority', options: ['Other — please specify:'] };
}

export function Survey() {
  const router = useRouter();
  const [step, setStep] = useState<number>(0); // 0-intro, 1..6 questions
  const [q1, setQ1] = useState<string[]>([]);
  const [q1Other, setQ1Other] = useState('');
  const [q2, setQ2] = useState<string | null>(null);
  const [q2Other, setQ2Other] = useState('');
  const [q3Selected, setQ3Selected] = useState<string | null>(null);
  const [q3Free, setQ3Free] = useState('');
  const [q4A, setQ4A] = useState<string | null>(null);
  const [q4BIssue, setQ4BIssue] = useState<string | null>(null);
  const [q4Vendor, setQ4Vendor] = useState('');
  const [q5, setQ5] = useState<number | null>(null);
  const [q5Band, setQ5Band] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [optIn, setOptIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const startedRef = useRef(false);

  const q3Branch = useMemo(() => getQ3Branch(q2), [q2]);

  // Analytics: survey_started on first interaction + drop-off on unload
  if (!startedRef.current && typeof window !== 'undefined') {
    startedRef.current = true;
    emitAnalytics({ type: 'survey_started', timestamp: Date.now() });
    window.addEventListener('beforeunload', () => {
      const lastId = `step_${Math.min(step + 1, 6)}`;
      emitAnalytics({ type: 'survey_dropped_off', lastQuestionId: lastId, timestamp: Date.now() });
    });
  }

  function next() {
    const nextStep = Math.min(step + 1, 6);
    setStep(nextStep);
    emitAnalytics({ type: 'survey_question_viewed', questionId: `step_${nextStep}`, timestamp: Date.now() });
  }

  async function submit() {
    if (!email) return;
    setSubmitting(true);
    const payload: SurveyPayload = {
      email,
      q1: [...q1, ...(q1Other.trim() ? [q1Other.trim()] : [])],
      q2: q2 === 'Other (specify)' ? (q2Other.trim() || 'Other') : (q2 || ''),
      q3: { selected: q3Selected || '', free_text: q3Free.trim() || undefined },
      q4: {
        type: q4A === 'Yes — AI scribe (e.g. Heidi, Nabla, Abridge — name it below)'
          ? 'ai_scribe'
          : q4A === 'Yes — Dictation only (Dragon or built-in typing)'
            ? 'dictation'
            : 'none',
        issue: q4BIssue || undefined,
        vendor: q4Vendor.trim() || undefined,
      },
      q5: q5 || 1,
      q5_price_band: q5 && q5 >= 4 ? (q5Band || null) : null,
      opted_in: optIn,
    };

    try {
      const res = await fetch('/api/surveys/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Submit failed');
      emitAnalytics({ type: 'survey_submitted', id: data.id, email_opted_in: optIn, gold_lead: false, timestamp: Date.now() });
      const utm = new URLSearchParams({ from_survey: (q2 || '').toLowerCase().split(' ')[0] }).toString();
      router.push(`/mvp-signup?${utm}`);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  // Basic validation guards per step
  const canContinue = (() => {
    if (step === 0) return true;
    if (step === 1) return q1.length > 0 || !!q1Other.trim();
    if (step === 2) return !!q2 || !!q2Other.trim();
    if (step === 3) return !!q3Selected;
    if (step === 4) return !!q4A && (q4A.startsWith('Yes — AI scribe') ? !!q4BIssue : true);
    if (step === 5) return typeof q5 === 'number' && q5 >= 1 && q5 <= 5 && (q5 >= 4 ? !!q5Band : true);
    if (step === 6) return !!email;
    return true;
  })();

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-4 text-sm text-gray-600">Step {Math.min(step + 1, 6)} of 6</div>
      {step === 0 && (
        <div>
          <p className="mb-6 text-lg">
            Hi — quick 2–3 minute survey from ClinicPro (built by a practising NZ GP). Your answers will shape features for busy GPs. We’ll email you about early access if you sign up at the end. Ready?
          </p>
          <div className="flex gap-3">
            <Button onClick={next}>Yes, start</Button>
            <Button
              variant="secondary"
              onClick={() => {
                emitAnalytics({ type: 'survey_dropped_off', lastQuestionId: `step_${Math.min(step + 1, 6)}` , timestamp: Date.now() });
                history.back();
              }}
            >
              Not now
            </Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">Which tasks during a typical 15-minute consult cause you the most friction? (pick any)</h2>
          <div className="space-y-3">
            {Q1_OPTIONS.map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                {opt.startsWith('Other') ? (
                  <>
                    <Checkbox id="q1-other" checked={!!q1Other} onCheckedChange={(v) => setQ1Other(v ? q1Other : '')} />
                    <Label htmlFor="q1-other" className="sr-only">Other — please specify</Label>
                    <Input value={q1Other} onChange={(e) => setQ1Other(e.target.value)} placeholder="Other — please specify" />
                  </>
                ) : (
                  <>
                    <Checkbox id={opt} checked={q1.includes(opt)} onCheckedChange={(v) => setQ1((prev) => v ? [...prev, opt] : prev.filter((p) => p !== opt))} />
                    <Label htmlFor={opt}>{opt}</Label>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={next} disabled={!canContinue}>Next</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">If we could fix one thing for you tomorrow, which would you choose?</h2>
          <div className="space-y-2">
            {Q2_OPTIONS.map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <input
                  id={`q2-${opt}`}
                  type="radio"
                  name="q2"
                  value={opt}
                  checked={q2 === opt}
                  onChange={(e) => {
                    setQ2(e.target.value);
                    emitAnalytics({ type: 'survey_question_answered', questionId: 'q2', answer: e.target.value, timestamp: Date.now() });
                  }}
                  className="h-4 w-4"
                />
                <Label htmlFor={`q2-${opt}`}>{opt}</Label>
              </div>
            ))}
          </div>
          {q2 === 'Other (specify)' && (
            <div className="mt-3">
              <Label htmlFor="q2-other" className="mb-1 block">Other — please specify</Label>
              <Input id="q2-other" value={q2Other} onChange={(e) => setQ2Other(e.target.value)} />
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <Button onClick={next} disabled={!canContinue}>Next</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">{q3Branch.title}</h2>
          <div className="space-y-2">
            {q3Branch.options.map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <input
                  id={`q3-${opt}`}
                  type="radio"
                  name="q3"
                  value={opt}
                  checked={q3Selected === opt}
                  onChange={(e) => {
                    setQ3Selected(e.target.value);
                    emitAnalytics({ type: 'survey_question_answered', questionId: q3Branch.id, answer: e.target.value, timestamp: Date.now() });
                  }}
                  className="h-4 w-4"
                />
                <Label htmlFor={`q3-${opt}`}>{opt}</Label>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Label htmlFor="q3-free" className="mb-1 block">Optional: one-line details</Label>
            <Input id="q3-free" value={q3Free} onChange={(e) => setQ3Free(e.target.value)} placeholder="Add a brief detail (optional)" />
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={next} disabled={!canContinue}>Next</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">Do you currently use an AI scribe, dictation tool, or neither?</h2>
          <div className="space-y-2">
            {Q4A_OPTIONS.map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <input
                  id={`q4a-${opt}`}
                  type="radio"
                  name="q4a"
                  value={opt}
                  checked={q4A === opt}
                  onChange={(e) => {
                    setQ4A(e.target.value);
                    emitAnalytics({ type: 'survey_question_answered', questionId: 'q4a', answer: e.target.value, timestamp: Date.now() });
                  }}
                  className="h-4 w-4"
                />
                <Label htmlFor={`q4a-${opt}`}>{opt}</Label>
              </div>
            ))}
          </div>
          {q4A?.startsWith('Yes — AI scribe') && (
            <div className="mt-4">
              <Label className="mb-2 block">What’s the single biggest issue you have with that tool?</Label>
              <div className="space-y-2">
                {Q4B_OPTIONS.map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <input
                      id={`q4b-${opt}`}
                      type="radio"
                      name="q4b"
                      value={opt}
                      checked={q4BIssue === opt}
                      onChange={(e) => {
                        setQ4BIssue(e.target.value);
                        emitAnalytics({ type: 'survey_question_answered', questionId: 'q4b', answer: e.target.value, timestamp: Date.now() });
                      }}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={`q4b-${opt}`}>{opt}</Label>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <Label htmlFor="q4-vendor" className="mb-1 block">If you named a vendor above, which one?</Label>
                <Input id="q4-vendor" value={q4Vendor} onChange={(e) => setQ4Vendor(e.target.value)} placeholder="Vendor (optional)" />
              </div>
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <Button onClick={next} disabled={!canContinue}>Next</Button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">If ClinicPro reliably solved your top priority (Q2), how likely would you be to pay for it?</h2>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex items-center gap-2">
                <input
                  id={`q5-${n}`}
                  type="radio"
                  name="q5"
                  value={String(n)}
                  checked={q5?.toString() === String(n)}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setQ5(v);
                    emitAnalytics({ type: 'survey_question_answered', questionId: 'q5', answer: v, timestamp: Date.now() });
                  }}
                  className="h-4 w-4"
                />
                <Label htmlFor={`q5-${n}`}>
                  {n === 1 && '1 — Definitely not pay'}
                  {n === 2 && '2 — Unlikely to pay'}
                  {n === 3 && '3 — Might pay (depends on price)'}
                  {n === 4 && '4 — Likely to pay'}
                  {n === 5 && '5 — Would pay immediately (please contact me)'}
                </Label>
              </div>
            ))}
          </div>
          {q5 !== null && q5 >= 4 && (
            <div className="mt-4">
              <Label className="mb-2 block">What monthly price band seems fair for your practice?</Label>
              <div className="space-y-2">
                {Q5_BANDS.map((b) => (
                  <div key={b} className="flex items-center gap-2">
                    <input
                      id={`q5b-${b}`}
                      type="radio"
                      name="q5b"
                      value={b}
                      checked={q5Band === b}
                      onChange={(e) => {
                        setQ5Band(e.target.value);
                        emitAnalytics({ type: 'survey_question_answered', questionId: 'q5_price_band', answer: e.target.value, timestamp: Date.now() });
                      }}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={`q5b-${b}`}>{b}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <Button onClick={next} disabled={!canContinue}>Next</Button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div>
          <p className="mb-4">Thanks — that’s a huge help. ClinicPro’s AI scribe is <strong>free to use now</strong>, and we’re rolling out more features shortly. Sign up below to get access now</p>
          <div className="mb-3">
            <Label htmlFor="email">Email (required)</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-6 flex items-start gap-2">
            <Checkbox id="optin" checked={optIn} onCheckedChange={(v) => {
              const val = !!v;
              setOptIn(val);
              if (val) {
                const domain = email.split('@')[1] || undefined;
                emitAnalytics({ type: 'survey_opt_in', email_domain: domain, timestamp: Date.now() });
              }
            }} />
            <Label htmlFor="optin">I agree ClinicPro may contact me about early access and product updates. <a className="underline" href="/privacy" target="_blank" rel="noreferrer">privacy</a></Label>
          </div>
          <Button disabled={!canContinue || submitting} onClick={submit}>{submitting ? 'Submitting...' : 'sign up'}</Button>
          <p className="mt-3 text-xs text-gray-600">We’ll only use your email for ClinicPro updates and early access. We won’t sell your data. Manage preferences any time.</p>
        </div>
      )}
    </div>
  );
}

