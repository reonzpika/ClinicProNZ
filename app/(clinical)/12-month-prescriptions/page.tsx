'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { DecisionWizard } from '@/src/features/12-month-prescriptions';
import { Container } from '@/src/shared/components/layout/Container';
import { markNewsletterSubscribed, NewsletterPopup } from '@/src/shared/components/NewsletterPopup';

type SubscribeStatus = 'idle' | 'loading' | 'success' | 'error';

type TocChild = { id: string; label: string };
type TocSection = { id: string; label: string; children: TocChild[] };

const TOC_SECTIONS: TocSection[] = [
  { id: 'checklist', label: 'Decision Tool', children: [] },
  {
    id: 'guidance',
    label: 'Understanding 12-Month Prescriptions',
    children: [
      { id: 'what-changed', label: 'What changed?' },
      { id: 'two-perspectives', label: 'Two perspectives' },
      { id: 'your-authority', label: 'What must you follow?' },
    ],
  },
  {
    id: 'resources',
    label: 'Resources and Downloads',
    children: [
      { id: 'resources-waiting-room', label: 'Waiting room and reception' },
      { id: 'resources-patient', label: 'Patient conversations' },
      { id: 'resources-practice-managers', label: 'Practice managers and policy' },
      { id: 'resources-prescriber', label: 'Prescriber education' },
      { id: 'resources-pharmacy', label: 'Pharmacy liaison' },
    ],
  },
];

const TOC_IDS = [
  'checklist',
  'guidance',
  'what-changed',
  'two-perspectives',
  'your-authority',
  'resources',
  'resources-waiting-room',
  'resources-patient',
  'resources-practice-managers',
  'resources-prescriber',
  'resources-pharmacy',
];

