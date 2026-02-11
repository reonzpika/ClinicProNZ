'use client';

import Link from 'next/link';

import { DecisionWizard } from '@/src/features/12-month-prescriptions';
import { Container } from '@/src/shared/components/layout/Container';

export default function TwelveMonthRxPage() {
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
                            diazepam, lorazepam, clonazepam, zopiclone, zolpidem
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
    </div>
  );
}
