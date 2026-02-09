'use client';

import Image from 'next/image';
import Link from 'next/link';

const SIGNUP_URL = '/auth/register?redirect_url=%2Fai-scribe%2Fthank-you';

const sections = [
  { id: 'ai-scribe', label: 'AI Scribe' },
  { id: 'feature-image', label: 'Clinical Image' },
  { id: 'start', label: 'Start Today' },
];

const navItems = sections.filter(s => s.id !== 'start');

function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (element) {
 element.scrollIntoView({ behavior: 'smooth' });
}
}

export default function AiScribeLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <Link href="/" className="text-xl font-bold text-text-primary hover:opacity-90">
              ClinicPro
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-2 sm:flex">
              {navItems.map(section => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className="whitespace-nowrap px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
                >
                  {section.label}
                </button>
              ))}
            </nav>
            <Link
              href={SIGNUP_URL}
              className="inline-block rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Get notified at launch
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section id="hero" className="px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <p className="mb-4 text-sm text-text-tertiary">From an Auckland GP</p>
              <h1 className="mb-6 text-4xl font-bold text-text-primary md:text-5xl">
                AI scribe for NZ GPs
              </h1>
              <p className="mb-3 text-xl font-semibold text-text-secondary">Actually reliable. I use it every day.</p>
              <p className="mx-auto mb-4 max-w-2xl text-lg text-text-secondary">
                I built this because I needed something that actually works:
              </p>
              <ul className="mx-auto mb-8 max-w-md list-disc space-y-2 text-left text-text-secondary">
                <li>Record the consult; it remembers everything so you don&apos;t have to</li>
                <li>Get clean notes with minimal edits (still need your review)</li>
                <li>Capture referral photos during the consult</li>
                <li>Validate medications against NZ Formulary instantly</li>
              </ul>
            </div>
            <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-xl shadow-lg">
              <Image
                src="/images/landing-page/hero-image.png"
                alt="ClinicPro AI Medical Scribe Interface"
                width={1200}
                height={675}
                className="h-auto w-full object-contain"
                priority
              />
            </div>
          </div>
        </section>

        {/* Why I built this */}
        <section id="mission" className="bg-white px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-text-primary">
              Why I built this
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-text-secondary">
              I was spending breaks trying to remember what each patient said, then staying late writing notes. Free AI scribes hallucinate too much; I needed something reliable for my own practice. Works for me, might work for you.
            </p>
          </div>
        </section>

        {/* AI Scribe */}
        <section id="ai-scribe" className="bg-surface px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-2 text-3xl font-bold text-text-primary">AI Scribe</h2>
            <p className="mb-12 text-lg text-text-secondary">
              Capture the consult efficiently. Get structured notes fast
            </p>

            <div className="mb-16 grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <h3 className="mb-4 text-2xl font-bold text-text-primary">
                  Stop trying to remember everything
                </h3>
                <p className="mb-4 text-text-secondary">
                  You&apos;re seeing patients back-to-back. By your break, you&apos;re trying to remember what the 10am patient said about their chest pain. ClinicPro records everything; you focus on the patient, not note-taking during breaks.
                </p>
                <p className="mb-6 text-text-secondary">
                  Audio captures the conversation. Type in exam findings and your assessment as you go. You&apos;re in control; this just handles the cognitive load.
                </p>
              </div>
              <div className="lg:col-span-7">
                <div className="overflow-hidden rounded-xl border border-border bg-white shadow-md">
                  <img
                    src="/images/landing-page/ClinicProConsultation.jpg"
                    alt="Consultation screen showing recording, additional note input, and template switcher"
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="mb-12 grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="order-2 lg:order-1 lg:col-span-7">
                <div className="overflow-hidden rounded-xl border border-border bg-white shadow-md">
                  <img
                    src="/images/landing-page/ClinicProGenerateNote.jpg"
                    alt="Generated note with editable sections"
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full object-contain"
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2 lg:col-span-5">
                <h3 className="mb-4 text-2xl font-bold text-text-primary">
                  Quality output, minimal faffing
                </h3>
                <p className="mb-6 text-text-secondary">
                  Notes come out clean. Quick review, minimal edits, done. Still need your clinical judgement; this isn&apos;t replacing that.
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li>• Default template handles most consults; multi‑problem ready</li>
                  <li>• Switch output style (template) when needed</li>
                </ul>
              </div>
            </div>

            <div className="mb-12 rounded-xl border border-border bg-white p-6">
              <h3 className="mb-4 text-2xl font-bold text-text-primary">
                No desktop mic? Use your phone.
              </h3>
              <p className="text-text-secondary">
                Not every GP has a desktop mic. Put your phone on the desk; record as usual. Audio syncs to the same session. No extra setup, no hassle.
              </p>
            </div>

            <div className="mb-12 rounded-xl border border-border bg-white p-6">
              <h4 className="mb-6 text-center text-xl font-semibold text-text-primary">
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
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                      {i + 1}
                    </div>
                    <p className="pt-2 text-sm text-text-secondary">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Link
                href={SIGNUP_URL}
                className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
              >
                Get notified at launch
              </Link>
            </div>
          </div>
        </section>

        {/* Clinical Image */}
        <section id="feature-image" className="bg-white px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-2 text-3xl font-bold text-text-primary">Clinical Image</h2>
            <p className="mb-12 text-lg text-text-secondary">
              Snap on mobile. Resize automatically.
            </p>

            <div className="mb-12 grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-8">
                <h3 className="mb-4 text-2xl font-bold text-text-primary">Referrals sorted while you&apos;re consulting</h3>
                <p className="mb-6 text-text-secondary">
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
              <div className="flex justify-center lg:col-span-4 lg:justify-end">
                <div className="w-full max-w-[280px] overflow-hidden rounded-xl border border-border bg-white shadow-md">
                  <img
                    src="/images/landing-page/mobile_recording_page"
                    alt="Mobile upload with auto-resize and desktop availability"
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-6">
              <h4 className="mb-6 text-center text-xl font-semibold text-text-primary">
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
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                      {i + 1}
                    </div>
                    <p className="pt-2 text-sm text-text-secondary">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section id="start" className="bg-primary px-4 py-20 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">AI scribe for NZ GPs</h2>
            <p className="mb-8 text-xl opacity-90">
              Less cognitive load. Quality notes. Referrals done during consult.
            </p>
            <div className="mx-auto mb-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-white/10 px-4 py-3 text-sm text-white/95">
                ✓ Notes in minutes
              </div>
              <div className="rounded-lg bg-white/10 px-4 py-3 text-sm text-white/95">
                ✓ Photos sized for referrals
              </div>
              <div className="rounded-lg bg-white/10 px-4 py-3 text-sm text-white/95">
                ✓ Trusted NZ sources, cited
              </div>
            </div>
            <p className="mb-8 text-sm opacity-90">I use this daily in my Auckland practice</p>
            <Link
              href={SIGNUP_URL}
              className="inline-block rounded-lg bg-white px-8 py-4 text-lg font-semibold text-primary transition-colors hover:bg-gray-100"
            >
              Get notified at launch
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-white px-4 py-8">
          <div className="mx-auto max-w-7xl text-center text-sm text-text-tertiary">
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
