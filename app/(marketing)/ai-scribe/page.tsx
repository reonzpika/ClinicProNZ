'use client';

import Image from 'next/image';
import Link from 'next/link';

const SIGNUP_URL = '/auth/register?redirect_url=%2Fai-scribe%2Fthank-you';

const sections = [
  { id: 'story', label: "Dr. Ryo's Story" },
  { id: 'ai-scribe', label: 'AI Scribe' },
  { id: 'feature-image', label: 'Clinical Image' },
  { id: 'feature-chat', label: 'Search/Chat' },
  { id: 'start', label: 'Start Today' },
];

const navItems = sections.filter((s) => s.id !== 'start');

function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (element) element.scrollIntoView({ behavior: 'smooth' });
}

export default function AiScribeLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-text-primary hover:opacity-90">
              ClinicPro
            </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden sm:flex items-center gap-2">
              {navItems.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className="whitespace-nowrap px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  {section.label}
                </button>
              ))}
            </nav>
            <Link
              href={SIGNUP_URL}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors inline-block text-sm font-medium"
            >
              Sign up to show interest
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section id="hero" className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-text-tertiary text-sm mb-4">Built by a practising NZ GP</p>
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
                AI scribe for NZ GPs
              </h1>
              <p className="text-xl font-semibold text-text-secondary mb-3">and more...</p>
              <p className="text-lg text-text-secondary mb-4 max-w-2xl mx-auto">
                Handle complex, multi‑problem consults with ease:
              </p>
              <ul className="text-left list-disc space-y-2 max-w-md mx-auto mb-8 text-text-secondary">
                <li>Capture by audio; add typed input when needed</li>
                <li>Get structured notes in seconds — finish on time</li>
                <li>Upload and resize clinical images during the consult</li>
                <li>AI Chat: get answers fast from trusted resources</li>
              </ul>
            </div>
            <div className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/landing-page/hero-image.png"
                alt="ClinicPro AI Medical Scribe Interface"
                width={1200}
                height={675}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>
        </section>

        {/* Story */}
        <section id="story" className="py-16 px-4 bg-surface">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-text-primary mb-6">
                  Thank You for Stopping By
                </h2>
                <div className="rounded-lg bg-white border border-border p-4 mb-6">
                  <h3 className="text-xl font-semibold text-text-primary mb-1">
                    A Message from Dr. Ryo Eguchi
                  </h3>
                  <p className="text-sm text-text-secondary">Practising GP & Founder</p>
                </div>
                <blockquote className="bg-white border-l-4 border-primary rounded-r-lg px-6 py-5 shadow-sm">
                  <p className="text-text-secondary italic mb-4">
                    &quot;Like many GPs, I felt increasingly disconnected from why I became a
                    doctor. The constant rush, endless admin, and pressure were taking their toll
                    — on me and my patients.
                  </p>
                  <p className="text-text-secondary italic">
                    Then I discovered my ikigai: combining my medical expertise with my deep passion
                    for AI and automation. ClinicPro was born from this vision — using smart
                    technology to give GPs back their time, reduce burnout, and restore the joy in
                    patient care.&quot;
                  </p>
                </blockquote>
              </div>
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative w-full max-w-md aspect-square overflow-hidden rounded-xl border border-border shadow-lg">
                  <Image
                    src="/images/landing-page/DrRyoEguchiProfilePicMain.jpg"
                    alt="Dr. Ryo Eguchi - Founder of ClinicPro"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 500px"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section id="mission" className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-text-primary mb-6">
              Mission: Help GPs leave work on time
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              ClinicPro empowers New Zealand GPs to reclaim time and clinical focus by automating
              notes, simplifying referrals and surfacing trusted NZ guidance — all while keeping
              clinicians in control.
            </p>
          </div>
        </section>

        {/* AI Scribe */}
        <section id="ai-scribe" className="py-16 px-4 bg-surface">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-text-primary mb-2">AI Scribe</h2>
            <p className="text-lg text-text-secondary mb-12">
              Capture the consult efficiently. Get structured notes fast
            </p>

            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16 mb-16">
              <div className="lg:col-span-5">
                <h3 className="text-2xl font-bold text-text-primary mb-4">
                  End the Speed vs Quality Dilemma
                </h3>
                <p className="text-text-secondary mb-4">
                  Most GPs battle speed versus quality: detailed notes take longer; brief notes keep
                  you on time but miss key information. ClinicPro ends this dilemma — clear,
                  structured notes without after‑hours admin.
                </p>
                <p className="text-text-secondary mb-6">
                  ClinicPro&apos;s audio recording captures the subjective; spoken objectives are
                  included. Type objective findings (exam, assessment/Dx, plan) as needed for more
                  control and accuracy — you&apos;re in charge.
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li>• Record on mobile or desktop</li>
                  <li>• Mark problems as you go (multi‑problem ready)</li>
                  <li>• Switch templates anytime</li>
                </ul>
              </div>
              <div className="lg:col-span-7">
                <div className="rounded-xl border border-border bg-white overflow-hidden shadow-md">
                  <img
                    src="/images/landing-page/ClinicProConsultation.jpg"
                    alt="Consultation screen showing recording, additional note input, and template switcher"
                    loading="lazy"
                    decoding="async"
                    className="block w-full h-auto object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16 mb-12">
              <div className="order-2 lg:order-1 lg:col-span-7">
                <div className="rounded-xl border border-border bg-white overflow-hidden shadow-md">
                  <img
                    src="/images/landing-page/ClinicProGenerateNote.jpg"
                    alt="Generated note with editable sections"
                    loading="lazy"
                    decoding="async"
                    className="block w-full h-auto object-contain"
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2 lg:col-span-5">
                <h3 className="text-2xl font-bold text-text-primary mb-4">
                  Review and edit your note
                </h3>
                <p className="text-text-secondary mb-6">
                  Clean, structured note — you are in charge. Review and edit quickly.
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li>• Default template handles most consults; multi‑problem ready</li>
                  <li>• Switch output style (template) when needed</li>
                  <li>
                    • Highly customisable templates: NZTA driver licence (NZTA‑aligned), ACC
                    consult, 6‑week baby check
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-6 mb-12">
              <h4 className="text-xl font-semibold text-text-primary text-center mb-6">
                How it works
              </h4>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  'Start recording (mobile or desktop)',
                  'Speak naturally; focus on the patient and history',
                  'Dictate or type in objectives (problems, exam findings, assessment, plan, etc)',
                  'Review structured draft, make quick edits, finish',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {i + 1}
                    </div>
                    <p className="text-text-secondary text-sm pt-2">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Link
                href={SIGNUP_URL}
                className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
              >
                Sign up to show interest
              </Link>
            </div>
          </div>
        </section>

        {/* Clinical Image */}
        <section id="feature-image" className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-text-primary mb-2">Clinical Image</h2>
            <p className="text-lg text-text-secondary mb-12">
              Snap on mobile. Resize automatically.
            </p>

            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16 mb-12">
              <div className="lg:col-span-8">
                <h3 className="text-2xl font-bold text-text-primary mb-4">Why use this</h3>
                <p className="text-text-secondary mb-6">
                  Upload from your phone without saving to your personal gallery. Images are
                  auto‑resized for referrals and ready on your desktop.
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li>• Upload from mobile via QR or link</li>
                  <li>• Not saved on GP&apos;s personal phone</li>
                  <li>• Auto‑resize to referral‑friendly size</li>
                  <li>• Ready to download on desktop and attach to PMS/referral</li>
                  <li>• Also supports desktop upload when you&apos;re at your computer</li>
                </ul>
              </div>
              <div className="lg:col-span-4 flex justify-center lg:justify-end">
                <div className="w-full max-w-[280px] rounded-xl border border-border bg-white overflow-hidden shadow-md">
                  <img
                    src="/images/landing-page/mobile_recording_page"
                    alt="Mobile upload with auto-resize and desktop availability"
                    loading="lazy"
                    decoding="async"
                    className="block w-full h-auto object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-6">
              <h4 className="text-xl font-semibold text-text-primary text-center mb-6">
                How it works
              </h4>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  'Open on mobile via QR (or on desktop)',
                  'Take or upload a photo',
                  'Auto‑resized to referral‑friendly size',
                  'Download on desktop and attach to PMS/referral',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {i + 1}
                    </div>
                    <p className="text-text-secondary text-sm pt-2">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Search & Chat */}
        <section id="feature-chat" className="py-16 px-4 bg-surface">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-text-primary mb-2">Search & Chat</h2>
            <p className="text-lg text-text-secondary mb-12">
              Trusted NZ resources at your fingertips
            </p>

            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16 mb-12">
              <div className="lg:col-span-5">
                <h3 className="text-2xl font-bold text-text-primary mb-3">What you can ask</h3>
                <p className="text-text-secondary mb-3">
                  Search NZ resources in one place — like Google, but for GPs. Get trusted references
                  fast, and ask follow‑up questions to refine.
                </p>
                <ul className="space-y-2 text-text-secondary mb-3">
                  <li>• General health/disease questions</li>
                  <li>• Referral info (where/when/how)</li>
                  <li>• Patient info (Healthify)</li>
                  <li>• Drug info (NZ Formulary)</li>
                </ul>
                <p className="text-sm text-text-tertiary">
                  Not intended for clinical judgement or decision‑making. Verify with the cited
                  sources.
                </p>
              </div>
              <div className="lg:col-span-7">
                <div className="rounded-xl border border-border bg-white overflow-hidden shadow-md">
                  <img
                    src="/images/landing-page/ClinicProChat.jpg"
                    alt="Chat UI showing an answer with Healthify and NZ Formulary references"
                    loading="lazy"
                    decoding="async"
                    className="block w-full h-auto object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-6">
              <h4 className="text-xl font-semibold text-text-primary text-center mb-6">
                How it works
              </h4>
              <div className="grid gap-6 sm:grid-cols-3">
                {[
                  'Type keywords or a question',
                  'Get a concise answer with NZ resource references',
                  'Open sources in one click',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {i + 1}
                    </div>
                    <p className="text-text-secondary text-sm pt-2">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section id="start" className="py-20 px-4 bg-primary text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">AI scribe for NZ GPs</h2>
            <p className="text-xl mb-8 opacity-90">
              Structured notes, referral‑ready images, and NZ‑referenced answers — fast
            </p>
            <div className="grid gap-3 sm:grid-cols-3 max-w-2xl mx-auto mb-8">
              <div className="rounded-lg bg-white/10 px-4 py-3 text-white/95 text-sm">
                ✓ Notes in minutes
              </div>
              <div className="rounded-lg bg-white/10 px-4 py-3 text-white/95 text-sm">
                ✓ Photos sized for referrals
              </div>
              <div className="rounded-lg bg-white/10 px-4 py-3 text-white/95 text-sm">
                ✓ Trusted NZ sources, cited
              </div>
            </div>
            <p className="text-sm opacity-90 mb-8">Built by a practising NZ GP</p>
            <Link
              href={SIGNUP_URL}
              className="inline-block px-8 py-4 text-lg bg-white text-primary rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Sign up to show interest
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-border py-8 px-4">
          <div className="max-w-7xl mx-auto text-center text-text-tertiary text-sm">
            <p>Built by a practicing GP for GPs</p>
            <div className="mt-4 space-x-6">
              <a href="/terms" className="hover:text-text-primary">
                Terms
              </a>
              <a href="/privacy" className="hover:text-text-primary">
                Privacy
              </a>
              <a href="/contact" className="hover:text-text-primary">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
