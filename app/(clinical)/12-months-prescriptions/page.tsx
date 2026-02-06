'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TrafficLightModal } from './components/TrafficLightModal';
import { FlowchartSteps } from './components/FlowchartSteps';
import { Container } from '@/src/shared/components/layout/Container';

export default function TwelveMonthRxPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSection, setModalSection] = useState<'green' | 'amber' | 'red' | null>(null);

  const scrollToFlowchart = () => {
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
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <Container size="md">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="text-xl font-bold text-text-primary">
              ClinicPro
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/#tools"
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Tools
              </Link>
              <Link
                href="/#story"
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Contact
              </Link>
            </nav>
          </div>
        </Container>
      </header>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-text-primary">
            12-Month Prescription Decision Tools
          </h1>
          <p className="text-xl text-text-secondary mb-8">
            Evidence-based guidance for NZ GPs
          </p>

          <div className="flex gap-4 justify-center flex-wrap mb-6">
            <button
              type="button"
              onClick={scrollToFlowchart}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              View Flowchart ↓
            </button>

            <button
              type="button"
              onClick={() => openChecker()}
              className="px-6 py-3 border border-border bg-white text-text-primary rounded-lg hover:bg-surface transition-colors font-medium"
            >
              Open Medication Checker
            </button>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => openChecker('green')}
              className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-surface transition-colors"
            >
              GREEN
            </button>
            <button
              type="button"
              onClick={() => openChecker('amber')}
              className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-surface transition-colors"
            >
              AMBER
            </button>
            <button
              type="button"
              onClick={() => openChecker('red')}
              className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-surface transition-colors"
            >
              RED
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-surface">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-text-primary">Quick Start</h2>

          <details className="mb-6 bg-white border border-border rounded-lg p-6">
            <summary className="font-semibold text-lg cursor-pointer">
              New to 12-month prescriptions?
            </summary>
            <div className="mt-4 space-y-3 text-text-secondary">
              <p className="font-medium text-text-primary">
                From 1 February 2026, you can prescribe up to 12 months (previously 3 months).
              </p>

              <p>
                <strong>Key point:</strong> The law gives YOU full clinical discretion. There are
                NO mandatory eligibility criteria—no required &quot;6 months stable,&quot; no age
                exclusions, no forced 12-month duration.
              </p>

              <p>
                <strong>What you must know:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Controlled drugs still max 1-3 months (legal)</li>
                <li>Patients collect 3-month supplies from same pharmacy</li>
                <li>One $5 co-payment for the year</li>
                <li>You can still prescribe 3, 6, or 9 months—your call</li>
              </ul>

              <p>
                <strong>The &quot;eligibility criteria&quot; you&apos;ll see?</strong> Professional
                guidance to help you decide—not legal requirements. RNZCGP actually opposed 12
                months and recommended 6 months as safer.
              </p>

              <Link
                href="/12-months-prescriptions/guide"
                className="inline-block mt-2 text-primary hover:underline font-medium"
              >
                → Read full guide (legal vs guidance, RNZCGP standards, equity considerations)
              </Link>
            </div>
          </details>

          <details className="mb-8 bg-white border border-border rounded-lg p-6">
            <summary className="font-semibold text-lg cursor-pointer">
              Which tool do I need?
            </summary>
            <div className="mt-4 space-y-3 text-text-secondary">
              <p>
                <strong>Flowchart:</strong> Step-by-step decision process
              </p>
              <p>
                <strong>Medication Checker:</strong> Specific medication details (zones, criteria,
                monitoring)
              </p>
              <p>
                <strong>Recommended:</strong> Use them together - flowchart guides the process,
                checker provides details
              </p>
            </div>
          </details>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="text-3xl">1</div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-text-primary">
                  Follow the flowchart
                </h3>
                <p className="text-text-secondary">
                  Step-by-step decision process for prescription duration
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-3xl">2</div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-text-primary">
                  Check medication details
                </h3>
                <p className="text-text-secondary">
                  Open the checker to see zone, criteria, and monitoring requirements
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-3xl">3</div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-text-primary">
                  Use together
                </h3>
                <p className="text-text-secondary">
                  Flowchart guides the process, checker provides medication-specific details
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="flowchart"
        className="py-16 px-6 bg-white scroll-mt-20"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-text-primary">
            Decision Flowchart
          </h2>

          <FlowchartSteps />

          <div className="mt-8">
            <button
              type="button"
              className="px-6 py-3 border border-border bg-white text-text-primary rounded-lg hover:bg-surface transition-colors font-medium"
            >
              Download PDF Version (coming soon)
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-surface">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-text-primary">
            Common Scenarios
          </h2>
          <p className="text-text-secondary mb-8">
            Real examples showing how to use the tools. Time estimates included.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 text-text-primary">
                Stable hypertension on amlodipine
              </h3>
              <p className="text-text-secondary mb-3">
                Patient stable 12+ months, BP controlled, no side effects
              </p>
              <p className="text-sm text-green-700 font-medium mb-1">
                ✓ Decision: 12 months OK (GREEN zone)
              </p>
              <p className="text-sm text-text-tertiary">Time: 30 seconds</p>
            </div>

            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 text-text-primary">
                Type 2 diabetes on metformin, eGFR 52
              </h3>
              <p className="text-text-secondary mb-3">
                AMBER zone - need to check renal function criteria
              </p>
              <p className="text-sm text-amber-700 font-medium mb-1">
                ✓ Decision: 12 months OK (eGFR &gt;45)
              </p>
              <p className="text-sm text-text-tertiary">Time: 1-2 minutes</p>
            </div>

            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 text-text-primary">
                Chronic pain on tramadol
              </h3>
              <p className="text-text-secondary mb-3">
                Controlled drug - legal restriction applies
              </p>
              <p className="text-sm text-red-700 font-medium mb-1">
                ✗ Decision: MAX 3 months (Class C controlled)
              </p>
              <p className="text-sm text-text-tertiary">Time: 10 seconds</p>
            </div>

            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 text-text-primary">
                AF on rivaroxaban, age 78, falls risk
              </h3>
              <p className="text-text-secondary mb-3">
                AMBER zone - check CrCl and bleeding risk
              </p>
              <p className="text-sm text-amber-700 font-medium mb-1">
                → Decision: 6 months safer (age &gt;75, falls)
              </p>
              <p className="text-sm text-text-tertiary">Time: 2-3 minutes</p>
            </div>

            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 text-text-primary">
                Depression on sertraline 100mg
              </h3>
              <p className="text-text-secondary mb-3">
                GREEN zone but check caveats: stable 6+ months? Annual discussion?
              </p>
              <p className="text-sm text-green-700 font-medium mb-1">
                ✓ Decision: 12 months OK (if stable, annual review planned)
              </p>
              <p className="text-sm text-text-tertiary">Time: 1 minute</p>
            </div>

            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 text-text-primary">
                ACE inhibitor, eGFR declining (55→48)
              </h3>
              <p className="text-text-secondary mb-3">
                AMBER zone - unstable renal function
              </p>
              <p className="text-sm text-amber-700 font-medium mb-1">
                → Decision: 3-6 months, monitor closely
              </p>
              <p className="text-sm text-text-tertiary">Time: 2 minutes</p>
            </div>

            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 text-text-primary">
                Warfarin for DVT
              </h3>
              <p className="text-text-secondary mb-3">
                RED zone - requires regular INR monitoring
              </p>
              <p className="text-sm text-red-700 font-medium mb-1">
                ✗ Decision: MAX 3 months
              </p>
              <p className="text-sm text-text-tertiary">Time: 10 seconds</p>
            </div>

            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 text-text-primary">
                Polypharmacy: 8 medications, age 72
              </h3>
              <p className="text-text-secondary mb-3">
                Mix of GREEN/AMBER meds - consider shorter interval
              </p>
              <p className="text-sm text-amber-700 font-medium mb-1">
                → Decision: 6 months safer (medication reconciliation)
              </p>
              <p className="text-sm text-text-tertiary">Time: 5 minutes</p>
            </div>

            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 text-text-primary">
                Gliclazide, age 76, lives alone
              </h3>
              <p className="text-text-secondary mb-3">
                AMBER zone - age &gt;70, hypoglycaemia risk
              </p>
              <p className="text-sm text-amber-700 font-medium mb-1">
                → Decision: 6 months (hypo awareness check)
              </p>
              <p className="text-sm text-text-tertiary">Time: 1-2 minutes</p>
            </div>

            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 text-text-primary">
                Empagliflozin for diabetes + HF
              </h3>
              <p className="text-text-secondary mb-3">
                AMBER zone - check eGFR &gt;20, sick day rules explained
              </p>
              <p className="text-sm text-green-700 font-medium mb-1">
                ✓ Decision: 12 months OK (eGFR 65, educated re DKA)
              </p>
              <p className="text-sm text-text-tertiary">Time: 2 minutes</p>
            </div>

            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 text-text-primary">
                Alendronate, eGFR 42
              </h3>
              <p className="text-text-secondary mb-3">
                AMBER zone - check eGFR threshold
              </p>
              <p className="text-sm text-green-700 font-medium mb-1">
                ✓ Decision: 12 months OK (eGFR &gt;35)
              </p>
              <p className="text-sm text-text-tertiary">Time: 1 minute</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-text-primary">
            Evidence & Resources
          </h2>

          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4 text-text-primary">
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
            <h3 className="text-2xl font-semibold mb-4 text-text-primary">
              RNZCGP Requirements
            </h3>
            <p className="text-text-secondary mb-3">
              Foundation Standard 9.1 requirements for accredited practices:
            </p>
            <ul className="space-y-2 text-text-secondary list-disc list-inside">
              <li>Documented repeat prescribing policy</li>
              <li>Annual audits with Māori/non-Māori differentiation</li>
              <li>Minimum annual review for patients on 12-month prescriptions</li>
              <li>Measures to optimise Māori access to repeat prescriptions</li>
            </ul>
            <a
              href="https://www.rnzcgp.org.nz/foundation-standard-9-1"
              className="text-primary hover:underline mt-3 inline-block"
              target="_blank"
              rel="noopener noreferrer"
            >
              → View Foundation Standard 9.1
            </a>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4 text-text-primary">
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
                <summary className="font-semibold cursor-pointer mb-2 hover:text-primary">
                  {item.q}
                </summary>
                <p className="text-text-secondary mt-2">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-surface">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-text-primary">
            Updates & Version History
          </h2>

          <div className="mb-8 bg-white border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                v2.0
              </span>
              <span className="text-text-tertiary text-sm">February 2026</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-text-primary">
              Major Update
            </h3>
            <ul className="space-y-2 text-text-secondary list-disc list-inside">
              <li>Added AMBER Zone Quick Screening Table for fast lookup</li>
              <li>Expanded SSRI/SNRI guidance with critical caveats</li>
              <li>Updated DOAC thresholds (CrCl-specific for each drug)</li>
              <li>Added triple whammy monitoring guidance</li>
              <li>Restructured for better usability (traffic light system)</li>
              <li>Added 11 common scenario examples</li>
            </ul>
          </div>

          <div className="mb-8 bg-white border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                v1.0
              </span>
              <span className="text-text-tertiary text-sm">January 2026</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-text-primary">
              Initial Release
            </h3>
            <p className="text-text-secondary">
              First version following 12-month prescription policy implementation (1 February
              2026). Basic flowchart and medication categorisation.
            </p>
          </div>

          <div className="bg-white border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3 text-text-primary">
              Subscribe for Updates
            </h3>
            <p className="text-text-secondary mb-4">
              Get notified when we update these tools with new evidence, policy changes, or
              PHARMAC Schedule updates.
            </p>
            <form
              className="flex gap-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="your.email@practice.co.nz"
                className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-text-tertiary mt-2">
              No spam. Updates only when tools change (usually 1-2 times per year).
            </p>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-background text-center">
        <Container size="md">
          <p className="text-text-primary font-medium mb-2">Questions?</p>
          <a
            href="mailto:ryo@clinicpro.co.nz"
            className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
          >
            ryo@clinicpro.co.nz
          </a>
          <div className="mt-6 text-text-secondary text-sm">
            <Link href="/contact" className="hover:text-text-primary transition-colors">
              Work with me
            </Link>
            <span className="mx-2">|</span>
            <Link href="/terms" className="hover:text-text-primary transition-colors">
              Terms
            </Link>
            <span className="mx-2">|</span>
            <Link href="/privacy" className="hover:text-text-primary transition-colors">
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
