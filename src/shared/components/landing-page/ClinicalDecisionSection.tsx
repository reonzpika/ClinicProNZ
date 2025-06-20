'use client';

import { Eye, FileCheck, Globe, Lock, Shield } from 'lucide-react';

export const ClinicalDecisionSection = () => {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Your Patients' Privacy Comes First
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            Built by GPs, for GPs. Never replaces clinical judgment, always supports it.
            Your privacy and patient confidentiality are our foundation.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left column - Privacy Features */}
          <div className="space-y-6">
            <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-blue-50 p-6">
              <div className="flex items-start space-x-4">
                <div className="shrink-0 rounded-lg bg-green-100 p-2">
                  <Shield className="size-6 text-green-600" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">End-to-End Data Protection</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center space-x-2">
                      <span className="size-2 rounded-full bg-green-500"></span>
                      <span>Deepgram redaction — no personal info captured or stored</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="size-2 rounded-full bg-green-500"></span>
                      <span>Data Processing Agreements with Deepgram & OpenAI</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="size-2 rounded-full bg-green-500"></span>
                      <span>End-to-end encryption for all transmissions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
              <div className="flex items-start space-x-4">
                <div className="shrink-0 rounded-lg bg-blue-100 p-2">
                  <FileCheck className="size-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">NZ Compliance & Standards</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center space-x-2">
                      <span className="size-2 rounded-full bg-blue-500"></span>
                      <span>Privacy Act 2020 & Health Information Privacy Code compliant</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="size-2 rounded-full bg-blue-500"></span>
                      <span>Meets RNZCGP documentation standards</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="size-2 rounded-full bg-blue-500"></span>
                      <span>Ensures medico-legal compliance for NZ practice</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-purple-200 bg-purple-50 p-6">
              <div className="flex items-start space-x-4">
                <div className="shrink-0 rounded-lg bg-purple-100 p-2">
                  <Lock className="size-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">GP Data Control</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center space-x-2">
                      <span className="size-2 rounded-full bg-purple-500"></span>
                      <span>You control all your consultation data</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="size-2 rounded-full bg-purple-500"></span>
                      <span>No data used for training or commercial purposes</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="size-2 rounded-full bg-purple-500"></span>
                      <span>Export or delete your data anytime</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Trust & Design Philosophy */}
          <div className="space-y-6">
            <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-indigo-100">
                  <Eye className="size-8 text-indigo-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Designed by GPs, for GPs</h3>
                <p className="text-gray-600">
                  Every privacy decision is made with clinical practice in mind.
                  We understand the trust patients place in you.
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg bg-white/50 p-4">
                  <h4 className="mb-2 font-medium text-gray-900">Clinical Judgment First</h4>
                  <p className="text-sm text-gray-600">
                    ClinicPro never replaces your clinical judgment — it supports and enhances
                    your decision-making with contextual information.
                  </p>
                </div>

                <div className="rounded-lg bg-white/50 p-4">
                  <h4 className="mb-2 font-medium text-gray-900">Professional Liability Protection</h4>
                  <p className="text-sm text-gray-600">
                    Comprehensive documentation reduces professional liability risks while
                    maintaining the highest standards of patient care.
                  </p>
                </div>

                <div className="rounded-lg bg-white/50 p-4">
                  <h4 className="mb-2 font-medium text-gray-900">Transparency</h4>
                  <p className="text-sm text-gray-600">
                    No hidden algorithms or black boxes. You understand exactly how
                    your notes are generated and can verify every detail.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
              <Globe className="mx-auto mb-4 size-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Built for New Zealand Healthcare</h3>
              <p className="mb-4 text-gray-600">
                Understanding local regulations, medical terminology, and clinical practices
                that make NZ healthcare unique.
              </p>
              <div className="inline-flex items-center space-x-2 rounded-full border border-gray-200 bg-white px-4 py-2">
                <span className="text-sm font-medium text-gray-700">Privacy-first design</span>
                <span className="text-lg">🔒</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center space-y-3 rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-blue-50 px-8 py-6">
            <div className="flex items-center space-x-2">
              <Shield className="size-5 text-green-600" />
              <span className="text-lg font-semibold text-gray-900">Trust. Privacy. Clinical Excellence.</span>
            </div>
            <p className="max-w-lg text-sm text-gray-600">
              Built by a practicing NZ GP who understands the importance of patient confidentiality
              and the trust placed in healthcare professionals.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
