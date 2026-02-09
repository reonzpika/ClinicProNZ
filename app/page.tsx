'use client';

import { MapPin, Sparkles, Stethoscope } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { ReferralImagesHomeCard } from '@/src/features/referral-images/ReferralImagesHomeCard';
import { Container } from '@/src/shared/components/layout/Container';

const FAQ_ITEMS = [
  {
    question: 'What\'s ClinicPro?',
    answer:
      'Practical tools for NZ general practice. Built by a GP for GPs. No corporate backing, no VC funding; just solving real workflow problems.',
  },
  {
    question: 'Who\'s Ryo?',
    answer:
      'Full-time GP in Auckland. Trained in NZ, work regular clinics, code in my spare time. Building tools I wish existed when I started.',
  },
  {
    question: 'What\'s the philosophy here?',
    answer:
      'Software should help GPs, not add friction. Simple, fast, practical tools that respect your time. No bloat, no upselling, no BS.',
  },
  {
    question: 'Is this legit?',
    answer:
      'Yes. Data secure, NZ healthcare compliant. Email me directly if you have concerns; I respond personally.',
  },
  {
    question: 'Where is this going?',
    answer:
      'Keep building what GPs actually need. Referral Images is live and working well. AI Scribe in beta. Inbox Intelligence coming. Growing sustainably, no VC pressure.',
  },
] as const;

