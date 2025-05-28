import React from 'react';

import { Footer } from '@/shared/components/Footer';
import { Header } from '@/shared/components/Header';
import { Container } from '@/shared/components/layout/Container';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <Container size="lg">
          <div className="mx-auto max-w-4xl py-8">
            <div className="prose prose-gray max-w-none">
              <h1 className="mb-8 text-3xl font-bold text-gray-900">
                About ConsultAI NZ
              </h1>

              <p className="mb-8 text-xl font-semibold text-blue-900">
                Designed by GPs, for GPs.
              </p>

              <p className="mb-8 text-lg leading-relaxed text-gray-700">
                As a practising New Zealand GP, I know firsthand how much time we spend on consultation notes—time that could be better spent with patients or for our own wellbeing. That's why I created ConsultAI NZ: a simple, smart tool to take the paperwork off your plate and put your focus back where it belongs.
              </p>

              <div className="space-y-8">
                <section>
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">
                    What is ConsultAI NZ?
                  </h3>
                  <p className="leading-relaxed text-gray-700">
                    It's a lightweight, browser-based app that listens to your consultations, transcribes them live, and generates structured, editable clinical notes with just one click. No complicated setups, no bulky devices—just the tools you need to streamline your workflow while respecting New Zealand's unique practice environment.
                  </p>
                </section>

                <section>
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">
                    How does it help you?
                  </h3>
                  <ul className="list-disc space-y-2 pl-6 text-gray-700">
                    <li>Save precious time by automating note writing</li>
                    <li>Capture all important details accurately with live transcription</li>
                    <li>Use templates tailored to typical NZ GP consultations</li>
                    <li>Retain full control with instantly generated notes you can review, edit, and export to your existing EHR</li>
                    <li>Keep patient data privacy front and centre — consult our dedicated Privacy page for details</li>
                  </ul>
                </section>

                <section>
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">
                    Why ConsultAI NZ?
                  </h3>
                  <p className="leading-relaxed text-gray-700">
                    Because this app was built by someone who lives your day-to-day reality. Every feature reflects the practical needs of solo and small-group GPs across Aotearoa. We're not here to add complexity; we're here to reduce it.
                  </p>
                </section>

                <section>
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">
                    Our Bold Mission:
                  </h3>
                  <div className="rounded-lg bg-green-50 p-6">
                    <p className="text-lg font-medium italic text-green-900">
                      To cut your admin time in half, so you can do what you became a GP to do—care for your patients, not your paperwork.
                    </p>
                  </div>
                </section>
              </div>

              <hr className="my-8 border-gray-200" />

              <div className="rounded-lg bg-blue-50 p-6">
                <p className="text-lg font-semibold text-blue-900">
                  If you share this vision, you're in the right place.
                </p>
                <p className="mt-2 text-blue-800">
                  Welcome to ConsultAI NZ—your partner in smarter, faster consultations.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
} 