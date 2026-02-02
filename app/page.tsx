'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { MapPin, Sparkles, Stethoscope } from 'lucide-react';

import { ReferralImagesHomeCard } from '@/src/features/referral-images/ReferralImagesHomeCard';
import { Container } from '@/src/shared/components/layout/Container';

const FAQ_ITEMS = [
  {
    question: "What's ClinicPro?",
    answer:
      'Practical tools for NZ general practice. Built by a GP for GPs. No corporate backing, no VC funding; just solving real workflow problems.',
  },
  {
    question: "Who's Ryo?",
    answer:
      'Full-time GP in Auckland. Trained in NZ, work regular clinics, code in my spare time. Building tools I wish existed when I started.',
  },
  {
    question: "What's the philosophy here?",
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
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <Container size="md">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="text-xl font-bold text-text-primary">
              ClinicPro
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="#tools" className="text-text-secondary hover:text-text-primary transition-colors">
                Tools
              </Link>
              <Link href="#story" className="text-text-secondary hover:text-text-primary transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-text-secondary hover:text-text-primary transition-colors">
                Contact
              </Link>
            </nav>
          </div>
        </Container>
      </header>

      {/* Hero */}
      <section className="min-h-screen flex items-center bg-background">
        <Container size="fluid">
          <div className="max-w-6xl mx-auto px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <h1 className="text-5xl md:text-7xl font-thin tracking-wide mb-6 text-text-primary">
                  Hi, I&apos;m Ryo.
                </h1>
                <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
                  Auckland GP fixing the annoying bits of general practice.
                </p>
              </div>
              <div className="order-1 md:order-2 flex justify-center">
                <div className="relative">
                  <Image
                    src="/images/landing-page/DrRyoEguchiProfilePicMain.jpg"
                    alt="Ryo - Auckland GP"
                    width={384}
                    height={384}
                    className="rounded-full w-64 h-64 md:w-96 md:h-96 object-cover shadow-2xl"
                  />
                  <div
                    className="absolute inset-0 rounded-full blur-3xl -z-10 opacity-30 bg-primary/20"
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Product Cards - vertical stack */}
      <section id="tools" className="scroll-mt-20 py-32 bg-white px-4">
        <div className="w-full md:max-w-2xl md:mx-auto space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-text-primary">
            Tools
          </h2>
          <ReferralImagesHomeCard variant="primary" />

          <div className="rounded-lg border border-border bg-white p-5 transition-shadow hover:shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-normal text-text-primary">AI Scribe (beta)</h3>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-medium">Beta</span>
            </div>
            <p className="text-text-secondary mb-2">
              I use this daily. Still in beta. Most GPs are happy with Heidi, but if you want something more reliable, let me know.
            </p>
            <Link href="/ai-scribe" className="text-primary hover:underline font-medium">
              → Learn more
            </Link>
          </div>

          <div className="rounded-lg border border-border bg-white p-5 transition-shadow hover:shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-normal text-text-primary">ACC Tools</h3>
            </div>
            <p className="text-text-secondary mb-2">
              Less hunting for codes and addresses; submit faster.
            </p>
            <Link href="/acc" className="text-primary hover:underline font-medium">
              → Open
            </Link>
          </div>

          <div className="rounded-lg border border-border bg-white p-5 transition-shadow hover:shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-normal text-text-primary">Coming: Inbox Intelligence</h3>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-medium">Building</span>
            </div>
            <p className="text-text-secondary mb-2">
              Inbox triage, prioritisation, longitudinal tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Story - Dr. Ryo */}
      <section id="story" className="py-16 px-4 bg-surface">
        <div className="w-full md:max-w-2xl md:mx-auto">
          <h2 className="text-3xl font-bold text-text-primary mb-6">
            Thank You for Stopping By
          </h2>
          <div className="rounded-lg bg-white border border-border p-4 mb-6 flex items-center gap-4">
            <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-full border border-border">
              <Image
                src="/images/landing-page/DrRyoEguchiProfilePicMain.jpg"
                alt="Dr. Ryo Eguchi"
                width={56}
                height={56}
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text-primary mb-1">
                A Message from Dr. Ryo Eguchi
              </h3>
              <p className="text-sm text-text-secondary">Practising GP & Founder</p>
            </div>
          </div>
          <blockquote className="bg-white border-l-4 border-primary rounded-r-lg px-6 py-5 shadow-sm">
            <p className="text-text-secondary italic mb-4">
              &quot;Like many GPs, I felt increasingly disconnected from why I became a
              doctor. The constant rush, endless admin, and pressure were taking their toll
              on me and my patients.
            </p>
            <p className="text-text-secondary italic">
              So I started coding in my spare time. Little tools that fixed the annoying workflow problems: emailing photos to myself, staying late to write notes, hunting for ACC codes. ClinicPro is just me solving these problems for myself, and sharing what works.&quot;
            </p>
          </blockquote>
        </div>
      </section>

      {/* Trust / Credibility - ClinicPro as a whole */}
      <section className="py-16 md:py-24 bg-white px-4">
        <div className="w-full md:max-w-2xl md:mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2 mb-12 text-center">
            {/* Column 1 */}
            <div className="flex justify-center md:col-start-1 md:row-start-1">
              <Stethoscope className="size-8 text-primary" aria-hidden />
            </div>
            <div className="min-h-[6rem] flex flex-col justify-center md:col-start-1 md:row-start-2">
              <p className="text-4xl md:text-5xl font-bold text-primary">GP-built</p>
            </div>
            <div className="md:col-start-1 md:row-start-3 mb-16 md:mb-0">
              <p className="mt-1 text-text-secondary">By someone in the room</p>
            </div>
            {/* Column 2 */}
            <div className="flex justify-center md:col-start-2 md:row-start-1">
              <MapPin className="size-8 text-primary" aria-hidden />
            </div>
            <div className="min-h-[6rem] flex flex-col justify-center md:col-start-2 md:row-start-2">
              <p className="text-4xl md:text-5xl font-bold text-primary">NZ-focused</p>
            </div>
            <div className="md:col-start-2 md:row-start-3 mb-16 md:mb-0">
              <p className="mt-1 text-text-secondary">For general practice here</p>
            </div>
            {/* Column 3 */}
            <div className="flex justify-center md:col-start-3 md:row-start-1">
              <Sparkles className="size-8 text-primary" aria-hidden />
            </div>
            <div className="min-h-[6rem] flex flex-col justify-center md:col-start-3 md:row-start-2">
              <p className="text-4xl md:text-5xl font-bold text-primary">No fluff</p>
            </div>
            <div className="md:col-start-3 md:row-start-3 mb-16 md:mb-0">
              <p className="mt-1 text-text-secondary">Only what you need, nothing more</p>
            </div>
          </div>
          <blockquote className="text-center text-lg md:text-xl text-text-primary italic max-w-2xl mx-auto">
            &quot;Software should help GPs, not add friction.&quot;
            <footer className="text-base not-italic text-text-secondary mt-2">
              , ClinicPro
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Consulting / Work with me */}
      <section className="py-16 md:py-24 bg-surface px-4">
        <div className="w-full md:max-w-2xl md:mx-auto">
          <div className="bg-white border border-border rounded-xl p-6 text-center">
            <p className="text-text-secondary mb-3">
              I also consult with health tech companies on GP workflows, PMS integration, and clinical
              safety. Limited availability.
            </p>
            <Link
              href="/contact"
              className="inline-block text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              → Work with me
            </Link>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="py-16 md:py-24 bg-white px-4">
        <div className="w-full md:max-w-2xl md:mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center text-text-primary">
            Where This Is Going
          </h2>

          <div className="space-y-12 relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" aria-hidden />

            <div className="flex gap-6 relative">
              <div className="w-8 h-8 rounded-full bg-primary border-4 border-white shrink-0 relative z-10" />
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-1">Referral Images</h3>
                <p className="text-sm text-text-secondary mb-2 font-medium">Live</p>
                <p className="text-text-secondary">
                  Photo to desktop in 30 seconds. Always JPEG (never PDF), auto-resized, ready for e-referrals. Saves &gt;10 minutes per referral.
                </p>
              </div>
            </div>

            <div className="flex gap-6 relative">
              <div className="w-8 h-8 rounded-full bg-amber-500 border-4 border-white shrink-0 relative z-10" />
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-1">AI Scribe</h3>
                <p className="text-sm text-text-secondary mb-2 font-medium">Beta</p>
                <p className="text-text-secondary">
                  I use it daily; it handles the cognitive load and outputs quality notes. Still in beta. Most GPs are happy with Heidi, but if you want something more reliable with NZ data sovereignty, let me know.
                </p>
              </div>
            </div>

            <div className="flex gap-6 relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-border border-4 border-white shrink-0 relative z-10" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-text-primary mb-1">Inbox Intelligence</h3>
                <p className="text-sm text-text-secondary mb-2 font-medium">Building</p>
                <p className="text-text-secondary mb-4">
                  AI-powered triage, prioritisation, longitudinal tracking.
                </p>
                <div className="bg-surface border border-border rounded-lg p-4">
                  <p className="text-sm text-text-primary mb-3 font-medium">Want early access?</p>
                  <Link
                    href="/auth/register?redirect_url=%2Froadmap%2Fthank-you"
                    className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                  >
                    Sign up to join waitlist →
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex gap-6 relative">
              <div className="w-8 h-8 rounded-full border-2 border-border bg-white shrink-0 relative z-10" />
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-1">Clinical Orchestration</h3>
                <p className="text-sm text-text-secondary mb-2 font-medium">Vision</p>
                <p className="text-text-secondary">
                  The long-term play. Clinical intelligence layer that sits above fragmented systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-surface px-4">
        <div className="w-full md:max-w-2xl md:mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-text-primary">
              Common Questions
            </h2>
            <div className="space-y-4">
              {FAQ_ITEMS.map((item, index) => (
                <details
                  key={index}
                  className="group bg-white border border-border rounded-lg overflow-hidden"
                  open={expandedFaq === index}
                >
                  <summary
                    className="px-6 py-4 cursor-pointer flex justify-between items-center hover:bg-background transition list-none [&::-webkit-details-marker]:hidden"
                    onClick={(e) => {
                      e.preventDefault();
                      setExpandedFaq(expandedFaq === index ? null : index);
                    }}
                  >
                    <span className="font-medium text-text-primary pr-4">{item.question}</span>
                    <span
                      className={`shrink-0 text-text-secondary transition-transform ${expandedFaq === index ? 'rotate-90' : ''}`}
                      aria-hidden
                    >
                      →
                    </span>
                  </summary>
                  <div className="px-6 py-4 border-t border-border text-text-secondary bg-white">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
        </div>
      </section>

      {/* Footer - custom block */}
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
    </div>
  );
}