export default function HomePage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-white">
        <Container size="md">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="text-xl font-bold text-text-primary">
              ClinicPro
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="#tools" className="text-text-secondary transition-colors hover:text-text-primary">
                Tools
              </Link>
              <Link href="#story" className="text-text-secondary transition-colors hover:text-text-primary">
                About
              </Link>
              <Link href="/contact" className="text-text-secondary transition-colors hover:text-text-primary">
                Contact
              </Link>
            </nav>
          </div>
        </Container>
      </header>

      {/* Hero */}
      <section className="flex min-h-screen items-center bg-background">
        <Container size="fluid">
          <div className="mx-auto max-w-6xl px-8">
            <div className="grid items-center gap-16 md:grid-cols-2">
              <div className="order-2 md:order-1">
                <h1 className="mb-6 text-5xl font-thin tracking-wide text-text-primary md:text-7xl">
                  Hi, I&apos;m Ryo.
                </h1>
                <p className="text-lg leading-relaxed text-text-secondary md:text-xl">
                  Auckland GP fixing the annoying bits of general practice.
                </p>
              </div>
              <div className="order-1 flex justify-center md:order-2">
                <div className="relative">
                  <Image
                    src="/images/landing-page/DrRyoEguchiProfilePicMain.jpg"
                    alt="Ryo - Auckland GP"
                    width={384}
                    height={384}
                    className="size-64 rounded-full object-cover shadow-2xl md:size-96"
                  />
                  <div
                    className="absolute inset-0 -z-10 rounded-full bg-primary/20 opacity-30 blur-3xl"
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Product Cards - vertical stack */}
      <section id="tools" className="scroll-mt-20 bg-white px-4 py-32">
        <div className="w-full space-y-8 md:mx-auto md:max-w-2xl">
          <h2 className="mb-12 text-3xl font-bold text-text-primary md:text-4xl">
            Tools
          </h2>
          <ReferralImagesHomeCard variant="primary" />

          <div className="rounded-lg border border-border bg-white p-5 transition-shadow hover:shadow-md">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-2xl font-normal text-text-primary">AI Scribe (beta)</h3>
              <span className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">Beta</span>
            </div>
            <p className="mb-2 text-text-secondary">
              I use this daily. Still in beta. Most GPs are happy with Heidi, but if you want something more reliable, let me know.
            </p>
            <Link href="/ai-scribe" className="font-medium text-primary hover:underline">
              → Learn more
            </Link>
          </div>

          <div className="rounded-lg border border-border bg-white p-5 transition-shadow hover:shadow-md">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-2xl font-normal text-text-primary">ACC Tools</h3>
            </div>
            <p className="mb-2 text-text-secondary">
              Less hunting for codes and addresses; submit faster.
            </p>
            <Link href="/acc" className="font-medium text-primary hover:underline">
              → Open
            </Link>
          </div>

          <div className="rounded-lg border border-border bg-white p-5 transition-shadow hover:shadow-md">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-2xl font-normal text-text-primary">Coming: Inbox Intelligence</h3>
              <span className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">Building</span>
            </div>
            <p className="mb-2 text-text-secondary">
              Inbox triage, prioritisation, longitudinal tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Story - Dr. Ryo */}
      <section id="story" className="bg-surface px-4 py-16">
        <div className="w-full md:mx-auto md:max-w-2xl">
          <h2 className="mb-6 text-3xl font-bold text-text-primary">
            Thank You for Stopping By
          </h2>
          <div className="mb-6 flex items-center gap-4 rounded-lg border border-border bg-white p-4">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-full border border-border">
              <Image
                src="/images/landing-page/DrRyoEguchiProfilePicMain.jpg"
                alt="Dr. Ryo Eguchi"
                width={56}
                height={56}
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="mb-1 text-xl font-semibold text-text-primary">
                A Message from Dr. Ryo Eguchi
              </h3>
              <p className="text-sm text-text-secondary">Practising GP & Founder</p>
            </div>
          </div>
          <blockquote className="rounded-r-lg border-l-4 border-primary bg-white px-6 py-5 shadow-sm">
            <p className="mb-4 italic text-text-secondary">
              &quot;Like many GPs, I felt increasingly disconnected from why I became a
              doctor. The constant rush, endless admin, and pressure were taking their toll
              on me and my patients.
            </p>
            <p className="italic text-text-secondary">
              So I started coding in my spare time. Little tools that fixed the annoying workflow problems: emailing photos to myself, staying late to write notes, hunting for ACC codes. ClinicPro is just me solving these problems for myself, and sharing what works.&quot;
            </p>
          </blockquote>
        </div>
      </section>

      {/* Trust / Credibility - ClinicPro as a whole */}
      <section className="bg-white px-4 py-16 md:py-24">
        <div className="w-full md:mx-auto md:max-w-2xl">
          <div className="mb-12 grid grid-cols-1 gap-x-8 gap-y-2 text-center md:grid-cols-3">
            {/* Column 1 */}
            <div className="flex justify-center md:col-start-1 md:row-start-1">
              <Stethoscope className="size-8 text-primary" aria-hidden />
            </div>
            <div className="flex min-h-24 flex-col justify-center md:col-start-1 md:row-start-2">
              <p className="text-4xl font-bold text-primary md:text-5xl">GP-built</p>
            </div>
            <div className="mb-16 md:col-start-1 md:row-start-3 md:mb-0">
              <p className="mt-1 text-text-secondary">By someone in the room</p>
            </div>
            {/* Column 2 */}
            <div className="flex justify-center md:col-start-2 md:row-start-1">
              <MapPin className="size-8 text-primary" aria-hidden />
            </div>
            <div className="flex min-h-24 flex-col justify-center md:col-start-2 md:row-start-2">
              <p className="text-4xl font-bold text-primary md:text-5xl">NZ-focused</p>
            </div>
            <div className="mb-16 md:col-start-2 md:row-start-3 md:mb-0">
              <p className="mt-1 text-text-secondary">For general practice here</p>
            </div>
            {/* Column 3 */}
            <div className="flex justify-center md:col-start-3 md:row-start-1">
              <Sparkles className="size-8 text-primary" aria-hidden />
            </div>
            <div className="flex min-h-24 flex-col justify-center md:col-start-3 md:row-start-2">
              <p className="text-4xl font-bold text-primary md:text-5xl">No fluff</p>
            </div>
            <div className="mb-16 md:col-start-3 md:row-start-3 md:mb-0">
              <p className="mt-1 text-text-secondary">Only what you need, nothing more</p>
            </div>
          </div>
          <blockquote className="mx-auto max-w-2xl text-center text-lg italic text-text-primary md:text-xl">
            &quot;Software should help GPs, not add friction.&quot;
            <footer className="mt-2 text-base not-italic text-text-secondary">
              , ClinicPro
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Consulting / Work with me */}
      <section className="bg-surface px-4 py-16 md:py-24">
        <div className="w-full md:mx-auto md:max-w-2xl">
          <div className="rounded-xl border border-border bg-white p-6 text-center">
            <p className="mb-3 text-text-secondary">
              I also consult with health tech companies on GP workflows, PMS integration, and clinical
              safety. Limited availability.
            </p>
            <Link
              href="/contact"
              className="inline-block rounded font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              → Work with me
            </Link>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="bg-white px-4 py-16 md:py-24">
        <div className="w-full md:mx-auto md:max-w-2xl">
          <h2 className="mb-16 text-center text-3xl font-bold text-text-primary md:text-4xl">
            Where This Is Going
          </h2>

          <div className="relative space-y-12">
            <div className="absolute inset-y-0 left-4 w-0.5 bg-border" aria-hidden />

            <div className="relative flex gap-6">
              <div className="relative z-10 size-8 shrink-0 rounded-full border-4 border-white bg-primary" />
              <div>
                <h3 className="mb-1 text-xl font-bold text-text-primary">Referral Images</h3>
                <p className="mb-2 text-sm font-medium text-text-secondary">Live</p>
                <p className="text-text-secondary">
                  Photo to desktop in 30 seconds. Always JPEG (never PDF), auto-resized, ready for e-referrals. Saves &gt;10 minutes per referral.
                </p>
              </div>
            </div>

            <div className="relative flex gap-6">
              <div className="relative z-10 size-8 shrink-0 rounded-full border-4 border-white bg-amber-500" />
              <div>
                <h3 className="mb-1 text-xl font-bold text-text-primary">AI Scribe</h3>
                <p className="mb-2 text-sm font-medium text-text-secondary">Beta</p>
                <p className="text-text-secondary">
                  I use it daily; it handles the cognitive load and outputs quality notes. Still in beta. Most GPs are happy with Heidi, but if you want something more reliable with NZ data sovereignty, let me know.
                </p>
              </div>
            </div>

            <div className="relative flex gap-6">
              <div className="relative z-10 size-8 shrink-0 rounded-full border-4 border-white bg-gradient-to-r from-amber-500 to-border" />
              <div className="flex-1">
                <h3 className="mb-1 text-xl font-bold text-text-primary">Inbox Intelligence</h3>
                <p className="mb-2 text-sm font-medium text-text-secondary">Building</p>
                <p className="mb-4 text-text-secondary">
                  AI-powered triage, prioritisation, longitudinal tracking.
                </p>
                <div className="rounded-lg border border-border bg-surface p-4">
                  <p className="mb-3 text-sm font-medium text-text-primary">Want early access?</p>
                  <Link
                    href="/auth/register?redirect_url=%2Froadmap%2Fthank-you"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-medium text-white transition-colors hover:bg-primary-dark"
                  >
                    Sign up to join waitlist →
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative flex gap-6">
              <div className="relative z-10 size-8 shrink-0 rounded-full border-2 border-border bg-white" />
              <div>
                <h3 className="mb-1 text-xl font-bold text-text-primary">Clinical Orchestration</h3>
                <p className="mb-2 text-sm font-medium text-text-secondary">Vision</p>
                <p className="text-text-secondary">
                  The long-term play. Clinical intelligence layer that sits above fragmented systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface px-4 py-16 md:py-24">
        <div className="w-full md:mx-auto md:max-w-2xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-text-primary md:text-4xl">
              Common Questions
            </h2>
            <div className="space-y-4">
              {FAQ_ITEMS.map((item, index) => (
                <details
                  key={index}
                  className="group overflow-hidden rounded-lg border border-border bg-white"
                  open={expandedFaq === index}
                >
                  <summary
                    className="flex cursor-pointer list-none items-center justify-between px-6 py-4 transition hover:bg-background [&::-webkit-details-marker]:hidden"
                    onClick={(e) => {
                      e.preventDefault();
                      setExpandedFaq(expandedFaq === index ? null : index);
                    }}
                  >
                    <span className="pr-4 font-medium text-text-primary">{item.question}</span>
                    <span
                      className={`shrink-0 text-text-secondary transition-transform ${expandedFaq === index ? 'rotate-90' : ''}`}
                      aria-hidden
                    >
                      →
                    </span>
                  </summary>
                  <div className="border-t border-border bg-white px-6 py-4 text-text-secondary">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
        </div>
      </section>

      {/* Footer - custom block */}
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