export default function TwelveMonthRxPage() {
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<SubscribeStatus>('idle');
  const [subscribeMessage, setSubscribeMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stickyTocVisible, setStickyTocVisible] = useState(false);
  const [isXlOrLarger, setIsXlOrLarger] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tocAnimationVisible, setTocAnimationVisible] = useState(false);

  const tocShown = isXlOrLarger || stickyTocVisible;

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1280px)');
    function update(e: MediaQueryListEvent | null) {
      setIsXlOrLarger((e ?? mql).matches);
    }
    update(null);
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const el = document.getElementById('guidance');
    if (!el) {
 return;
}
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
 setStickyTocVisible(entry.isIntersecting || entry.boundingClientRect.top < 0);
}
      },
      { rootMargin: '0px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isXlOrLarger) {
      setTocAnimationVisible(true);
      return;
    }
    if (!stickyTocVisible) {
      setTocAnimationVisible(false);
      return;
    }
    const frame = requestAnimationFrame(() => setTocAnimationVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [stickyTocVisible, isXlOrLarger]);

  useEffect(() => {
    const headerOffset = 100;
    function updateActive() {
      const elements = TOC_IDS.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
      if (elements.length === 0) {
 return;
}
      let best: string | null = null;
      let bestTop = -Infinity;
      for (const el of elements) {
        const top = el.getBoundingClientRect().top;
        if (top <= headerOffset && top > bestTop) {
          bestTop = top;
          best = el.id;
        }
      }
      if (best) {
 setActiveId(best);
} else {
        const first = elements.find(el => el.getBoundingClientRect().top > 0) ?? elements[0];
        setActiveId(first?.id ?? null);
      }
    }
    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    return () => window.removeEventListener('scroll', updateActive);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) {
 return;
}
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
 setSidebarOpen(false);
}
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sidebarOpen]);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
 el.scrollIntoView({ behavior: 'smooth' });
}
    setSidebarOpen(false);
  }

  function scrollToSubscribe() {
    const el = document.getElementById('subscribe');
    if (el) {
 el.scrollIntoView({ behavior: 'smooth' });
}
  }

  async function handleSubscribeSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = subscribeEmail.trim();
    if (!email) {
 return;
}
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
        setSubscribeMessage('Thanks, we\'ll notify you when we update the tools.');
        setSubscribeEmail('');
        markNewsletterSubscribed('12month');
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
        <Container size="fluid">
          <div className="flex items-center justify-between py-4">
            <div className="flex min-w-0 flex-1 items-center gap-0 lg:flex-initial">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-text-primary transition-colors hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary lg:hidden"
                aria-label="Open contents"
                aria-expanded={sidebarOpen}
              >
                <Menu size={24} aria-hidden />
              </button>
              <Link
                href="/"
                className="text-xl font-bold text-text-primary lg:ml-0"
              >
                ClinicPro
              </Link>
            </div>
          </div>
        </Container>
      </header>

      {/* Sticky TOC: at xl always visible; at lg visible when scrolled to/past #guidance */}
      {tocShown && (
        <aside
          className={`fixed bottom-0 left-0 top-14 z-40 hidden w-60 bg-white py-6 pl-6 pr-4 lg:block ${!isXlOrLarger ? 'transition-all duration-300 ease-out ' : ''}${
            isXlOrLarger || tocAnimationVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
          }`}
          aria-label="On this page"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-tertiary">
            On this page
          </h2>
          <nav className="flex flex-col gap-1">
            {TOC_SECTIONS.map(section => (
              <div key={section.id}>
                <a
                  href={`#${section.id}`}
                  className={`block rounded-md py-2 text-sm transition-colors hover:bg-surface hover:text-primary ${
                    activeId === section.id ? 'bg-blue-100 text-primary' : 'text-text-secondary'
                  }`}
                >
                  {section.label}
                </a>
                {section.children.length > 0 && (
                  <div className="ml-2 flex flex-col gap-0.5 border-l border-border pl-3">
                    {section.children.map(child => (
                      <a
                        key={child.id}
                        href={`#${child.id}`}
                        className={`block rounded-md py-1.5 text-sm transition-colors hover:bg-surface hover:text-primary ${
                          activeId === child.id ? 'bg-blue-100 text-primary' : 'text-text-secondary'
                        }`}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>
      )}

      {/* Slide-out drawer (small screens) */}
      {sidebarOpen && (
        <>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 focus:outline-none lg:hidden"
            aria-label="Close contents"
          />
          <div
            className="fixed inset-y-0 left-0 z-50 w-[min(320px,100vw-2rem)] max-w-[85vw] border-r border-border bg-white shadow-lg transition-transform lg:hidden"
            role="dialog"
            aria-label="Contents"
          >
            <div className="flex min-h-[44px] items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-lg font-semibold text-text-primary">Contents</h2>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-text-primary transition-colors hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Close contents"
              >
                <X size={24} aria-hidden />
              </button>
            </div>
            <nav className="flex flex-col p-4">
              {TOC_SECTIONS.map(section => (
                <div key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className={`flex min-h-[44px] items-center rounded-lg py-3 transition-colors hover:bg-surface hover:text-primary ${
                      activeId === section.id ? 'bg-blue-100 text-primary' : 'text-text-secondary'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(section.id);
                    }}
                  >
                    {section.label}
                  </a>
                  {section.children.length > 0 && (
                    <div className="ml-2 flex flex-col border-l border-border pl-3">
                      {section.children.map(child => (
                        <a
                          key={child.id}
                          href={`#${child.id}`}
                          className={`flex min-h-[44px] items-center rounded-lg py-2.5 text-sm transition-colors hover:bg-surface hover:text-primary ${
                            activeId === child.id ? 'bg-blue-100 text-primary' : 'text-text-secondary'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            scrollToSection(child.id);
                          }}
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="mt-4 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => {
                    scrollToSubscribe();
                    setSidebarOpen(false);
                  }}
                  className="flex min-h-[44px] w-full items-center rounded-lg bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
                >
                  Subscribe for updates
                </button>
              </div>
            </nav>
          </div>
        </>
      )}

      <div
        className={`transition-[padding] duration-300 ${tocShown ? 'lg:pl-60' : ''}`}
      >
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-text-primary md:text-5xl">
            12-Month Prescriptions:
            <br />
            Clinical Decision Tools
          </h1>

          <div className="mb-6 flex flex-col items-center gap-3">
            <a
              href="#checklist"
              className="rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Start Decision Tool ↓
            </a>
            <p className="text-sm text-text-secondary">
              <a href="#guidance" className="text-primary hover:underline">
                Guidance
              </a>
              {' · '}
              <a href="#resources" className="text-primary hover:underline">
                Resources
              </a>
            </p>
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
                      <strong>Warfarin</strong>
{' '}
– INR monitoring (weekly to
                      monthly depending on stability)
                    </li>
                    <li>
                      <strong>Lithium</strong>
{' '}
– Levels 3-monthly, renal +
                      thyroid function 3-6 monthly
                    </li>
                    <li>
                      <strong>Digoxin</strong>
{' '}
– Levels + renal function 3-6
                      monthly, ECG annually
                    </li>
                    <li>
                      <strong>Methotrexate</strong>
{' '}
– FBC + LFTs monthly
                      initially, then 2-3 monthly
                    </li>
                    <li>
                      <strong>Azathioprine</strong>
{' '}
– FBC + LFTs monthly
                      initially, then 3-monthly
                    </li>
                    <li>
                      <strong>Amiodarone</strong>
{' '}
– TFTs + LFTs 6-monthly, CXR +
                      ECG annually
                    </li>
                    <li>
                      <strong>Sodium valproate</strong>
{' '}
– LFTs + FBC 6-monthly
                    </li>
                    <li>
                      <strong>Carbamazepine</strong>
{' '}
– FBC + LFTs + Na+
                      6-monthly
                    </li>
                    <li>
                      <strong>Insulin</strong>
{' '}
– Regular dose adjustments needed
                    </li>
                  </ul>
                  <a
                    href="https://nzf.org.nz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    → Check NZF
                  </a>
{' '}
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
                      <strong>Metformin:</strong>
{' '}
eGFR &gt;45 generally 12mo;
                      eGFR 30-45 max 6mo; eGFR &lt;30 contraindicated.
{' '}
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
                      <strong>ACE Inhibitors / ARBs:</strong>
{' '}
eGFR ≥60 generally
                      12mo; 45-59 consider 6-12mo; 30-44 max 6mo; &lt;30 max
                      3-6mo.
{' '}
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
                      <strong>DOACs:</strong>
{' '}
CrCl ≥50 generally 12mo (varies
                      by drug); CrCl &lt;50 shorter or dose adjust.
{' '}
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
                      <strong>Sulfonylureas:</strong>
{' '}
Age &lt;70 + eGFR &gt;60
                      generally 12mo; age ≥70 or eGFR &lt;60 consider 6mo.
{' '}
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
                      <strong>NSAIDs:</strong>
{' '}
With ACEi/ARB (&quot;double
                      whammy&quot;) max 6mo; with ACEi/ARB + diuretic
                      (&quot;triple whammy&quot;) max 3mo.
{' '}
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
                      <strong>Spironolactone:</strong>
{' '}
MAX 6 months even when
                      stable (K+ monitoring).
{' '}
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
                      <strong>Allopurinol:</strong>
{' '}
eGFR &gt;60 generally 12mo;
                      eGFR &lt;60 consider 6mo.
{' '}
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
                      <strong>Cardiovascular:</strong>
{' '}
Statins, CCBs (amlodipine,
                      felodipine), beta blockers, aspirin (antiplatelet)
                    </li>
                    <li>
                      <strong>Respiratory:</strong>
{' '}
ICS, ICS/LABA, LAMA
                      (tiotropium), salbutamol
                    </li>
                    <li>
                      <strong>Gastrointestinal:</strong>
{' '}
PPIs (omeprazole,
                      esomeprazole)
                    </li>
                    <li>
                      <strong>Hormonal:</strong>
{' '}
Oral contraceptives (annual BP),
                      levothyroxine (if dose stable)
                    </li>
                    <li>
                      <strong>Mental health:</strong>
{' '}
SSRIs/SNRIs (annual
                      discussion about ongoing need), mirtazapine
                    </li>
                    <li>
                      <strong>Diabetes:</strong>
{' '}
DPP-4 inhibitors (vildagliptin,
                      sitagliptin)
                    </li>
                    <li>
                      <strong>Other:</strong>
{' '}
Calcium + Vitamin D, montelukast
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
                  </a>
{' '}
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
                <strong>Disclaimer:</strong>
{' '}
This medication reference is for
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
          <div id="what-changed" className="mb-8 scroll-mt-20 rounded-lg border border-border bg-surface p-6">
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
          <div id="two-perspectives" className="mb-8 scroll-mt-20">
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
              <strong>You have full clinical discretion</strong>
{' '}
to prescribe 3,
              6, 9, or 12 months based on individual patient assessment.
            </p>
          </div>

          {/* Authority Hierarchy - Collapsible */}
          <div id="your-authority" className="mb-8 scroll-mt-20">
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
                    <strong>Key principle:</strong>
{' '}
RNZCGP recommended 6 months
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

          {/* Resources & Downloads */}
          <div id="resources" className="mb-8 scroll-mt-20">
            <h3 className="mb-2 text-2xl font-semibold text-text-primary">
              Resources & Downloads
            </h3>
            <p className="mb-6 text-sm text-text-secondary">
              Organised by how you&apos;ll use them. Print the waiting room materials, hand patients the FAQ, and use the practice manager section for policy and audit work.
            </p>

            {/* Waiting Room & Reception */}
            <details id="resources-waiting-room" open className="mb-4 scroll-mt-20 rounded-lg border border-border bg-white p-6">
              <summary className="cursor-pointer text-lg font-bold text-text-primary">
                📌 Waiting Room & Reception
              </summary>
              <p className="mb-4 mt-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Print and display
              </p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <a
                    href="https://healthed.govt.nz/products/changes-to-your-prescription-length-poster-he2964"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → HealthEd A4 poster (HE2964)
                  </a>
                  {' '}
<span className="text-text-tertiary">— Official government-branded poster</span>
                </li>
                <li>
                  <a
                    href="https://healthed.govt.nz/products/changes-to-your-prescription-length"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → HealthEd A5 patient flyer
                  </a>
                  {' '}
<span className="text-text-tertiary">— Take-home flyer for patients</span>
                </li>
                <li>
                  <a
                    href="https://www.rnzcgp.org.nz/documents/651/12-month_prescription_poster_FINAL_2.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → RNZCGP patient poster (PDF)
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.pinnaclepractices.co.nz/assets/Resource-files/12-month-prescriptions-poster.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → Pinnacle practice poster (PDF, 4.8 MB)
                  </a>
                  {' '}
<span className="text-text-tertiary">— Alternative design</span>
                </li>
              </ul>
            </details>

            {/* Patient Conversations */}
            <details id="resources-patient" className="mb-4 scroll-mt-20 rounded-lg border border-border bg-white p-6">
              <summary className="cursor-pointer text-lg font-bold text-text-primary">
                💬 Patient Conversations
              </summary>
              <p className="mb-4 mt-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Share during consultations or via patient portal
              </p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <a
                    href="https://www.rnzcgp.org.nz/documents/650/12-month_prescription_changes_FAQs_FINAL_2.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → RNZCGP patient FAQ sheet (PDF)
                  </a>
                  {' '}
<span className="text-text-tertiary">— Printable handout</span>
                </li>
                <li>
                  <a
                    href="https://healthed.govt.nz/products/changes-to-your-prescription-length"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → HealthEd patient flyer
                  </a>
                  {' '}
<span className="text-text-tertiary">— Take-home</span>
                </li>
                <li>
                  <a
                    href="https://healthify.nz/medicines-a-z/p/12-month-prescriptions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → Healthify patient guide
                  </a>
                  {' '}
<span className="text-text-tertiary">— Link for portal or email to patients</span>
                </li>
              </ul>
            </details>

            {/* Practice Managers & Policy */}
            <details id="resources-practice-managers" className="mb-4 scroll-mt-20 rounded-lg border border-border bg-white p-6">
              <summary className="cursor-pointer text-lg font-bold text-text-primary">
                📋 Practice Managers & Policy
              </summary>
              <p className="mb-4 mt-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Policy, audit, and accreditation
              </p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <a
                    href="https://www.rnzcgp.org.nz/gpdocs/New-website/Quality/Webinar---indicators-24-and-32/Repeat-Prescribing-policy.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → RNZCGP sample repeat prescribing policy (PDF)
                  </a>
                  {' '}
<span className="text-text-tertiary">— 2018 version; needs updating for 12-month context</span>
                </li>
                <li>
                  <a
                    href="https://www.rnzcgp.org.nz/documents/232/Audit_of_Repeat_Prescribing_Policy_sample_template.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → RNZCGP repeat prescribing audit template (PDF)
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.rnzcgp.org.nz/running-a-practice/the-foundation-standard/whakahau-rongoa-medicines-management/91-repeat-prescribing/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → Foundation Standard 9.1: Repeat Prescribing
                  </a>
                  {' '}
<span className="text-text-tertiary">— Updated November 2025</span>
                </li>
                <li>
                  <span className="text-text-primary">
                    Dr Jo Scott-Jones practice pack
                  </span>
                  {' '}
<span className="text-text-tertiary">
— Draft policy, consent form, and patient leaflet. Email
{' '}
                    <a
                      href="mailto:Sarah.Wotherspoon@pinnacle.health.nz"
                      className="text-primary hover:underline"
                    >
                      Sarah.Wotherspoon@pinnacle.health.nz
                    </a>
                    {' '}
to request.
</span>
                </li>
              </ul>
            </details>

            {/* Prescriber Education */}
            <details id="resources-prescriber" className="mb-4 scroll-mt-20 rounded-lg border border-border bg-white p-6">
              <summary className="cursor-pointer text-lg font-bold text-text-primary">
                🎓 Prescriber Education
              </summary>
              <p className="mb-4 mt-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Webinars, guidance, and position statements
              </p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <a
                    href="https://vimeo.com/1145818509/2c46853ece?fl=pl&fe=sh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → Health NZ prescriber webinar (Vimeo)
                  </a>
                </li>
                <li>
                  <a
                    href="https://static.info.content.health.nz/docs/12-month%20Prescriptions%20Guidance.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → Health NZ official guidance (PDF)
                  </a>
                </li>
                <li>
                  <a
                    href="https://youtu.be/FCVV39xPIks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → Pinnacle webinar recording (YouTube)
                  </a>
                  {' '}
+
{' '}
                  <a
                    href="https://www.pinnaclepractices.co.nz/assets/Resource-files/12-Month-Prescribing-Webinar-Presentation.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    slides (PDF)
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.procare.co.nz/media/4034/prescription-webinar-final.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → ProCare webinar slides (PDF)
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.rnzcgp.org.nz/documents/657/12-month-prescribing-position-statement-NOV-2025.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → RNZCGP position statement (November 2025, PDF)
                  </a>
                </li>
              </ul>
            </details>

            {/* Pharmacy Liaison */}
            <details id="resources-pharmacy" className="mb-4 scroll-mt-20 rounded-lg border border-border bg-white p-6">
              <summary className="cursor-pointer text-lg font-bold text-text-primary">
                💊 Pharmacy Liaison
              </summary>
              <p className="mb-4 mt-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Share with your dispensing pharmacy
              </p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <a
                    href="https://vimeo.com/1156619626/955c0b7da6?share=copy&fl=sv&fe=ci"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → Health NZ pharmacist webinar (Vimeo)
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.pinnaclepractices.co.nz/assets/Resource-files/Core-regulatory-and-dispensing-rules.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → Pinnacle core regulatory & dispensing rules one-pager (PDF)
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.pharmac.govt.nz/news-and-resources/consultations-and-decisions/2025-10-decision-on-changes-to-support-increased-prescription-lengths"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → Pharmac Schedule Rule changes
                  </a>
                </li>
              </ul>
            </details>
          </div>

        </div>
      </section>

      <section id="subscribe" className="scroll-mt-20 bg-surface px-6 py-16">
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

          <div className="mb-8 rounded-lg border border-border bg-white p-6">
            <div className="mb-3 flex items-center gap-3">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                v1.1
              </span>
              <span className="text-sm text-text-tertiary">February 2026</span>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-text-primary">
              Resources section reorganised by use case
            </h3>
            <p className="text-text-secondary">
              Waiting room, patient conversations, practice managers, prescriber education, pharmacy liaison. Added 15+ new resources including Health NZ pharmacist webinar, HealthEd A4 poster, Pinnacle webinar recording and slides, ProCare webinar slides, RNZCGP audit template, RNZCGP sample policy, and Dr Jo Scott-Jones practice pack.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-white p-6">
            <h3 className="mb-3 text-xl font-semibold text-text-primary">
              Subscribe for Updates
            </h3>
            <p className="mb-4 text-text-secondary">
              Get notified when we add new features and updates.
            </p>
            <form
              className="flex flex-col gap-3 sm:flex-row"
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
                className="w-full rounded-lg bg-primary px-6 py-2 text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
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
                {subscribeStatus === 'success' ? 'Thanks, we\'ll notify you when we update the tools.' : subscribeMessage}
              </p>
            )}
            <p className="mt-2 text-xs text-text-tertiary">
              No spam. Updates only when tools change (usually 1-2 times per year).
            </p>
          </div>
        </div>
      </section>
      </div>

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
      <NewsletterPopup
        storageKey="12month"
        subscribeEndpoint="/api/12-month-prescriptions/subscribe"
        title="Subscribe for updates"
        description="Get notified when we add new features and updates."
        successMessage="Thanks, we'll notify you when we update the tools."
        submitLabel="Subscribe"
      />
    </div>
  );
}
