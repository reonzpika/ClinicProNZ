'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { ReferralImagesHomeCard } from '@/src/features/referral-images/ReferralImagesHomeCard';
import { Container } from '@/src/shared/components/layout/Container';
import { Footer } from '@/src/shared/components/Footer';
import { Button } from '@/src/shared/components/ui/button';

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

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Hero */}
      <section className="py-10">
        <Container size="md">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-[#1A1A1A]">ClinicPro</h1>
            <p className="text-[#6B6B6B]">A set of practical tools for NZ general practice.</p>
          </div>
        </Container>
      </section>

      {/* Product Cards */}
      <section className="py-8 bg-white">
        <Container size="md">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 p-5 transition-shadow hover:shadow-md">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">AI Scribe</h2>
              <p className="mt-1 text-sm text-[#6B6B6B]">Finish notes faster; stay focused on the patient.</p>
              <div className="mt-4 space-y-2">
                <Button asChild className="w-full hover:scale-[1.02] transition-transform">
                  <Link href="/ai-scribe">Open</Link>
                </Button>
              </div>
            </div>

            <ReferralImagesHomeCard />

            <div className="rounded-lg border border-slate-200 p-5 transition-shadow hover:shadow-md">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">ACC Tools</h2>
              <p className="mt-1 text-sm text-[#6B6B6B]">Spend less time hunting codes and addresses; submit faster.</p>
              <div className="mt-4 space-y-2">
                <Button asChild variant="outline" className="w-full hover:scale-[1.02] transition-transform">
                  <Link href="/acc">Open</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust / Credibility */}
      <section className="py-16 md:py-24 bg-[#FAFAF8]">
        <Container size="md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold text-[#2D7A5F]">50+</p>
              <p className="mt-1 text-[#6B6B6B]">NZ GPs using this</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-[#2D7A5F]">30 sec</p>
              <p className="mt-1 text-[#6B6B6B]">Phone to desktop</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-[#2D7A5F]">Free</p>
              <p className="mt-1 text-[#6B6B6B]">No credit card required</p>
            </div>
          </div>
          <blockquote className="text-center text-lg md:text-xl text-[#1A1A1A] italic max-w-2xl mx-auto">
            &quot;It&apos;s intolerable how long it takes&quot;
            <footer className="text-base not-italic text-[#6B6B6B] mt-2">— Fellow NZ GP on the old workflow</footer>
          </blockquote>
        </Container>
      </section>

      {/* About */}
      <section id="about" className="py-16 md:py-24 bg-white">
        <Container size="md">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/images/landing-page/DrRyoEguchiProfilePicMain.jpg"
                alt="GP workspace"
                width={800}
                height={500}
                className="w-full h-auto object-cover"
              />
            </div>
            <p className="text-xl md:text-2xl text-center text-[#1A1A1A] mb-8">
              Full-time GP in Auckland who codes after hours. I built ClinicPro because GPs deserve better tools. No
              VC funding, just solving real GP problems.
            </p>
            <div className="mt-12 bg-[#E8F5F0] border border-[#2D7A5F]/20 rounded-xl p-6 text-center">
              <p className="text-[#6B6B6B] mb-3">
                I also consult with health tech companies on GP workflows, PMS integration, and clinical safety. Limited
                availability.
              </p>
              <Link
                href="/consulting"
                className="inline-block text-[#2D7A5F] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#2D7A5F] focus:ring-offset-2 rounded"
              >
                → Work with me
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-[#FAFAF8]">
        <Container size="md">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-[#1A1A1A]">Common Questions</h2>
            <div className="space-y-4">
              {FAQ_ITEMS.map((item, index) => (
                <details
                  key={index}
                  className="group bg-white border border-[#E8E8E6] rounded-lg overflow-hidden"
                  open={expandedFaq === index}
                >
                  <summary
                    className="px-6 py-4 cursor-pointer flex justify-between items-center hover:bg-[#FAFAF8] transition list-none [&::-webkit-details-marker]:hidden"
                    onClick={(e) => {
                      e.preventDefault();
                      setExpandedFaq(expandedFaq === index ? null : index);
                    }}
                  >
                    <span className="font-medium text-[#1A1A1A] pr-4">{item.question}</span>
                    <span
                      className={`shrink-0 text-[#6B6B6B] transition-transform ${expandedFaq === index ? 'rotate-90' : ''}`}
                      aria-hidden
                    >
                      →
                    </span>
                  </summary>
                  <div className="px-6 py-4 border-t border-[#E8E8E6] text-[#6B6B6B] bg-white">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* End of homepage: Questions? + email */}
      <section className="py-12 bg-[#FAFAF8] text-center">
        <Container size="md">
          <p className="text-[#1A1A1A] font-medium mb-2">Questions?</p>
          <a
            href="mailto:ryo@clinicpro.co.nz"
            className="text-[#2D7A5F] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#2D7A5F] focus:ring-offset-2 rounded"
          >
            ryo@clinicpro.co.nz
          </a>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
