'use client';

import { ChevronDown, Clock, Eye, FileText } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { EmailCaptureModal } from '@/shared/components/EmailCaptureModal';
import { Button } from '@/shared/components/ui/button';

export const HeroSection = () => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);

  return (
    <>
      {/* Enhanced Shocking Statistic Banner with brand colors */}
      <div className="border-b-2 border-red-300 bg-gradient-to-r from-red-100 to-orange-100 py-3 sm:py-4">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-medium text-red-800 sm:text-base">
              <span className="font-bold text-red-900">⚠️ 79% of NZ GPs report burnout</span>
              <span className="hidden text-red-700 xs:inline"> — </span>
              <a
                href="https://www.rnzcgp.org.nz/our-voice/workforce-survey/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block font-semibold text-blue-600 underline hover:text-blue-700 xs:mt-0 xs:inline"
              >
                RNZCGP Workforce Survey
              </a>
            </p>
          </div>
        </div>
      </div>

      <section className="relative overflow-visible bg-white py-16 sm:py-24 lg:py-32">
        {/* Sophisticated background with subtle patterns */}
        <div className="pointer-events-none absolute inset-0">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/20"></div>

          {/* Elegant geometric pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>
        </div>

        {/* Enhanced Visual Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Large artistic orbs */}
          <div className="absolute -right-40 -top-40 size-[600px] rounded-full bg-gradient-to-br from-blue-200/20 to-indigo-300/15 blur-3xl"></div>
          <div className="absolute -bottom-60 -left-60 size-[700px] rounded-full bg-gradient-to-tr from-blue-100/25 to-cyan-200/20 blur-3xl"></div>

          {/* Medium floating shapes */}
          <div className="absolute right-[15%] top-[20%] size-48 rounded-full bg-gradient-to-r from-indigo-200/25 to-purple-300/20 blur-2xl"></div>
          <div className="absolute bottom-1/4 left-[20%] size-40 rounded-full bg-gradient-to-r from-cyan-200/20 to-blue-300/15 blur-xl"></div>
          <div className="absolute right-[40%] top-[60%] size-36 rounded-full bg-gradient-to-r from-blue-300/15 to-indigo-200/20 blur-xl"></div>

          {/* Geometric accent shapes */}
          <div className="absolute right-1/4 top-[35%] size-8 rounded-full bg-blue-400/40"></div>
          <div className="absolute left-[30%] top-[70%] size-6 rounded-full bg-indigo-400/35"></div>
          <div className="absolute bottom-[40%] right-[60%] size-4 rounded-full bg-cyan-400/45"></div>
          <div className="absolute left-[15%] top-[45%] size-5 rounded-full bg-purple-400/30"></div>

          {/* Elegant line elements */}
          <div className="absolute right-[20%] top-[15%] h-24 w-px bg-gradient-to-b from-transparent via-blue-300/30 to-transparent"></div>
          <div className="absolute bottom-[30%] left-1/4 h-32 w-px bg-gradient-to-b from-transparent via-indigo-300/25 to-transparent"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
          <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Enhanced Content Column */}
            <div className="order-2 text-center lg:order-1 lg:text-left">
              {/* Stylish Trust Badge */}
              <div className="mb-12 flex justify-center lg:justify-start">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-green-200 to-emerald-200 opacity-30 blur"></div>
                  <div className="relative inline-flex items-center rounded-full border border-green-200/50 bg-green-50/80 px-5 py-2.5 text-sm font-medium text-green-700 backdrop-blur-sm">
                    🩺 Built by a Practicing NZ GP
                  </div>
                </div>
              </div>

              {/* Dramatic Main Headline */}
              <div className="mb-12">
                <div className="relative pb-6 pt-4">
                  {/* Decorative accent behind headline */}
                  <div className="absolute -left-4 top-4 h-16 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 lg:-left-8 lg:h-20"></div>

                  <h1 className="relative text-5xl font-extrabold leading-relaxed tracking-tight text-gray-900 sm:text-6xl lg:text-7xl xl:text-8xl">
                    <span className="block">Stop Working</span>
                    <span className="block text-blue-600">Afterhours.</span>
                    <span className="mt-2 block text-4xl font-bold text-gray-700 sm:mt-4 sm:text-5xl lg:text-6xl xl:text-7xl">
                      Get Your Time Back.
                    </span>
                  </h1>

                  {/* Stylish accent elements */}
                  <div className="absolute -right-8 top-8 size-3 rounded-full bg-blue-400 lg:-right-12"></div>
                  <div className="absolute -right-4 top-16 size-2 rounded-full bg-indigo-400 lg:-right-6"></div>
                </div>
              </div>

              {/* Stylish Subtitle */}
              <div className="relative mb-12">
                <p className="mx-auto max-w-2xl text-xl leading-relaxed text-gray-600 lg:mx-0 lg:text-2xl">
                  The AI medical scribe built specifically for
                  <span className="font-semibold text-blue-600"> NZ healthcare</span>
                  .
                </p>
                <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-500 lg:mx-0 lg:text-xl">
                  Finally, documentation that works
                  <span className="font-semibold text-green-600"> with you, not against you</span>
                  .
                </p>

                {/* Decorative line accent */}
                <div className="absolute -left-2 top-8 h-px w-12 bg-gradient-to-r from-blue-400 to-transparent lg:-left-4"></div>
              </div>

              {/* Stylish Primary CTA */}
              <div className="mb-10">
                <div className="relative inline-block">
                  <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur-lg"></div>
                  <Button
                    size="lg"
                    className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-10 py-5 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-2xl"
                    onClick={() => setShowEmailModal(true)}
                  >
                    Join Beta Testing (Free)
                  </Button>
                </div>
              </div>

              <p className="mb-10 text-center text-gray-600 lg:text-left">
                <span className="font-medium text-blue-600">Be among the first 30 NZ GPs</span>
                <span className="block text-gray-500 sm:inline"> — Help shape the future of clinical documentation</span>
              </p>

              {/* Clean Mobile Features */}
              <div className="lg:hidden">
                <button
                  onClick={() => setShowFeatures(!showFeatures)}
                  className="mb-6 flex w-full items-center justify-center rounded-lg bg-gray-50 px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <span>Key Benefits</span>
                  <ChevronDown className={`ml-2 size-5 transition-transform ${showFeatures ? 'rotate-180' : ''}`} />
                </button>

                <div className={`space-y-4 transition-all duration-300 ${showFeatures ? 'block' : 'hidden'}`}>
                  <div className="flex items-start space-x-4 rounded-lg border border-gray-100 bg-white p-4 text-left shadow-sm">
                    <Clock className="mt-1 size-6 shrink-0 text-green-600" />
                    <span className="text-sm">
                      <strong className="text-gray-900">Handle complex multi-problem consultations with ease</strong>
                      <span className="block text-gray-600">structured notes for every scenario</span>
                    </span>
                  </div>
                  <div className="flex items-start space-x-4 rounded-lg border border-gray-100 bg-white p-4 text-left shadow-sm">
                    <FileText className="mt-1 size-6 shrink-0 text-blue-600" />
                    <span className="text-sm">
                      <strong className="text-gray-900">Finish notes in under 1 minute</strong>
                      <span className="block text-gray-600">reliably and accurately</span>
                    </span>
                  </div>
                  <div className="flex items-start space-x-4 rounded-lg border border-gray-100 bg-white p-4 text-left shadow-sm">
                    <Eye className="mt-1 size-6 shrink-0 text-purple-600" />
                    <span className="text-sm">
                      <strong className="text-gray-900">Focus on patients, not paperwork</strong>
                      <span className="block text-gray-600">leave the clinic on time</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Stylish Desktop Features */}
              <div className="mb-10 hidden space-y-6 lg:block">
                <div className="flex items-start space-x-5">
                  <div className="shrink-0">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-green-100">
                      <Clock className="size-6 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Handle complex multi-problem consultations with ease</h3>
                    <p className="mt-1 text-gray-600">structured notes for every scenario</p>
                  </div>
                </div>

                <div className="flex items-start space-x-5">
                  <div className="shrink-0">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100">
                      <FileText className="size-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Finish notes in under 1 minute</h3>
                    <p className="mt-1 text-gray-600">reliably and accurately</p>
                  </div>
                </div>

                <div className="flex items-start space-x-5">
                  <div className="shrink-0">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-purple-100">
                      <Eye className="size-6 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Focus on patients, not paperwork</h3>
                    <p className="mt-1 text-gray-600">leave the clinic on time</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stylish Image Column */}
            <div className="relative order-1 lg:order-2">
              {/* Artistic Hero Image Container */}
              <div className="relative mx-auto max-w-lg">
                {/* Large decorative background shapes */}
                <div className="absolute -inset-8 rounded-full bg-gradient-to-br from-blue-200/15 to-indigo-300/10 blur-3xl"></div>
                <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-cyan-100/20 to-blue-200/15 blur-2xl"></div>

                {/* Geometric accent elements */}
                <div className="absolute -right-6 -top-6 size-16 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-500/15"></div>
                <div className="absolute -bottom-8 -left-8 size-20 rounded-full bg-gradient-to-tr from-cyan-300/15 to-blue-400/20"></div>
                <div className="absolute -top-4 left-8 size-12 rounded-full bg-gradient-to-r from-indigo-300/25 to-purple-400/20"></div>

                {/* Main Image with artistic styling */}
                <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-100/20"></div>
                  <Image
                    src="/images/landing-page/hero-image.png"
                    alt="GP consultation with patient - professional healthcare setting"
                    width={500}
                    height={250}
                    className="relative w-full object-cover"
                    priority
                  />

                  {/* Stylish Image Label */}
                  <div className="absolute bottom-6 left-6">
                    <div className="relative rounded-xl bg-white/90 px-5 py-3 text-sm font-medium text-gray-800 shadow-xl backdrop-blur-md">
                      <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-200/30 to-indigo-200/20 blur"></div>
                      <span className="relative">✨ Intelligent Note Generation</span>
                    </div>
                  </div>
                </div>

                {/* Stylish Branded Badge */}
                <div className="absolute -bottom-4 -right-4 z-10">
                  <div className="relative rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-xl">
                    <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-400/30 to-indigo-500/20 blur"></div>
                    <span className="relative">⚡ Powered by ClinicPro</span>
                  </div>
                </div>

                {/* Additional artistic accents */}
                <div className="absolute -right-4 top-12 size-6 rounded-full bg-blue-400/60"></div>
                <div className="absolute -left-3 bottom-16 size-4 rounded-full bg-indigo-400/70"></div>
                <div className="absolute -top-3 right-12 size-5 rounded-full bg-cyan-400/50"></div>
                <div className="absolute -bottom-2 left-12 size-3 rounded-full bg-purple-400/60"></div>

                {/* Elegant line accents */}
                <div className="absolute -right-8 top-20 h-16 w-px bg-gradient-to-b from-transparent via-blue-400/40 to-transparent"></div>
                <div className="absolute -left-6 bottom-24 h-20 w-px bg-gradient-to-b from-transparent via-indigo-400/30 to-transparent"></div>
              </div>

              {/* Clean Mobile Capabilities Card */}
              <div className="mt-8 lg:hidden">
                <div className="mx-auto max-w-sm overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                  <div className="p-6">
                    <h4 className="mb-4 text-center font-semibold text-gray-900">Key Capabilities</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <span className="size-2 rounded-full bg-green-500"></span>
                        <span>Custom templates</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="size-2 rounded-full bg-blue-500"></span>
                        <span>Referral letters</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="size-2 rounded-full bg-purple-500"></span>
                        <span>Mobile recording</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="size-2 rounded-full bg-orange-500"></span>
                        <span>Full flexibility</span>
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <Button className="w-full bg-blue-600 px-4 py-2 text-sm text-white shadow-md transition-colors hover:bg-blue-700">
                        🎤 Start Recording
                      </Button>
                    </div>

                    <div className="mt-3 text-center text-xs text-gray-500">
                      ✓ Meets RNZCGP documentation standards
                    </div>
                  </div>
                </div>
              </div>

              {/* Clean Desktop Demo Component */}
              <div className="mt-8 hidden lg:block">
                <div className="mx-auto max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                  <div className="p-6">
                    <h4 className="mb-4 font-semibold text-gray-900">Key Capabilities:</h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-center space-x-3">
                        <span className="size-2 rounded-full bg-green-500"></span>
                        <span>Fully customizable templates and structure</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="size-2 rounded-full bg-blue-500"></span>
                        <span>Generate referral letters and patient advice sheets</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="size-2 rounded-full bg-purple-500"></span>
                        <span>Clinical decision support and reasoning</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="size-2 rounded-full bg-orange-500"></span>
                        <span>Record, type, or both — complete flexibility</span>
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <Button className="bg-blue-600 px-6 py-2 text-white shadow-md transition-colors hover:bg-blue-700">
                        🎤 Start Recording
                      </Button>
                    </div>

                    <div className="mt-4 text-center text-xs text-gray-500">
                      ✓ Meets RNZCGP documentation standards
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />
    </>
  );
};
