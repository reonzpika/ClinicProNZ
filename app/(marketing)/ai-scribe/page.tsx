'use client';

import Image from 'next/image';
import Link from 'next/link';

const SIGNUP_URL = '/auth/register?redirect_url=%2Fai-scribe%2Fthank-you';

const sections = [
  { id: 'ai-scribe', label: 'AI Scribe' },
  { id: 'feature-image', label: 'Clinical Image' },
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
              Get notified at launch
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section id="hero" className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-text-tertiary text-sm mb-4">From an Auckland GP</p>
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
                AI scribe for NZ GPs
              </h1>
              <p className="text-xl font-semibold text-text-secondary mb-3">Actually reliable. I use it every day.</p>
              <p className="text-lg text-text-secondary mb-4 max-w-2xl mx-auto">
                I built this because I needed something that actually works:
              </p>
              <ul className="text-left list-disc space-y-2 max-w-md mx-auto mb-8 text-text-secondary">
                <li>Record the consult; it remembers everything so you don&apos;t have to</li>
                <li>Get clean notes with minimal edits (still need your review)</li>
                <li>Capture referral photos during the consult</li>
                <li>Validate medications against NZ Formulary instantly</li>
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

        {/* Why I built this */}
        <section id="mission" className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-text-primary mb-6">
              Why I built this
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              I was spending breaks trying to remember what each patient said, then staying late writing notes. Free AI scribes hallucinate too much; I needed something reliable for my own practice. Works for me, might work for you.
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
                  Stop trying to remember everything
                </h3>
                <p className="text-text-secondary mb-4">
                  You&apos;re seeing patients back-to-back. By your break, you&apos;re trying to remember what the 10am patient said about their chest pain. ClinicPro records everything; you focus on the patient, not note-taking during breaks.
                </p>
                <p className="text-text-secondary mb-6">
                  Audio captures the conversation. Type in exam findings and your assessment as you go. You&apos;re in control; this just handles the cognitive load.
                </p>
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
                  Quality output, minimal faffing
                </h3>
                <p className="text-text-secondary mb-6">
                  Notes come out clean. Quick review, minimal edits, done. Still need your clinical judgement; this isn&apos;t replacing that.
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li>• Default template handles most consults; multi‑problem ready</li>
                  <li>• Switch output style (template) when needed</li>
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-6 mb-12">
              <h3 className="text-2xl font-bold text-text-primary mb-4">
                No desktop mic? Use your phone.
              </h3>
              <p className="text-text-secondary">
                Not every GP has a desktop mic. Put your phone on the desk; record as usual. Audio syncs to the same session. No extra setup, no hassle.
              </p>
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
                Get notified at launch
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
                <h3 className="text-2xl font-bold text-text-primary mb-4">Referrals sorted while you&apos;re consulting</h3>
                <p className="text-text-secondary mb-6">
                  Take the photo during consult. It&apos;s already on your desktop, auto-resized, ready to attach to your referral. Note&apos;s already written. Referral takes 2 minutes.
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

        {/* Final CTA */}
        <section id="start" className="py-20 px-4 bg-primary text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">AI scribe for NZ GPs</h2>
            <p className="text-xl mb-8 opacity-90">
              Less cognitive load. Quality notes. Referrals done during consult.
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
            <p className="text-sm opacity-90 mb-8">I use this daily in my Auckland practice</p>
            <Link
              href={SIGNUP_URL}
              className="inline-block px-8 py-4 text-lg bg-white text-primary rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Get notified at launch
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-border py-8 px-4">
          <div className="max-w-7xl mx-auto text-center text-text-tertiary text-sm">
            <p>Built by a practising GP for GPs</p>
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
