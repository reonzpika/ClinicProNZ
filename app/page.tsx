'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { ReferralImagesHomeCard } from '@/src/features/referral-images/ReferralImagesHomeCard';
import { Container } from '@/src/shared/components/layout/Container';

const FAQ_ITEMS = [
  {
    question: "What's ClinicPro?",
    answer:
      'Practical tools for NZ general practice. Built by a GP for GPs. No corporate backing, no VC funding—just solving real workflow problems.',
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
      'Yes. Data secure, NZ healthcare compliant. Email me directly if you have concerns—I respond personally.',
  },
  {
    question: 'Where is this going?',
    answer:
      'Keep building tools GPs need. Referral images work great. AI scribe in beta. Inbox intelligence in progress. Growing sustainably.',
  },
] as const;

export default function HomePage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState('');

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
              <Link href="#about" className="text-text-secondary hover:text-text-primary transition-colors">
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
                  Auckland GP building better tools for NZ general practice.
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
      <section id="tools" className="scroll-mt-20 py-32 bg-white">
        <div className="max-w-5xl mx-auto px-8 space-y-8">
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
              Daily driver in beta. Happy to release if there&apos;s demand.
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
              <h3 className="text-2xl font-normal text-text-primary">Coming: AI Intelligence Engine</h3>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-medium">Building</span>
            </div>
            <p className="text-text-secondary mb-2">
              Inbox triage, prioritization, longitudinal tracking.
            </p>
            <Link href="#roadmap" className="text-primary hover:underline font-medium">
              → Read the vision
            </Link>
          </div>
        </div>
      </section>

      {/* Trust / Credibility - ClinicPro as a whole */}
      <section className="py-16 md:py-24 bg-surface">
        <Container size="md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold text-primary">GP-built</p>
              <p className="mt-1 text-text-secondary">By someone in the room</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-primary">NZ-focused</p>
              <p className="mt-1 text-text-secondary">For general practice here</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-primary">No bloat</p>
              <p className="mt-1 text-text-secondary">Practical tools, no upselling</p>
            </div>
          </div>
          <blockquote className="text-center text-lg md:text-xl text-text-primary italic max-w-2xl mx-auto">
            &quot;Software should help GPs, not add friction.&quot;
            <footer className="text-base not-italic text-text-secondary mt-2">
              — ClinicPro
            </footer>
          </blockquote>
        </Container>
      </section>

      {/* About */}
      <section id="about" className="py-16 md:py-24 bg-white">
        <Container size="md">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-text-primary">
              About
            </h2>
            <p className="text-xl md:text-2xl text-center text-text-primary mb-8">
              Full-time GP in Auckland who codes after hours. I built ClinicPro because GPs deserve
              better tools. No VC funding, just solving real GP problems.
            </p>
            <div className="mt-12 bg-surface border border-border rounded-xl p-6 text-center">
              <p className="text-text-secondary mb-3">
                I also consult with health tech companies on GP workflows, PMS integration, and clinical
                safety. Limited availability.
              </p>
              <Link
                href="/consulting"
                className="inline-block text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                → Work with me
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-8">
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
                  Phone to desktop in 30 seconds. No more email-to-self, manual resize, or file too large
                  rejections.
                </p>
              </div>
            </div>

            <div className="flex gap-6 relative">
              <div className="w-8 h-8 rounded-full bg-amber-500 border-4 border-white shrink-0 relative z-10" />
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-1">AI Scribe</h3>
                <p className="text-sm text-text-secondary mb-2 font-medium">Beta</p>
                <p className="text-text-secondary">
                  Working; I use it daily but it&apos;s in beta. Built mainly for myself. Happy to release if
                  there&apos;s demand—most people use Heidi which is also good.
                </p>
              </div>
            </div>

            <div className="flex gap-6 relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-border border-4 border-white shrink-0 relative z-10" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-text-primary mb-1">Inbox Intelligence Engine</h3>
                <p className="text-sm text-text-secondary mb-2 font-medium">Building</p>
                <p className="text-text-secondary mb-4">
                  AI-powered triage, prioritization, longitudinal tracking.
                </p>
                <div className="bg-surface border border-border rounded-lg p-4">
                  <p className="text-sm text-text-primary mb-3 font-medium">Want early access?</p>
                  <form
                    className="flex flex-col md:flex-row gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      window.location.href = `mailto:ryo@clinicpro.co.nz?subject=Inbox%20Intelligence%20waitlist&body=Email:%20${encodeURIComponent(waitlistEmail)}`;
                    }}
                  >
                    <input
                      type="email"
                      placeholder="your.email@clinic.co.nz"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      className="flex-1 px-4 py-2 border border-border rounded-lg focus:border-primary focus:outline-none text-text-primary"
                    />
                    <button
                      type="submit"
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium whitespace-nowrap"
                    >
                      Join waitlist →
                    </button>
                  </form>
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
      <section className="py-16 md:py-24 bg-surface">
        <Container size="md">
          <div className="max-w-3xl mx-auto">
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
        </Container>
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
            <Link href="/consulting" className="hover:text-text-primary transition-colors">
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
