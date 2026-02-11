'use client';

import Link from 'next/link';
import { useState } from 'react';

import { DecisionWizard } from '@/src/features/12-month-prescriptions';
import { Container } from '@/src/shared/components/layout/Container';

type SubscribeStatus = 'idle' | 'loading' | 'success' | 'error';

export default function TwelveMonthRxPage() {
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<SubscribeStatus>('idle');
  const [subscribeMessage, setSubscribeMessage] = useState('');

  async function handleSubscribeSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = subscribeEmail.trim();
    if (!email) return;
    setSubscribeStatus('loading');
    setSubscribeMessage('');
    try {
      const res = await fetch('/api/12-month-prescriptions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSubscribeStatus('success');
        setSubscribeMessage("Thanks, we'll notify you when we update the tools.");
        setSubscribeEmail('');
      } else {
        setSubscribeStatus('error');
        setSubscribeMessage(data?.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setSubscribeStatus('error');
      setSubscribeMessage('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-white">
        <Container size="md">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="text-xl font-bold text-text-primary">
              ClinicPro
            </Link>
          </div>
        </Container>
      </header>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-text-primary md:text-5xl">
            12-Month Prescriptions:
            <br />
            Clinical Decision Tools
          </h1>

          <div className="mb-6 flex flex-wrap justify-center gap-4">
            <a
              href="#checklist"
              className="rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Start Decision Tool ↓
            </a>
            <a
              href="#guidance"
              className="rounded-lg border-2 border-primary bg-white px-6 py-3 font-medium text-primary transition-colors hover:bg-surface"
            >
              Policy & Guidance
            </a>
          </div>
        </div>
      </section>

      <section id="checklist" className="scroll-mt-20 bg-white px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-3xl font-bold text-text-primary">
            Interactive Decision Tool
          </h2>
          <DecisionWizard />
        </div>
      </section>

      <section className="bg-surface px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <details className="rounded-lg border border-border bg-white p-6">
            <summary className="cursor-pointer text-2xl font-bold text-text-primary [&::-webkit-details-marker]:hidden">
              📋 Medication Reference Guide
            </summary>

            <div className="mt-6 space-y-6">
              <details className="rounded-lg border border-border bg-white p-4">
                <summary className="cursor-pointer font-semibold text-text-primary">
                  🔴 Generally NOT Suitable for 12 Months
                </summary>
                <div className="mt-4 space-y-4 text-sm text-text-secondary">
                  <p className="font-medium text-text-primary">
                    Why NOT suitable: Requires monitoring more often than
                    annually
                  </p>
                  <h4 className="font-semibold text-text-primary">
                    Controlled Drugs (Legal Exclusion)
                  </h4>
                  <p className="text-sm">
                    Maximum duration: 1-3 months (law, not clinical judgment)
                  </p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Class</th>
                          <th className="px-3 py-2 text-left">Max Duration</th>
                          <th className="px-3 py-2 text-left">Examples</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="px-3 py-2 font-medium">Class B</td>
                          <td className="px-3 py-2">1 month</td>
                          <td className="px-3 py-2">
                            Morphine, oxycodone, fentanyl, methadone,
                            methylphenidate, dexamphetamine
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-medium">Class C</td>
                          <td className="px-3 py-2">3 months</td>
                          <td className="px-3 py-2">
                            Tramadol, codeine (prescription strength),
                            diazepam, lorazepam, clonazepam, zopiclone
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-text-tertiary">
                    Source: Misuse of Drugs Act 1975
                  </p>
                  <h4 className="font-semibold text-text-primary">
                    High-Risk Medications Requiring Regular Monitoring
                  </h4>
                  <p className="text-sm">
                    Typical maximum: 3 months. These need regular blood tests or
                    monitoring that can&apos;t wait 12 months.
                  </p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>
                      <strong>Warfarin</strong> – INR monitoring (weekly to
                      monthly depending on stability)
                    </li>
                    <li>
                      <strong>Lithium</strong> – Levels 3-monthly, renal +
                      thyroid function 3-6 monthly
                    </li>
                    <li>
                      <strong>Digoxin</strong> – Levels + renal function 3-6
                      monthly, ECG annually
                    </li>
                    <li>
                      <strong>Methotrexate</strong> – FBC + LFTs monthly
                      initially, then 2-3 monthly
                    </li>
                    <li>
                      <strong>Azathioprine</strong> – FBC + LFTs monthly
                      initially, then 3-monthly
                    </li>
                    <li>
                      <strong>Amiodarone</strong> – TFTs + LFTs 6-monthly, CXR +
                      ECG annually
                    </li>
                    <li>
                      <strong>Sodium valproate</strong> – LFTs + FBC 6-monthly
                    </li>
                    <li>
                      <strong>Carbamazepine</strong> – FBC + LFTs + Na+
                      6-monthly
                    </li>
                    <li>
                      <strong>Insulin</strong> – Regular dose adjustments needed
                    </li>
                  </ul>
                  <a
                    href="https://nzf.org.nz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    → Check NZF
                  </a>{' '}
                  for specific monitoring schedules and dose adjustments.
                </div>
              </details>

              <details className="rounded-lg border border-border bg-white p-4">
                <summary className="cursor-pointer font-semibold text-text-primary">
                  🟡 Requires Individual Assessment
                </summary>
                <div className="mt-4 space-y-4 text-sm text-text-secondary">
                  <p className="font-medium text-text-primary">
                    Suitability depends on patient parameters (eGFR, age, etc.).
                    Check patient&apos;s specific values before deciding
                    duration.
                  </p>
                  <ul className="ml-4 list-disc space-y-2">
                    <li>
                      <strong>Metformin:</strong> eGFR &gt;45 generally 12mo;
                      eGFR 30-45 max 6mo; eGFR &lt;30 contraindicated.{' '}
                      <a
                        href="https://nzf.org.nz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        → Check NZF
                      </a>
                    </li>
                    <li>
                      <strong>ACE Inhibitors / ARBs:</strong> eGFR ≥60 generally
                      12mo; 45-59 consider 6-12mo; 30-44 max 6mo; &lt;30 max
                      3-6mo.{' '}
                      <a
                        href="https://nzf.org.nz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        → Check NZF
                      </a>
                    </li>
                    <li>
                      <strong>DOACs:</strong> CrCl ≥50 generally 12mo (varies
                      by drug); CrCl &lt;50 shorter or dose adjust.{' '}
                      <a
                        href="https://nzf.org.nz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        → Check NZF
                      </a>
                    </li>
                    <li>
                      <strong>Sulfonylureas:</strong> Age &lt;70 + eGFR &gt;60
                      generally 12mo; age ≥70 or eGFR &lt;60 consider 6mo.{' '}
                      <a
                        href="https://nzf.org.nz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        → Check NZF
                      </a>
                    </li>
                    <li>
                      <strong>NSAIDs:</strong> With ACEi/ARB (&quot;double
                      whammy&quot;) max 6mo; with ACEi/ARB + diuretic
                      (&quot;triple whammy&quot;) max 3mo.{' '}
                      <a
                        href="https://bpac.org.nz/2018/triple-whammy.aspx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        → Check BPAC
                      </a>
                    </li>
                    <li>
                      <strong>Spironolactone:</strong> MAX 6 months even when
                      stable (K+ monitoring).{' '}
                      <a
                        href="https://nzf.org.nz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        → Check NZF
                      </a>
                    </li>
                    <li>
                      <strong>Allopurinol:</strong> eGFR &gt;60 generally 12mo;
                      eGFR &lt;60 consider 6mo.{' '}
                      <a
                        href="https://nzf.org.nz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        → Check NZF
                      </a>
                    </li>
                    <li>
                      Other: SGLT-2 inhibitors, gabapentin/pregabalin,
                      bisphosphonates, loop diuretics (max 6mo), levothyroxine
                      (12mo OK if dose stable 6+ months). Always check NZF.
                    </li>
                  </ul>
                </div>
              </details>

              <details className="rounded-lg border border-border bg-white p-4">
                <summary className="cursor-pointer font-semibold text-text-primary">
                  🟢 Generally Suitable for 12 Months
                </summary>
                <div className="mt-4 space-y-4 text-sm text-text-secondary">
                  <p>
                    If patient stable: these typically require only annual
                    monitoring. &quot;Generally suitable&quot; does NOT mean
                    automatically 12 months for everyone.
                  </p>
                  <p className="font-medium text-text-primary">
                    Common examples by category:
                  </p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>
                      <strong>Cardiovascular:</strong> Statins, CCBs (amlodipine,
                      felodipine), beta blockers, aspirin (antiplatelet)
                    </li>
                    <li>
                      <strong>Respiratory:</strong> ICS, ICS/LABA, LAMA
                      (tiotropium), salbutamol
                    </li>
                    <li>
                      <strong>Gastrointestinal:</strong> PPIs (omeprazole,
                      esomeprazole)
                    </li>
                    <li>
                      <strong>Hormonal:</strong> Oral contraceptives (annual BP),
                      levothyroxine (if dose stable)
                    </li>
                    <li>
                      <strong>Mental health:</strong> SSRIs/SNRIs (annual
                      discussion about ongoing need), mirtazapine
                    </li>
                    <li>
                      <strong>Diabetes:</strong> DPP-4 inhibitors (vildagliptin,
                      sitagliptin)
                    </li>
                    <li>
                      <strong>Other:</strong> Calcium + Vitamin D, montelukast
                    </li>
                  </ul>
                  <p className="font-medium text-text-primary">
                    Typical annual monitoring:
                  </p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>BP (cardiovascular), lipid profile (statins), TSH (levothyroxine)</li>
                    <li>Spirometry and inhaler technique (respiratory, if available)</li>
                  </ul>
                  <a
                    href="https://nzf.org.nz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    → Check NZF
                  </a>{' '}
                  to confirm annual monitoring is sufficient for your patient.
                </div>
              </details>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="mb-2 font-semibold text-amber-900">
                  🔴 Important Notes:
                </p>
                <ol className="ml-4 list-decimal space-y-1 text-sm text-amber-800">
                  <li>
                    These are EXAMPLES, not comprehensive lists. Always check NZF.
                  </li>
                  <li>
                    Lists are GUIDANCE, not rules. You have full clinical
                    discretion.
                  </li>
                  <li>NZF is the authoritative source.</li>
                  <li>When in doubt: Prescribe a shorter duration (3 or 6 months).</li>
                  <li>
                    6 months is completely acceptable. RNZCGP recommended 6
                    months as safer than 12 months.
                  </li>
                </ol>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                <h3 className="mb-3 text-lg font-semibold text-blue-900">
                  Why we link to NZF instead of listing all medications
                </h3>
                <p className="mb-3 text-sm text-blue-800">
                  The New Zealand Formulary is the gold-standard, authoritative
                  source for medication information in NZ. It&apos;s updated
                  monthly and includes monitoring requirements, dose adjustments,
                  interactions, and latest safety alerts.
                </p>
                <p className="mb-4 text-sm text-blue-800">
                  We&apos;ve requested API access from NZF to integrate medication
                  data directly. If approved, future versions will auto-populate
                  monitoring requirements.
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

              <p className="text-xs text-text-tertiary">
                <strong>Disclaimer:</strong> This medication reference is for
                educational purposes only and does not replace clinical judgment
                or official prescribing guidance. Always consult the New
                Zealand Formulary, Medsafe data sheets, and relevant clinical
                guidelines. Medication lists were compiled from RNZCGP guidance,
                BPAC resources, and clinical consensus as of February 2026.
              </p>
            </div>
          </details>
        </div>
      </section>

      <section id="guidance" className="scroll-mt-20 bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-3xl font-bold text-text-primary">
            Understanding 12-Month Prescriptions
          </h2>

          {/* What Changed - Always Visible */}
          <div className="mb-8 rounded-lg border border-border bg-surface p-6">
            <h3 className="mb-4 text-2xl font-semibold text-text-primary">
              What Changed on 1 February 2026
            </h3>
            <p className="mb-4 text-text-secondary">
              From 1 February 2026, prescriptions can be written for up to 12
              months (increased from 3 months for most medicines). Pharmacies
              still dispense a maximum of 3 months&apos; supply at a time, so
              patients collect repeats every 3 months. The change reduces
              prescription co-payments from $5 quarterly to $5 once per year.
            </p>
            <a
              href="https://www.health.govt.nz/strategies-initiatives/programmes-and-initiatives/primary-and-community-health-care/increasing-prescribing-lengths"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Learn more about the policy →
            </a>
          </div>

          {/* Two Perspectives - Side by Side Cards */}
          <div className="mb-8">
            <h3 className="mb-4 text-2xl font-semibold text-text-primary">
              Two Perspectives
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Government View */}
              <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-6">
                <h4 className="mb-3 text-lg font-semibold text-blue-900">
                  🏛️ Government Rationale
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Cost savings for patients ($5 once vs $20 yearly)</li>
                  <li>• Improved access (fewer pharmacy trips)</li>
                  <li>• Reduced GP appointment burden</li>
                  <li>• Aligns with international practice</li>
                </ul>
                <p className="mt-3 text-xs text-blue-700">
                  Source: Ministry of Health Regulatory Impact Statement
                </p>
              </div>

              {/* RNZCGP Position */}
              <div className="rounded-lg border-2 border-amber-500 bg-amber-50 p-6">
                <h4 className="mb-3 text-lg font-semibold text-amber-900">
                  ⚕️ RNZCGP Position
                </h4>
                <p className="mb-3 text-sm font-medium text-amber-900">
                  Formally recommended 6 months as safer alternative
                </p>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li>• Patient safety concerns (less frequent monitoring)</li>
                  <li>• Equity risks for Māori and Pacific peoples</li>
                  <li>• Practice financial sustainability</li>
                  <li>• 6 months balances benefits with safety</li>
                </ul>
                <p className="mt-3 text-xs text-amber-700">
                  Source: RNZCGP Submission, October 2024
                </p>
              </div>
            </div>
            <p className="mt-4 text-center text-sm text-text-secondary">
              <strong>You have full clinical discretion</strong> to prescribe 3,
              6, 9, or 12 months based on individual patient assessment.
            </p>
          </div>

          {/* Authority Hierarchy - Collapsible */}
          <div className="mb-8">
            <details className="rounded-lg border border-border bg-white p-6">
              <summary className="cursor-pointer text-xl font-bold text-text-primary">
                Understanding Your Authority: What Must You Follow?
              </summary>

              <div className="mt-6 space-y-6">
                {/* Legal Requirements */}
                <div className="rounded-lg border-l-4 border-red-600 bg-red-50 p-5">
                  <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-red-900">
                    🔴 Legal Requirements - You MUST Comply
                  </h4>
                  <ul className="ml-5 list-disc space-y-2 text-sm text-red-800">
                    <li>
                      Controlled drugs: max 1 month (opioids) or max 3 months
                      (e.g. stimulants, benzodiazepines, zopiclone, cannabis preparations)
                    </li>
                    <li>
                      Dispensing limit: 3 months per occasion (6mo for oral
                      contraceptives)
                    </li>
                    <li>First dispensing within 3 months of prescription date</li>
                    <li>Special Authority must be valid for funded repeats</li>
                    <li>Prescriber has full discretion on duration (3-12 months)</li>
                  </ul>
                  <p className="mt-3 text-xs text-red-700">
                    Source: Medicines Regulations 2025, Misuse of Drugs Act 1975
                  </p>
                </div>

                {/* Professional Standards */}
                <div className="rounded-lg border-l-4 border-amber-600 bg-amber-50 p-5">
                  <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-amber-900">
                    🟡 Professional Standards - Required for RNZCGP
                    Accreditation
                  </h4>
                  <p className="mb-3 text-sm text-amber-800">
                    If your practice is RNZCGP-accredited (or seeking
                    accreditation):
                  </p>
                  <ul className="ml-5 list-disc space-y-2 text-sm text-amber-800">
                    <li>
                      Documented repeat prescribing policy with clear criteria
                    </li>
                    <li>Annual audits of prescribing activity</li>
                    <li>Audits must differentiate Māori from non-Māori results</li>
                    <li>Minimum annual review for patients on repeat prescriptions</li>
                    <li>
                      Measures to optimise Māori access to repeat prescriptions
                    </li>
                  </ul>
                  <p className="mt-3 text-xs text-amber-700">
                    Source: RNZCGP Foundation Standard 9.1
                  </p>
                </div>

                {/* Clinical Guidance */}
                <div className="rounded-lg border-l-4 border-green-600 bg-green-50 p-5">
                  <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-green-900">
                    🟢 Clinical Guidance - Recommended Best Practice
                  </h4>
                  <p className="mb-3 text-sm text-green-800">
                    RNZCGP and clinical consensus recommend considering:
                  </p>

                  {/* Patient Suitability Checklist */}
                  <details className="mt-4 rounded-lg border border-green-200 bg-white p-4">
                    <summary className="cursor-pointer font-medium text-green-900">
                      Patient Suitability Checklist
                    </summary>
                    <div className="mt-3 space-y-3 text-sm text-green-800">
                      <div>
                        <p className="font-medium">✓ Medication considerations:</p>
                        <ul className="ml-5 list-disc">
                          <li>
                            Does NOT require monitoring more often than annually
                          </li>
                          <li>Not a controlled drug</li>
                          <li>
                            Dose has been stable (RNZCGP patient materials
                            suggest 6+ months)
                          </li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium">✓ Patient considerations:</p>
                        <ul className="ml-5 list-disc">
                          <li>Condition stable and well-controlled</li>
                          <li>Good medication adherence</li>
                          <li>Able to attend annual review (minimum)</li>
                          <li>
                            Age and life stage appropriate (careful consideration
                            for &lt;18, pregnant, 65+)
                          </li>
                          <li>
                            Not polypharmacy requiring more frequent
                            reconciliation
                          </li>
                        </ul>
                      </div>
                      <p className="mt-3 text-xs text-green-700">
                        Note: These are considerations, NOT mandatory criteria.
                        You determine suitability.
                      </p>
                    </div>
                  </details>

                  <p className="mt-4 text-sm text-green-800">
                    <strong>Key principle:</strong> RNZCGP recommended 6 months
                    as safer than 12 months. Prescribing 6 months aligns with
                    professional college guidance.
                  </p>
                  <p className="mt-3 text-xs text-green-700">
                    Source: RNZCGP Position Statement, Healthify, clinical
                    consensus
                  </p>
                </div>

                {/* Your Clinical Decision */}
                <div className="rounded-lg border-l-4 border-blue-600 bg-blue-50 p-5">
                  <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-blue-900">
                    🔵 Your Clinical Decision - Individual Practice Judgment
                  </h4>
                  <p className="mb-3 text-sm text-blue-800">
                    You decide based on individual patient assessment:
                  </p>
                  <ul className="ml-5 list-disc space-y-2 text-sm text-blue-800">
                    <li>Prescription duration (3, 6, 9, or 12 months)</li>
                    <li>
                      Review frequency (may be more frequent than annual minimum)
                    </li>
                    <li>Face-to-face vs telehealth review requirements</li>
                    <li>Documentation approach for your practice</li>
                    <li>Practice-specific medication lists or protocols</li>
                  </ul>
                  <p className="mt-4 text-sm font-medium text-blue-900">
                    When in doubt: choose a shorter duration. You can always
                    extend next time.
                  </p>
                </div>
              </div>
            </details>
          </div>

          {/* Official Resources */}
          <div className="mb-8">
            <details className="rounded-lg border border-border bg-white p-6">
              <summary className="cursor-pointer text-xl font-bold text-text-primary">
                Official Resources & Documentation
              </summary>

              <div className="mt-6 space-y-8">
                {/* Government Resources */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-text-primary">
                    🏛️ Ministry of Health & Te Whatu Ora
                  </h4>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li>
                      <a
                        href="https://static.info.content.health.nz/docs/12-month%20Prescriptions%20Guidance.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        → Official Guidance Document (PDF)
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://vimeo.com/1145818509/2c46853ece?fl=pl&fe=sh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        → Prescriber Webinar (Vimeo)
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.health.govt.nz/strategies-initiatives/programmes-and-initiatives/primary-and-community-health-care/increasing-prescribing-lengths"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        → Ministry of Health Policy Page
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Patient Information */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-text-primary">
                    📄 Patient Information Resources
                  </h4>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li>
                      <a
                        href="https://healthed.govt.nz/products/changes-to-your-prescription-length"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        → HealthEd Patient Leaflet
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://healthify.nz/medicines-a-z/p/12-month-prescriptions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        → Healthify Patient Guide
                      </a>
                    </li>
                  </ul>
                </div>

                {/* RNZCGP */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-text-primary">
                    ⚕️ RNZCGP Guidance & Standards
                  </h4>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li>
                      <a
                        href="https://www.rnzcgp.org.nz/our-voice/hot-topics/12-month-prescriptions/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        → RNZCGP 12-Month Prescriptions Hub
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.rnzcgp.org.nz/running-a-practice/the-foundation-standard/whakahau-rongoa-medicines-management/91-repeat-prescribing/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        → Foundation Standard 9.1 (Repeat Prescribing)
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.rnzcgp.org.nz/documents/651/12-month_prescription_poster_FINAL_2.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        → Patient Information Poster (PDF)
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.rnzcgp.org.nz/documents/657/12-month-prescribing-position-statement-NOV-2025.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        → RNZCGP Position Statement (November 2025)
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Pharmac */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-text-primary">
                    💊 Pharmac Schedule Rules
                  </h4>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li>
                      <a
                        href="https://www.pharmac.govt.nz/medicine-funding-and-supply/what-you-need-to-know-about-medicines/12-month-prescriptions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        → Pharmac 12-Month Prescriptions Information
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </details>
          </div>

        </div>
      </section>

      <section className="bg-surface px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-3xl font-bold text-text-primary">
            Updates & Version History
          </h2>

          <div className="mb-8 rounded-lg border border-border bg-white p-6">
            <div className="mb-3 flex items-center gap-3">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                v1.0
              </span>
              <span className="text-sm text-text-tertiary">February 2026</span>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-text-primary">
              Initial Release
            </h3>
            <p className="text-text-secondary">
              Decision tool and 'policy & guidance' implemented following 12-month prescription policy (1 February 2026).
            </p>
          </div>

          <div className="rounded-lg border border-border bg-white p-6">
            <h3 className="mb-3 text-xl font-semibold text-text-primary">
              Subscribe for Updates
            </h3>
            <p className="mb-4 text-text-secondary">
              Get notified when we update these tools with new evidence, policy changes, or
              PHARMAC Schedule updates.
            </p>
            <form
              className="flex gap-3"
              onSubmit={handleSubscribeSubmit}
            >
              <input
                type="email"
                placeholder="your.email@practice.co.nz"
                value={subscribeEmail}
                onChange={e => setSubscribeEmail(e.target.value)}
                className="flex-1 rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={subscribeStatus === 'loading'}
                aria-invalid={subscribeStatus === 'error'}
                aria-describedby={subscribeMessage ? 'subscribe-message' : undefined}
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-6 py-2 text-white transition-colors hover:bg-primary-dark disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={subscribeStatus === 'loading'}
              >
                {subscribeStatus === 'loading' ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
            {(subscribeMessage || subscribeStatus === 'success') && (
              <p
                id="subscribe-message"
                className={`mt-2 text-sm ${subscribeStatus === 'error' ? 'text-red-600' : subscribeStatus === 'success' ? 'font-medium text-green-700' : 'text-text-secondary'}`}
                role={subscribeStatus === 'error' ? 'alert' : subscribeStatus === 'success' ? 'status' : undefined}
              >
                {subscribeStatus === 'success' ? "Thanks, we'll notify you when we update the tools." : subscribeMessage}
              </p>
            )}
            <p className="mt-2 text-xs text-text-tertiary">
              No spam. Updates only when tools change (usually 1-2 times per year).
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-background py-12 text-center">
        <Container size="md">
          <p className="mb-2 font-medium text-text-primary">Questions?</p>
          <a
            href="mailto:ryo@clinicpro.co.nz"
            className="rounded font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            ryo@clinicpro.co.nz
          </a>
          <div className="mt-6 text-sm text-text-secondary">
            <Link href="/contact" className="transition-colors hover:text-text-primary">
              Work with me
            </Link>
            <span className="mx-2">|</span>
            <Link href="/terms" className="transition-colors hover:text-text-primary">
              Terms
            </Link>
            <span className="mx-2">|</span>
            <Link href="/privacy" className="transition-colors hover:text-text-primary">
              Privacy
            </Link>
          </div>
          <p className="mt-4 text-sm text-text-secondary">
            Built in Auckland, NZ
            <br />
            © 2026 ClinicPro
          </p>
        </Container>
      </footer>
    </div>
  );
}
