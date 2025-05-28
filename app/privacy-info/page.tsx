import Link from 'next/link';
import React from 'react';

import { Footer } from '@/shared/components/Footer';
import { Header } from '@/shared/components/Header';
import { Container } from '@/shared/components/layout/Container';

export default function PrivacyInfoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <Container size="lg">
          <div className="mx-auto max-w-4xl py-8">
            <div className="prose prose-gray max-w-none">
              <h1 className="mb-8 text-3xl font-bold text-gray-900">
                ConsultAI NZ Privacy
              </h1>

              <p className="mb-8 text-lg leading-relaxed text-gray-700">
                At ConsultAI NZ, we understand that confidentiality and trust are vital to your work as a GP.
                Protecting your patients' privacy—and yours—is our top priority. Here's how we handle data when you use our app.
              </p>

              <div className="space-y-8">
                <section>
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">
                    What data do we collect?
                  </h3>
                  <ul className="list-disc space-y-2 pl-6 text-gray-700">
                    <li>
                      We only use
                      {' '}
                      <strong>audio recordings</strong>
                      {' '}
                      you make during consultations. Nothing else about your patients is collected unless you enter it manually (like notes).
                    </li>
                    <li>
                      Since ConsultAI NZ is standalone, we don't connect to your practice's clinical systems or store patient files.
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">
                    How is your data protected?
                  </h3>
                  <ul className="list-disc space-y-2 pl-6 text-gray-700">
                    <li>
                      Our transcription partner,
                      {' '}
                      <strong>Deepgram</strong>
                      , automatically removes personal identifiers from the audio before passing it on. So the note-generation AI only sees anonymized text.
                    </li>
                    <li>
                      Both Deepgram and OpenAI use strong security measures, including encrypted data transmission and storage, to keep information safe.
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">
                    What about patient consent?
                  </h3>
                  <ul className="list-disc space-y-2 pl-6 text-gray-700">
                    <li>
                      You'll prompt your patient for
                      {' '}
                      <strong>verbal consent</strong>
                      {' '}
                      before recording, in line with New Zealand's Health Information Privacy Code. This consent is logged for your records.
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">
                    Where is data stored?
                  </h3>
                  <ul className="list-disc space-y-2 pl-6 text-gray-700">
                    <li>
                      Audio and transcripts are processed temporarily in secure servers. We aim to use data centers within Australasia when possible to comply with local privacy expectations.
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">
                    How long is data kept?
                  </h3>
                  <ul className="list-disc space-y-2 pl-6 text-gray-700">
                    <li>
                      Transcriptions and notes are
                      {' '}
                      <strong>not stored permanently</strong>
                      {' '}
                      by ConsultAI NZ. They exist briefly while your note is generated and can be saved only if you choose.
                    </li>
                    <li>
                      Deepgram and OpenAI have their own policies on data retention, but personal info is minimized and handled carefully, per their commitments.
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">
                    Can data be deleted?
                  </h3>
                  <ul className="list-disc space-y-2 pl-6 text-gray-700">
                    <li>
                      You control all notes and transcripts in your sessions. You can delete them anytime.
                    </li>
                    <li>
                      If you request, we will assist in deleting any data held by our providers related to your account, subject to their policies.
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">
                    Do we share your data?
                  </h3>
                  <ul className="list-disc space-y-2 pl-6 text-gray-700">
                    <li>
                      We only use your data to enable transcription and note generation via Deepgram and OpenAI.
                    </li>
                    <li>
                      We never sell, rent, or share your data with third parties for marketing or other unrelated purposes.
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">
                    What if there's a data breach?
                  </h3>
                  <ul className="list-disc space-y-2 pl-6 text-gray-700">
                    <li>
                      We have strong security and monitoring in place. If a breach occurs that could harm you or your patients, we will notify you and comply with New Zealand's mandatory breach reporting requirements.
                    </li>
                  </ul>
                </section>
              </div>

              <hr className="my-8 border-gray-200" />

              <div className="rounded-lg bg-blue-50 p-6">
                <p className="mb-4 text-lg font-semibold text-blue-900">
                  Your trust matters to us.
                </p>
                <p className="mb-4 text-blue-800">
                  This page is a summary—please contact us anytime for detailed privacy info or to discuss concerns.
                </p>
                <p className="text-blue-800">
                  For full details on our privacy practices, please see our dedicated
                  {' '}
                  <Link href="/privacy" className="font-semibold text-blue-600 underline hover:text-blue-800">
                    Privacy Policy
                  </Link>
                  {' '}
                  page.
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
