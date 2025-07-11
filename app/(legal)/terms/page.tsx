import Link from 'next/link';
import React from 'react';

import { Footer } from '@/src/shared/components/Footer';
import { Header } from '@/src/shared/components/Header';
import { Container } from '@/src/shared/components/layout/Container';

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <Container size="lg">
          <div className="mx-auto max-w-4xl py-8">
            {/* Back to Home Button - Top */}
            <div className="mb-6">
              <Link
                href="/"
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                â† Back to Home
              </Link>
            </div>

            <div className="prose prose-gray max-w-none">
              <h1 className="mb-8 text-3xl font-bold text-gray-900">
                Terms of Service
              </h1>

              <p className="mb-8 text-sm text-gray-600">
                <strong>Last updated: [Insert Date]</strong>
              </p>

              <p className="mb-8 text-lg leading-relaxed text-gray-700">
                Welcome to ConsultAI NZ ("we", "us", or "our"). These Terms of Service ("Terms") govern your use of our consultation note automation web application ("Service"). By accessing or using ConsultAI NZ, you agree to be bound by these Terms.
              </p>

              <hr className="my-8 border-gray-200" />

              <div className="space-y-8">
                <section>
                  <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                    1. Eligibility
                  </h2>
                  <p className="leading-relaxed text-gray-700">
                    You represent and warrant that you are a licensed General Practitioner (GP) practicing in New Zealand and have the legal authority to use ConsultAI NZ in accordance with applicable laws and ethical guidelines.
                  </p>
                </section>

                <hr className="border-gray-200" />

                <section>
                  <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                    2. Service Description
                  </h2>
                  <p className="leading-relaxed text-gray-700">
                    ConsultAI NZ provides a browser-based platform that uses audio transcription and artificial intelligence to assist GPs in generating clinical consultation notes. The Service includes live audio transcription (via Deepgram) and note generation (via OpenAI) based on templates.
                  </p>
                </section>

                <hr className="border-gray-200" />

                <section>
                  <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                    3. User Responsibilities
                  </h2>
                  <ul className="list-disc space-y-2 pl-6 text-gray-700">
                    <li>You must obtain informed patient consent before recording consultations, complying with the New Zealand Health Information Privacy Code 2020.</li>
                    <li>You agree to use the Service only for lawful medical and professional purposes consistent with your obligations as a GP.</li>
                    <li>You are responsible for the accuracy, completeness, and appropriateness of any information entered or generated.</li>
                    <li>You must keep your account credentials confidential and notify us immediately of any unauthorized use.</li>
                  </ul>
                </section>

                <hr className="border-gray-200" />

                <section>
                  <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                    4. Intellectual Property
                  </h2>
                  <ul className="list-disc space-y-2 pl-6 text-gray-700">
                    <li>All intellectual property rights in ConsultAI NZ, including software, templates, and APIs, remain the exclusive property of ConsultAI NZ.</li>
                    <li>You are granted a limited, non-exclusive, non-transferable license to use the Service for your professional practice only.</li>
                  </ul>
                </section>

                <hr className="border-gray-200" />

                <section>
                  <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                    5. Privacy
                  </h2>
                  <p className="leading-relaxed text-gray-700">
                    Your use of ConsultAI NZ is subject to our
                    {' '}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                      Privacy Policy
                    </Link>
                    . By using the Service, you consent to the collection, processing, and storage of your data as described therein.
                  </p>
                </section>

                <hr className="border-gray-200" />

                <section>
                  <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                    6. Disclaimers and Limitation of Liability
                  </h2>
                  <ul className="list-disc space-y-2 pl-6 text-gray-700">
                    <li>ConsultAI NZ is a tool to assist with note generation and does not replace professional judgment.</li>
                    <li>We do not guarantee the accuracy or completeness of generated notes. You remain responsible for reviewing all notes before clinical use.</li>
                    <li>To the maximum extent permitted by law, ConsultAI NZ disclaims all warranties, express or implied, including fitness for a particular purpose.</li>
                    <li>We are not liable for any indirect, incidental, special, or consequential damages arising out of your use of the Service, even if advised of the possibility.</li>
                  </ul>
                </section>

                <hr className="border-gray-200" />

                <section>
                  <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                    7. Termination
                  </h2>
                  <p className="leading-relaxed text-gray-700">
                    We may suspend or terminate your access immediately for any breach of these Terms or unlawful conduct. You may terminate your account at any time by contacting support.
                  </p>
                </section>

                <hr className="border-gray-200" />

                <section>
                  <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                    8. Governing Law and Jurisdiction
                  </h2>
                  <p className="leading-relaxed text-gray-700">
                    These Terms are governed by the laws of New Zealand. Any disputes arising from these Terms or your use of the Service will be subject to the exclusive jurisdiction of New Zealand courts.
                  </p>
                </section>

                <hr className="border-gray-200" />

                <section>
                  <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                    9. Changes to Terms
                  </h2>
                  <p className="leading-relaxed text-gray-700">
                    We may update these Terms from time to time. We will notify you of material changes via email or in-app notices. Continued use after changes constitutes acceptance.
                  </p>
                </section>

                <hr className="border-gray-200" />

                <section>
                  <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                    10. Contact Us
                  </h2>
                  <p className="mb-4 leading-relaxed text-gray-700">
                    For questions about these Terms, please contact us at:
                  </p>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-gray-700">
                      <strong>Email:</strong>
                      {' '}
                      [support@consultainz.nz]
                    </p>
                    <p className="text-gray-700">
                      <strong>Phone:</strong>
                      {' '}
                      [+64 XXX XXX XXX]
                    </p>
                  </div>
                </section>

                <hr className="border-gray-200" />

                <div className="rounded-lg bg-blue-50 p-6">
                  <p className="text-lg font-medium text-blue-900">
                    Thank you for choosing ConsultAI NZ. We're committed to supporting your important work with innovative, secure technology.
                  </p>
                </div>
              </div>
            </div>

            {/* Back to Home Button - Bottom */}
            <div className="mt-12">
              <Link
                href="/"
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                â† Back to Home
              </Link>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
