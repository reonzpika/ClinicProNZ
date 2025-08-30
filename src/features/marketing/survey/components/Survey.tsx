'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import { Checkbox } from '@/src/shared/components/ui/checkbox';
import { Input } from '@/src/shared/components/ui/input';
import { Label } from '@/src/shared/components/ui/label';

import { emitAnalytics } from '../analytics';
import type { SurveyPayload } from '../types';

const Q1_OPTIONS = [
  'Writing / finishing consultation notes',
  'Completing ACC forms',
  'Writing referrals',
  'Looking up clinical resources (e.g. healthpathway, dermnet, bpac, nzformulary etc)',
  'Capturing & storing clinical images',
  'Other — please specify:',
];

// Q2 removed from the flow

const Q3A_OPTIONS = [
  'Recall — hard to remember consult details',
  'Time — too slow to type/finish notes',
  'Other — please specify:',
];

const Q3B_OPTIONS = [
  'Info overload — key recommendations are buried',
  'Navigation — slow/clunky under time pressure',
  'Context switching — PMS/browsers/logins',
  'Time pressure — patient waiting feels awkward',
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

export function Survey() {
  const router = useRouter();
  const [step, setStep] = useState<number>(0); // 0-intro, 1..6 questions
  const [q1, setQ1] = useState<string[]>([]);
  const [q1Other, setQ1Other] = useState('');
  const [q3ByTopic, setQ3ByTopic] = useState<Record<string, { selected: string[]; free?: string }>>({});
  const [q4A, setQ4A] = useState<string | null>(null);
  const [q4BIssues, setQ4BIssues] = useState<string[]>([]);
  const [q4Vendor, setQ4Vendor] = useState('');
  const [q4NoReasons, setQ4NoReasons] = useState<string[]>([]);
  const [q4NoOther, setQ4NoOther] = useState('');
  const [q5, setQ5] = useState<number | null>(null);
  const [q5Band, setQ5Band] = useState<string | null>(null);
  // Email capture removed; signup handled on thank-you page
  const [submitting, setSubmitting] = useState(false);
  const startedRef = useRef(false);

  const q1Topics = useMemo(() => {
    return (
      q1
        .map((v) => {
          if (v === 'Writing / finishing consultation notes') {
 return { topic: 'notes', label: 'Writing notes', options: Q3A_OPTIONS } as const;
}
          if (
            v.toLowerCase().includes('clinical resources')
            || v.toLowerCase().includes('healthpathway')
            || v.toLowerCase().includes('nzformulary')
            || v.toLowerCase().includes('dermnet')
            || v.toLowerCase().includes('bpac')
          ) {
 return { topic: 'guidance', label: 'Clinical resources', options: Q3B_OPTIONS } as const;
}
          if (v.includes('ACC')) {
 return { topic: 'acc', label: 'ACC', options: [
            'Duplication — re-entering notes',
            'Employer details — finding/typing addresses',
            'Read codes — hard to find',
            'Occupation codes — hard to find',
            'ACC bounce-backs — more detail needed',
            'Other — please specify:',
          ] as const };
}
          if (v.toLowerCase().includes('referral')) {
 return { topic: 'referrals', label: 'Referrals', options: [
            'Criteria hunting — DHB/specialty rules vary',
            'Duplication — re-enter notes into referral',
            'Over-documenting — extra detail to avoid rejection',
            'Other — please specify:',
          ] as const };
}
          if (v.toLowerCase().includes('image')) {
 return { topic: 'images', label: 'Clinical images', options: [
            'Personal device — feels insecure/unprofessional',
            'Admin handoff — staff must upload',
            'File size — photos too large to attach',
            'Other — please specify:',
          ] as const };
}
          return null;
        })
        .filter(Boolean) as Array<{ topic: string; label: string; options: readonly string[] }>
    );
  }, [q1]);

  // Analytics: survey_started on first interaction + drop-off on unload
  if (!startedRef.current && typeof window !== 'undefined') {
    startedRef.current = true;
    emitAnalytics({ type: 'survey_started', timestamp: Date.now() });
    window.addEventListener('beforeunload', () => {
      const lastId = `step_${Math.min(step + 1, 5)}`;
      emitAnalytics({ type: 'survey_dropped_off', lastQuestionId: lastId, timestamp: Date.now() });
    });
  }

  function next() {
    const nextStep = Math.min(step + 1, 5);
    setStep(nextStep);
    emitAnalytics({ type: 'survey_question_viewed', questionId: `step_${nextStep}`, timestamp: Date.now() });
  }

  function prev() {
    const prevStep = Math.max(step - 1, 0);
    setStep(prevStep);
    emitAnalytics({ type: 'survey_question_viewed', questionId: `step_${prevStep}`, timestamp: Date.now() });
  }

  async function submit() {
    setSubmitting(true);
    const payload: SurveyPayload = {
      email: null,
      q1: [...q1, ...(q1Other.trim() ? [q1Other.trim()] : [])],
      q3: q1Topics.map(({ topic }) => ({
        topic: topic as any,
        selected: Array.isArray(q3ByTopic[topic]?.selected) ? q3ByTopic[topic]?.selected : (q3ByTopic[topic]?.selected ? [q3ByTopic[topic]?.selected] : []),
        free_text: q3ByTopic[topic]?.free?.trim() || undefined,
      })),
      q4: {
        type: q4A === 'Yes — AI scribe (e.g. Heidi, Nabla, Abridge — name it below)'
          ? 'ai_scribe'
          : q4A === 'Yes — Dictation only (Dragon or built-in typing)'
            ? 'dictation'
            : 'none',
        issues: q4BIssues.length > 0 ? q4BIssues : undefined,
        vendor: q4Vendor.trim() || undefined,
        no_try_reason: q4A === 'No — never tried' ? [...q4NoReasons, ...(q4NoOther.trim() ? [q4NoOther.trim()] : [])] : undefined,
      },
      q5: q5 || 1,
      q5_price_band: q5 && q5 >= 4 ? (q5Band || null) : null,
    };

    try {
      const res = await fetch('/api/surveys/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
 throw new Error(data?.error || 'Submit failed');
}
      emitAnalytics({ type: 'survey_submitted', id: data.id, email_opted_in: false, gold_lead: false, timestamp: Date.now() });
      const firstToken = (q1[0] || '').toLowerCase().split(' ')[0] ?? '';
      const utm = new URLSearchParams([['from_survey', firstToken]]).toString();
      router.push(`/landing-page/thank-you?${utm}`);
    } catch (e) {
      console.error('Survey submission failed:', e);
    } finally {
      setSubmitting(false);
    }
  }

  // Basic validation guards per step
  const canContinue = (() => {
    if (step === 0) {
 return true;
}
    if (step === 1) {
 return q1.length > 0 || !!q1Other.trim();
}
    if (step === 2) {
 return q1Topics.every(({ topic }) => Array.isArray(q3ByTopic[topic]?.selected) ? (q3ByTopic[topic]?.selected as string[]).length > 0 : !!q3ByTopic[topic]?.selected);
}
         if (step === 3) {
  return !!q4A && (q4A.startsWith('Yes — AI scribe') ? q4BIssues.length > 0 : true);
 }
    if (step === 4) {
 return typeof q5 === 'number' && q5 >= 1 && q5 <= 5 && (q5 >= 4 ? !!q5Band : true);
}
    return true;
  })();

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-4 text-sm text-gray-600">
Step
{Math.min(step + 1, 5)}
{' '}
of 5
      </div>
      {step === 0 && (
        <div>
          <p className="mb-6 text-lg">
            Hi — quick 2–3 minute survey from Dr Ryo. Your answers will shape features for busy GPs. Ready?
          </p>
          <div className="flex gap-3">
            <Button onClick={next}>Yes, start</Button>
            <Button
              variant="secondary"
              onClick={() => {
                emitAnalytics({ type: 'survey_dropped_off', lastQuestionId: `step_${Math.min(step + 1, 5)}`, timestamp: Date.now() });
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
          <h2 className="mb-2 text-lg font-semibold">Which tasks during a typical 15-minute consult slows you down? (pick any)</h2>
          <div className="space-y-3">
            {Q1_OPTIONS.map(opt => (
              <div key={opt} className="flex items-center gap-2">
                {opt.startsWith('Other')
? (
                  <>
                    <Checkbox id="q1-other" checked={!!q1Other} onCheckedChange={v => setQ1Other(v ? q1Other : '')} />
                    <Label htmlFor="q1-other" className="sr-only">Other — please specify</Label>
                    <Input value={q1Other} onChange={e => setQ1Other(e.target.value)} placeholder="Other — please specify" />
                  </>
                )
: (
                  <>
                    <Checkbox id={opt} checked={q1.includes(opt)} onCheckedChange={v => setQ1(prev => v ? [...prev, opt] : prev.filter(p => p !== opt))} />
                    <Label htmlFor={opt}>{opt}</Label>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <Button variant="secondary" onClick={prev}>Back</Button>
            <Button onClick={next} disabled={!canContinue}>Next</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">What makes it hard for:</h2>
          {q1Topics.length === 0
? (
            <p className="text-sm text-gray-600">No follow-up needed for your Q1 selections.</p>
          )
: (
            <div className="space-y-6">
              {q1Topics.map(({ topic, label, options }) => (
                <div key={topic} className="rounded-md border p-3">
                  <h3 className="mb-2 text-base font-medium">{label}</h3>
                  <div className="space-y-2">
                    {options.map(opt => (
                      opt.startsWith('Other')
? (
                        <div key={`${topic}-other`} className="flex items-center gap-2">
                          <Label htmlFor={`q3-${topic}-other`} className="sr-only">Other — please specify</Label>
                          <Input
                            id={`q3-${topic}-other`}
                            value={q3ByTopic[topic]?.free || ''}
                            onChange={e => setQ3ByTopic(prev => ({ ...prev, [topic]: { selected: Array.isArray(prev[topic]?.selected) ? (prev[topic]?.selected as string[]) : [], free: e.target.value } }))}
                            placeholder="Other — please specify"
                          />
                        </div>
                      )
: (
                        <div key={opt} className="flex items-center gap-2">
                          <input
                            id={`q3-${topic}-${opt}`}
                            type="checkbox"
                            name={`q3-${topic}`}
                            value={opt}
                            checked={Array.isArray(q3ByTopic[topic]?.selected) ? (q3ByTopic[topic]?.selected as string[]).includes(opt) : false}
                            onChange={(e) => {
                              setQ3ByTopic((prev) => {
                                const current = Array.isArray(prev[topic]?.selected) ? (prev[topic]?.selected as string[]) : [];
                                const next = e.target.checked ? Array.from(new Set([...current, opt])) : current.filter(x => x !== opt);
                                emitAnalytics({ type: 'survey_question_answered', questionId: `q3_${topic}`, answer: next, timestamp: Date.now() });
                                return { ...prev, [topic]: { selected: next, free: prev[topic]?.free } };
                              });
                            }}
                            className="size-4"
                          />
                          <Label htmlFor={`q3-${topic}-${opt}`}>{opt}</Label>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex items-center justify-between">
            <Button variant="secondary" onClick={prev}>Back</Button>
            <Button onClick={next} disabled={!canContinue}>Next</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">Do you currently use an AI scribe, dictation tool, or neither?</h2>
          <div className="space-y-2">
            {Q4A_OPTIONS.map(opt => (
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
                  className="size-4"
                />
                <Label htmlFor={`q4a-${opt}`}>{opt}</Label>
              </div>
            ))}
          </div>
          {q4A?.startsWith('Yes — AI scribe') && (
            <div className="mt-4">
              <Label className="mb-2 block">Do you have any issues with this tool?</Label>
              <div className="space-y-2">
                {Q4B_OPTIONS.map(opt => (
                  <div key={opt} className="flex items-center gap-2">
                    <input
                      id={`q4b-${opt}`}
                      type="checkbox"
                      value={opt}
                      checked={q4BIssues.includes(opt)}
                      onChange={(e) => {
                        const newIssues = e.target.checked
                          ? [...q4BIssues, opt]
                          : q4BIssues.filter(issue => issue !== opt);
                        setQ4BIssues(newIssues);
                        emitAnalytics({ type: 'survey_question_answered', questionId: 'q4b', answer: newIssues, timestamp: Date.now() });
                      }}
                      className="size-4"
                    />
                    <Label htmlFor={`q4b-${opt}`}>{opt}</Label>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <Label htmlFor="q4-vendor" className="mb-1 block">If you named a vendor above, which one?</Label>
                <Input id="q4-vendor" value={q4Vendor} onChange={e => setQ4Vendor(e.target.value)} placeholder="Vendor (optional)" />
              </div>
            </div>
          )}
          {q4A === 'No — never tried' && (
            <div className="mt-4">
              <Label className="mb-2 block">Why haven’t you tried an AI scribe or dictation tool?</Label>
              <div className="space-y-2">
                {['Privacy concerns', 'Doesn’t need it', 'Too technical', 'Too hard to set up', 'Cost concerns', 'Other — please specify:'].map(opt => (
                  <div key={opt} className="flex items-center gap-2">
                    <input
                      id={`q4n-${opt}`}
                      type="checkbox"
                      value={opt}
                      checked={q4NoReasons.includes(opt)}
                      onChange={e => setQ4NoReasons(prev => e.target.checked ? [...prev, opt] : prev.filter(x => x !== opt))}
                      className="size-4"
                    />
                    <Label htmlFor={`q4n-${opt}`}>{opt}</Label>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <Label htmlFor="q4n-other" className="mb-1 block">If other, please specify</Label>
                <Input id="q4n-other" value={q4NoOther} onChange={e => setQ4NoOther(e.target.value)} placeholder="Other reason (optional)" />
              </div>
            </div>
          )}
          <div className="mt-6 flex items-center justify-between">
            <Button variant="secondary" onClick={prev}>Back</Button>
            <Button onClick={next} disabled={!canContinue}>Next</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">If ClinicPro could reduce your work hours by 30-60min daily, how likely would you be to pay for it?</h2>
          <div className="space-y-2">
            {[1, 2, 4, 5].map(n => (
              <div key={n} className="flex items-center gap-2">
                <input
                  id={`q5-${n}`}
                  type="radio"
                  name="q5"
                  value={String(n)}
                  checked={q5?.toString() === String(n)}
                  onChange={(e) => {
                    const v = Number.parseInt(e.target.value, 10);
                    setQ5(v);
                    emitAnalytics({ type: 'survey_question_answered', questionId: 'q5', answer: v, timestamp: Date.now() });
                  }}
                  className="size-4"
                />
                <Label htmlFor={`q5-${n}`}>
                  {n === 1 && '1 — Definitely not pay'}
                  {n === 2 && '2 — Unlikely to pay'}
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
                {Q5_BANDS.map(b => (
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
                      className="size-4"
                    />
                    <Label htmlFor={`q5b-${b}`}>{b}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 flex items-center justify-between">
            <Button variant="secondary" onClick={prev}>Back</Button>
            <Button onClick={submit} disabled={!canContinue || submitting}>{submitting ? 'Submitting...' : 'Submit'}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
