'use client';

import Link from 'next/link';
import { useState } from 'react';

import {
  DecisionWizard,
  InteractiveFlowchart,
  TrafficLightModal,
  TrafficLightPanel,
} from '@/src/features/12-month-prescriptions';
import { Container } from '@/src/shared/components/layout/Container';

export default function TwelveMonthRxPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSection, setModalSection] = useState<'green' | 'amber' | 'red' | null>(null);
  const [activeTab, setActiveTab] = useState<'wizard' | 'flowchart'>('wizard');

  const scrollToFlowchart = () => {
    setActiveTab('wizard');
    document.querySelector('#flowchart')?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  const openChecker = (section?: 'green' | 'amber' | 'red') => {
    setModalSection(section ?? null);
    setModalOpen(true);
  };

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
            <button
              type="button"
              onClick={scrollToFlowchart}
              className="rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Start Decision Tool ↓
            </button>

            <button
              type="button"
              onClick={() => openChecker()}
              className="rounded-lg border border-border bg-white px-6 py-3 font-medium text-text-primary transition-colors hover:bg-surface"
            >
              Open Medication Checker
            </button>
          </div>
        </div>
      </section>

      <section className="bg-surface px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <details className="quick-start-details rounded-lg border border-border bg-white">
            <summary className="cursor-pointer list-none p-6 text-2xl font-bold text-text-primary [&::-webkit-details-marker]:hidden">
              Quick Start
            </summary>
            <div className="border-t border-border px-6 pb-6 pt-2">
          <details className="mb-6 rounded-lg border border-border bg-white p-6">
            <summary className="cursor-pointer text-lg font-semibold">
              New to 12-month prescriptions?
            </summary>
            <div className="mt-4 space-y-3 text-text-secondary">
              <p className="font-medium text-text-primary">
                From 1 February 2026, you can prescribe up to 12 months (previously 3 months).
              </p>

              <p>
                <strong>Key point:</strong>
{' '}
The law gives YOU full clinical discretion.
                There are NO mandatory eligibility criteria—no required &quot;6 months stable,&quot;
                no age exclusions, no forced 12-month duration.
              </p>

              <p>
                <strong>What you must know:</strong>
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>Controlled drugs still max 1-3 months (legal)</li>
                <li>Patients collect 3-month supplies from same pharmacy</li>
                <li>One $5 co-payment for the year</li>
                <li>You can still prescribe 3, 6, or 9 months—your call</li>
              </ul>

              <Link
                href="/12-month-prescriptions/guide"
                className="mt-2 inline-block font-medium text-primary hover:underline"
              >
                → Read full guide (legal vs guidance, RNZCGP standards, equity considerations)
              </Link>
            </div>
          </details>

          <details className="mb-6 rounded-lg border border-border bg-white p-6">
            <summary className="cursor-pointer text-lg font-semibold">
              5 things you need to know
            </summary>
            <div className="mt-4 space-y-3 text-text-secondary">
              <ol className="list-inside list-decimal space-y-2">
                <li>
                  <strong>The law is permissive, not prescriptive:</strong>
{' '}
You CAN prescribe
                  12 months; you&apos;re not required to.
                </li>
                <li>
                  <strong>RNZCGP opposed this policy:</strong>
{' '}
They recommended 6 months as safer.
                  Their guidance reflects caution.
                </li>
                <li>
                  <strong>Accreditation has requirements:</strong>
{' '}
If you&apos;re RNZCGP-accredited,
                  you must have policy, audits, and equity measures.
                </li>
                <li>
                  <strong>Clinical judgment is paramount:</strong>
{' '}
You determine what&apos;s
                  appropriate for each patient.
                </li>
                <li>
                  <strong>Six months is completely acceptable:</strong>
{' '}
Despite the policy
                  being called &quot;12-month prescriptions,&quot; prescribing for 6 months aligns
                  with RNZCGP&apos;s position and is often safer.
                </li>
              </ol>
            </div>
          </details>

          <details className="mb-6 rounded-lg border border-border bg-white p-6">
            <summary className="cursor-pointer text-lg font-semibold">
              Legal requirements vs guidance
            </summary>
            <div className="mt-4 space-y-6 text-text-secondary">
              <div className="space-y-3">
                <div className="border-l-4 border-red-500 py-2 pl-4">
                  <p className="font-semibold text-text-primary">🔴 LEGAL REQUIREMENTS (MUST COMPLY)</p>
                  <p className="text-sm">You have no discretion - these are legally binding</p>
                </div>
                <div className="ml-4 text-text-tertiary">↓</div>
                <div className="border-l-4 border-amber-500 py-2 pl-4">
                  <p className="font-semibold text-text-primary">🟡 PROFESSIONAL STANDARDS (ACCREDITATION)</p>
                  <p className="text-sm">Mandatory if your practice is RNZCGP-accredited</p>
                </div>
                <div className="ml-4 text-text-tertiary">↓</div>
                <div className="border-l-4 border-green-500 py-2 pl-4">
                  <p className="font-semibold text-text-primary">🟢 PROFESSIONAL GUIDANCE (RECOMMENDED)</p>
                  <p className="text-sm">Best practice recommendations - you have discretion</p>
                </div>
                <div className="ml-4 text-text-tertiary">↓</div>
                <div className="border-l-4 border-blue-500 py-2 pl-4">
                  <p className="font-semibold text-text-primary">🔵 PRACTICE DECISIONS</p>
                  <p className="text-sm">Your practice determines implementation details</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="mb-3 font-semibold text-text-primary">🔴 Legal Requirements</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">What the Law Says</th>
                        <th className="px-3 py-2 text-left">What This Means for You</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-3 py-2">Prescriptions may be written for up to 12 months</td>
                        <td className="px-3 py-2">You CAN prescribe 12 months, but you&apos;re not required to</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Dispensing limited to 3 months per occasion</td>
                        <td className="px-3 py-2">Patients collect 3-month supplies every 3 months from pharmacy</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Controlled drugs excluded (Class B: max 1 month; Class C: max 3 months)</td>
                        <td className="px-3 py-2">Morphine, methylphenidate, tramadol, benzodiazepines cannot be prescribed for 12 months</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">One co-payment when patient first collects medicine</td>
                        <td className="px-3 py-2">Patient pays $5 once, not quarterly</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-sm font-medium">
                  Critical: The law gives YOU full clinical discretion. No mandatory eligibility criteria exist.
                </p>
              </div>

              <div className="mt-6">
                <h4 className="mb-3 font-semibold text-text-primary">🟡 Professional Standards (RNZCGP Accredited Practices)</h4>
                <ul className="list-inside list-disc space-y-2">
                  <li>Documented repeat prescribing policy</li>
                  <li>Annual audits with Māori/non-Māori differentiation</li>
                  <li>Minimum annual review for patients on 12-month prescriptions</li>
                  <li>Measures to optimise Māori access</li>
                </ul>
              </div>

              <div className="mt-6">
                <h4 className="mb-3 font-semibold text-text-primary">🟢 Professional Guidance (Your Discretion)</h4>
                <ul className="list-inside list-disc space-y-2">
                  <li>&quot;6 months stable&quot; - suggested timeframe, you can use different criteria</li>
                  <li>Age 65+ - consideration, not exclusion</li>
                  <li>Polypharmacy - consider shorter intervals, not mandatory</li>
                </ul>
              </div>

              <Link
                href="/12-month-prescriptions/guide#source-authority"
                className="mt-4 inline-block font-medium text-primary hover:underline"
              >
                → See full tier breakdown with examples
              </Link>
            </div>
          </details>

          <details className="mb-6 rounded-lg border border-border bg-white p-6">
            <summary className="cursor-pointer text-lg font-semibold">
              Quick decision checklist
            </summary>
            <div className="mt-4 space-y-4 text-text-secondary">
              <div>
                <h4 className="mb-2 font-semibold text-text-primary">🔴 Legal Requirements</h4>
                <ul className="space-y-1 text-sm">
                  <li>☐ Is this a controlled drug? (If yes → max 1-3 months)</li>
                  <li>☐ Special Authority will remain valid for full 12 months?</li>
                  <li>☐ Patient understands 3-month collections from same pharmacy?</li>
                </ul>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-text-primary">🟡 Professional Standards (if accredited)</h4>
                <ul className="space-y-1 text-sm">
                  <li>☐ Meets our practice&apos;s documented criteria?</li>
                  <li>☐ Annual review planned/booked?</li>
                  <li>☐ Clinical rationale documented?</li>
                </ul>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-text-primary">🟢 Clinical Judgment</h4>
                <ul className="space-y-1 text-sm">
                  <li>☐ Condition stable? (you define timeframe)</li>
                  <li>☐ Medication requires regular monitoring? (bloods, ECG, etc.)</li>
                  <li>☐ Patient in higher-risk group? (age, polypharmacy, unstable)</li>
                  <li>☐ Patient will attend annual review?</li>
                </ul>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-text-primary">🔵 Equity Considerations</h4>
                <ul className="space-y-1 text-sm">
                  <li>☐ Considered barriers to access for this patient?</li>
                  <li>☐ Will 12 months improve or hinder medication access?</li>
                </ul>
              </div>
            </div>
          </details>
            </div>
          </details>
        </div>
      </section>

      <section
        id="flowchart"
        className="scroll-mt-20 bg-white px-6 py-16"
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-3xl font-bold text-text-primary">
            Decision Support Tools
          </h2>

          <div className="mb-8 flex gap-4 border-b border-border">
            <button
              type="button"
              onClick={() => setActiveTab('wizard')}
              className={`border-b-2 px-6 py-3 font-medium transition-colors ${
                activeTab === 'wizard'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Interactive Decision Tool
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('flowchart')}
              className={`border-b-2 px-6 py-3 font-medium transition-colors ${
                activeTab === 'flowchart'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Visual Flowchart
            </button>
          </div>

          {activeTab === 'wizard' && (
            <div>
              <DecisionWizard onOpenChecker={openChecker} />
            </div>
          )}

          {activeTab === 'flowchart' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="h-[800px]">
                <InteractiveFlowchart onOpenChecker={openChecker} />
              </div>
              <div className="h-[800px]">
                <TrafficLightPanel />
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-3xl font-bold text-text-primary">
            Evidence & Resources
          </h2>

          <div className="mb-8">
            <h3 className="mb-4 text-2xl font-semibold text-text-primary">
              BPAC Guidance
            </h3>
            <ul className="space-y-3 text-text-secondary">
              <li>
                <a
                  href="https://bpac.org.nz/2021/gout.aspx"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  → Gout management (allopurinol, colchicine dosing)
                </a>
              </li>
              <li>
                <a
                  href="https://bpac.org.nz/2018/triple-whammy.aspx"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  → Triple whammy guidance (NSAIDs + ACEi/ARB + diuretic)
                </a>
              </li>
              <li>
                <a
                  href="https://bpac.org.nz/2021/diabetes.aspx"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  → Diabetes management (metformin, SGLT-2i, sulfonylureas)
                </a>
              </li>
              <li>
                <a
                  href="https://bpac.org.nz/2017/depression.aspx"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  → Depression management (SSRIs/SNRIs guidance)
                </a>
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="mb-4 text-2xl font-semibold text-text-primary">
              RNZCGP Requirements
            </h3>
            <p className="mb-3 text-text-secondary">
              Foundation Standard 9.1 requirements for accredited practices:
            </p>
            <ul className="list-inside list-disc space-y-2 text-text-secondary">
              <li>Documented repeat prescribing policy</li>
              <li>Annual audits with Māori/non-Māori differentiation</li>
              <li>Minimum annual review for patients on 12-month prescriptions</li>
              <li>Measures to optimise Māori access to repeat prescriptions</li>
            </ul>
            <a
              href="https://www.rnzcgp.org.nz/foundation-standard-9-1"
              className="mt-3 inline-block text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              → View Foundation Standard 9.1
            </a>
          </div>

          <div className="mb-8">
            <h3 className="mb-4 text-2xl font-semibold text-text-primary">
              Frequently Asked Questions
            </h3>

            {[
              {
                q: 'Is "6 months stable" mandatory before 12-month prescriptions?',
                a: 'No. This is RNZCGP guidance from patient materials, not a legal requirement. You determine what "stable" means for each patient. Some practices use 3 months, others 9 months. Your clinical judgment.',
              },
              {
                q: 'Can I prescribe less than 12 months?',
                a: 'Yes! 3, 6, or 9 months are completely acceptable. RNZCGP actually recommended 6 months as safer than 12 in their October 2024 submission to MoH.',
              },
              {
                q: 'What about patients over 65?',
                a: 'Age alone is not an exclusion. However, older adults often need closer monitoring (declining renal function, polypharmacy, falls risk). RNZCGP guidance suggests "careful consideration" for 65+, but it\'s your decision based on individual assessment.',
              },
              {
                q: 'Do I need annual review appointments?',
                a: 'If your practice is RNZCGP-accredited: Yes (Foundation Standard 9.1 requirement). If not accredited: Strongly recommended best practice, but not legally mandated.',
              },
              {
                q: 'What if Special Authority expires during the 12 months?',
                a: 'You must renew the Special Authority before further funded repeats can be dispensed. Plan SA renewals when issuing 12-month prescriptions (legal requirement, Pharmac Schedule Rule 2.4.3).',
              },
              {
                q: 'What\'s the "triple whammy" and why does it matter?',
                a: 'NSAID + ACE inhibitor/ARB + diuretic = 30% increased acute kidney injury risk. If patient on ACEi/ARB + diuretic, warn about OTC NSAIDs and consider max 3 months for NSAIDs if unavoidable (see Traffic Light Checker AMBER zone).',
              },
              {
                q: 'Can patients switch pharmacies mid-prescription?',
                a: 'Guidance says "same pharmacy" for 12-month prescriptions. This appears to be a system limitation rather than legal requirement. Practically, switching may cause dispensing issues.',
              },
              {
                q: 'What about equity concerns for Māori patients?',
                a: 'Te Tīriti raised concerns that reducing touchpoints may worsen monitoring gaps for Māori who already face barriers. Consider: Will 12 months improve access (reduce cost/transport) or worsen outcomes (fewer monitoring opportunities)? RNZCGP Standard requires practices to optimise Māori access.',
              },
              {
                q: 'Do I have to issue 12-month prescriptions if patients ask?',
                a: 'No. You have full discretion to issue shorter durations based on clinical judgment. The law permits up to 12 months; it doesn\'t require it.',
              },
              {
                q: 'Where can I find the official legal text?',
                a: 'Medicines (Increasing the Period of Supply) Amendment Regulations 2025 (SL 2025/203). See full guide for detailed source attribution and legal vs guidance distinction.',
              },
            ].map((item, idx) => (
              <details key={idx} className="mb-4 border-b border-border pb-4">
                <summary className="mb-2 cursor-pointer font-semibold hover:text-primary">
                  {item.q}
                </summary>
                <p className="mt-2 text-text-secondary">{item.a}</p>
              </details>
            ))}
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
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                v2.0
              </span>
              <span className="text-sm text-text-tertiary">February 2026</span>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-text-primary">
              Major Update
            </h3>
            <ul className="list-inside list-disc space-y-2 text-text-secondary">
              <li>Added AMBER Zone Quick Screening Table for fast lookup</li>
              <li>Expanded SSRI/SNRI guidance with critical caveats</li>
              <li>Updated DOAC thresholds (CrCl-specific for each drug)</li>
              <li>Added triple whammy monitoring guidance</li>
              <li>Restructured for better usability (traffic light system)</li>
              <li>Added 11 common scenario examples</li>
            </ul>
          </div>

          <div className="mb-8 rounded-lg border border-border bg-white p-6">
            <div className="mb-3 flex items-center gap-3">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                v1.0
              </span>
              <span className="text-sm text-text-tertiary">January 2026</span>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-text-primary">
              Initial Release
            </h3>
            <p className="text-text-secondary">
              First version following 12-month prescription policy implementation (1 February
              2026). Basic flowchart and medication categorisation.
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
              onSubmit={e => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="your.email@practice.co.nz"
                className="flex-1 rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-6 py-2 text-white transition-colors hover:bg-primary-dark"
              >
                Subscribe
              </button>
            </form>
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

      <TrafficLightModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialSection={modalSection}
      />
    </div>
  );
}
