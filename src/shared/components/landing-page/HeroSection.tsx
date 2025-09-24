'use client';

import { Clock, Eye, FileText } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { EmailCaptureModal } from '@/src/shared/components/EmailCaptureModal';
import { Button } from '@/src/shared/components/ui/button';

export const HeroSection = () => {
  const [showEmailModal, setShowEmailModal] = useState(false);

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

      <section className="relative overflow-hidden bg-white py-16 sm:py-24 lg:py-32">
        {/* Sophisticated background with subtle patterns - contained for mobile */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
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

        {/* Enhanced Visual Elements - contained within viewport */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Large artistic orbs - scaled for mobile */}
          <div className="absolute -right-32 -top-32 size-[400px] rounded-full bg-gradient-to-br from-blue-200/15 to-indigo-300/10 blur-3xl sm:-right-40 sm:-top-40 sm:size-[600px]"></div>
          <div className="absolute -bottom-48 -left-48 size-[500px] rounded-full bg-gradient-to-tr from-blue-100/20 to-cyan-200/15 blur-3xl sm:-bottom-60 sm:-left-60 sm:size-[700px]"></div>

          {/* Medium floating shapes - mobile optimized */}
          <div className="absolute right-[10%] top-[15%] size-32 rounded-full bg-gradient-to-r from-indigo-200/20 to-purple-300/15 blur-2xl sm:right-[15%] sm:top-[20%] sm:size-48"></div>
          <div className="absolute bottom-1/4 left-[15%] size-28 rounded-full bg-gradient-to-r from-cyan-200/15 to-blue-300/10 blur-xl sm:left-[20%] sm:size-40"></div>
          <div className="absolute right-[35%] top-[55%] size-24 rounded-full bg-gradient-to-r from-blue-300/10 to-indigo-200/15 blur-xl sm:right-[40%] sm:top-[60%] sm:size-36"></div>

          {/* New Zealand Silhouette - Subtle Background Element */}
          <div className="absolute bottom-8 left-8 opacity-[0.20] sm:bottom-12 sm:left-12 lg:bottom-16 lg:left-16">
            <div className="relative size-48 sm:size-64 lg:size-80">
              <Image
                src="/images/landing-page/NewZealandSilhouette .png"
                alt=""
                fill
                className="object-contain opacity-50 grayscale"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Geometric accent shapes - mobile friendly positioning */}
          <div className="absolute right-1/4 top-[30%] size-6 rounded-full bg-blue-400/35 sm:top-[35%] sm:size-8"></div>
          <div className="absolute left-1/4 top-[65%] size-4 rounded-full bg-indigo-400/30 sm:left-[30%] sm:top-[70%] sm:size-6"></div>
          <div className="absolute bottom-[35%] right-[55%] size-3 rounded-full bg-cyan-400/40 sm:bottom-[40%] sm:right-[60%] sm:size-4"></div>
          <div className="absolute left-[10%] top-[40%] size-4 rounded-full bg-purple-400/25 sm:left-[15%] sm:top-[45%] sm:size-5"></div>

          {/* Elegant line elements - shortened for mobile */}
          <div className="absolute right-[15%] top-[10%] h-16 w-px bg-gradient-to-b from-transparent via-blue-300/25 to-transparent sm:right-[20%] sm:top-[15%] sm:h-24"></div>
          <div className="absolute bottom-1/4 left-1/4 h-20 w-px bg-gradient-to-b from-transparent via-indigo-300/20 to-transparent sm:bottom-[30%] sm:h-32"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Enhanced Content Column */}
            <div className="text-center lg:text-left">
              {/* Stylish Trust Badge - moved to top */}
              <div className="mb-8 flex justify-center lg:justify-start">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-green-200 to-emerald-200 opacity-30 blur"></div>
                  <div className="relative inline-flex items-center rounded-full border border-green-200/50 bg-green-50/80 px-4 py-2 text-sm font-medium text-green-700 backdrop-blur-sm sm:px-5 sm:py-2.5">
                    🩺 Built by a Practicing NZ GP
                  </div>
                </div>
              </div>

              {/* Dramatic Main Headline */}
              <div className="mb-8">
                <div className="relative pb-4 pt-2">
                  {/* Decorative accent behind headline */}
                  <div className="absolute -left-2 top-2 h-12 w-0.5 bg-gradient-to-b from-blue-500 to-indigo-600 sm:h-16 lg:-left-4 lg:h-20"></div>

                  <h1 className="relative text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                    <span className="block">More Than a Scribe.</span>
                    <span className="block text-blue-600">Built for NZ GPs.</span>
                  </h1>

                  {/* Stylish accent elements - mobile positioned */}
                  <div className="absolute -right-4 top-4 size-2 rounded-full bg-blue-400 sm:size-3 lg:-right-8"></div>
                  <div className="absolute -right-2 top-10 size-1.5 rounded-full bg-indigo-400 sm:size-2 lg:-right-4 lg:top-16"></div>
                </div>
              </div>

              {/* Stylish Subtitle */}
              <div className="relative mb-8">
                <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl lg:mx-0 lg:text-2xl">
                  ClinicPro gives you more control:
                </p>
                <ul className="mx-auto mt-3 max-w-2xl list-disc pl-5 text-base leading-relaxed text-gray-600 sm:text-lg lg:mx-0 lg:text-xl">
                  <li>Specify problems, add notes on the fly</li>
                  <li>Upload and resize lesion images instantly during the consult</li>
                  <li>Chat with trusted NZ health resources</li>
                </ul>
                <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-gray-500 sm:text-lg lg:mx-0 lg:text-xl">
                  All in one smart tool.
                </p>

                {/* Decorative line accent - mobile friendly */}
                <div className="absolute -left-1 top-4 h-px w-8 bg-gradient-to-r from-blue-400 to-transparent sm:w-12 lg:-left-2"></div>
              </div>

              {/* Stylish Primary CTA */}
              <div className="mb-8">
                <div className="relative inline-block">
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur-lg sm:-inset-2 sm:rounded-2xl"></div>
                  <Button
                    size="lg"
                    className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-base font-semibold text-white shadow-xl transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-2xl sm:px-8 sm:py-4 sm:text-lg lg:px-10 lg:py-5"
                    onClick={() => setShowEmailModal(true)}
                  >
                    Get more done in 15 min
                  </Button>
                </div>
              </div>

              <p className="mb-8 text-center text-sm text-gray-600 sm:text-base lg:text-left">
                <span className="font-medium text-blue-600">Be among the first 30 NZ GPs</span>
                <span className="block text-gray-500 sm:inline"> — Help shape the future of clinical documentation</span>
              </p>

              {/* Mobile Benefits - shown before image */}
              <div className="mb-8 space-y-4 lg:hidden">
                <div className="group relative overflow-hidden rounded-2xl border border-green-200/50 bg-white/95 p-4 shadow-lg transition-all duration-300 hover:shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50/40 via-transparent to-emerald-50/30 opacity-60"></div>
                  <div className="relative z-10 flex items-start space-x-4">
                    <div className="shrink-0">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-green-100 shadow-lg">
                        <Clock className="size-6 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 sm:text-lg">Handle complex multi-problem consultations with ease</h3>
                      <p className="text-sm text-gray-600 sm:text-base">structured notes for every scenario</p>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-blue-200/50 bg-white/95 p-4 shadow-lg transition-all duration-300 hover:shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-indigo-50/30 opacity-60"></div>
                  <div className="relative z-10 flex items-start space-x-4">
                    <div className="shrink-0">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 shadow-lg">
                        <FileText className="size-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 sm:text-lg">Finish notes in under 1 minute</h3>
                      <p className="text-sm text-gray-600 sm:text-base">reliably and accurately</p>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-purple-200/50 bg-white/95 p-4 shadow-lg transition-all duration-300 hover:shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/40 via-transparent to-violet-50/30 opacity-60"></div>
                  <div className="relative z-10 flex items-start space-x-4">
                    <div className="shrink-0">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-purple-100 shadow-lg">
                        <Eye className="size-6 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 sm:text-lg">Focus on patients, not paperwork</h3>
                      <p className="text-sm text-gray-600 sm:text-base">leave the clinic on time</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Image on Mobile - shown after CTA text */}
              <div className="mb-8 lg:hidden">
                <div className="relative">
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 shadow-2xl">
                    <Image
                      src="/images/landing-page/hero-image.png"
                      alt="ClinicPro AI Medical Scribe Interface"
                      fill
                      className="object-cover"
                      priority
                    />

                    {/* Overlay Text on Image - Updated to match screenshot */}
                    <div className="absolute left-4 top-4">
                      <div className="relative rounded-xl border border-white/30 bg-white/90 px-3 py-2 text-left backdrop-blur-sm sm:px-4 sm:py-3">
                        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-400/10 to-indigo-400/10 blur-sm"></div>
                        <p className="relative text-xs font-semibold text-gray-800 sm:text-sm">
                          <span className="text-orange-600">✨ Intelligent Note Generation</span>
                        </p>
                      </div>
                    </div>

                    <div className="absolute bottom-4 right-4">
                      <div className="relative rounded-xl border border-white/30 bg-blue-600/90 px-3 py-2 text-right backdrop-blur-sm sm:px-4 sm:py-3">
                        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-400/20 to-indigo-400/20 blur-sm"></div>
                        <p className="relative text-xs font-semibold text-white sm:text-sm">
                          <span>⚡ Powered by ClinicPro</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Decorative floating elements around mobile image */}
                  <div className="absolute -right-4 -top-4 size-8 rounded-full bg-cyan-400/30"></div>
                  <div className="absolute -left-6 -top-2 size-6 rounded-full bg-blue-500/25"></div>
                  <div className="absolute -bottom-3 -left-4 size-10 rounded-full bg-indigo-400/20"></div>
                  <div className="absolute -bottom-6 -right-2 size-4 rounded-full bg-purple-500/35"></div>
                  <div className="absolute -left-8 top-1/3 size-5 rounded-full bg-emerald-400/30"></div>
                  <div className="absolute -right-6 top-1/2 size-7 rounded-full bg-blue-600/25"></div>
                </div>
              </div>
            </div>

            {/* Hero Image Column - Desktop Only */}
            <div className="hidden lg:block">
              <div className="relative mb-8">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 shadow-2xl">
                  <Image
                    src="/images/landing-page/hero-image.png"
                    alt="ClinicPro AI Medical Scribe Interface"
                    fill
                    className="object-cover"
                    priority
                  />

                  {/* Overlay Text on Image - Updated to match screenshot */}
                  <div className="absolute left-6 top-6">
                    <div className="relative rounded-xl border border-white/30 bg-white/90 px-4 py-3 text-left backdrop-blur-sm">
                      <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-400/10 to-indigo-400/10 blur-sm"></div>
                      <p className="relative text-sm font-semibold text-gray-800 lg:text-base">
                        <span className="text-orange-600">✨ Intelligent Note Generation</span>
                      </p>
                    </div>
                  </div>

                  <div className="absolute bottom-6 right-6">
                    <div className="relative rounded-xl border border-white/30 bg-blue-600/90 px-4 py-3 text-right backdrop-blur-sm">
                      <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-400/20 to-indigo-400/20 blur-sm"></div>
                      <p className="relative text-sm font-semibold text-white lg:text-base">
                        <span>⚡ Powered by ClinicPro</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enhanced decorative floating elements around desktop image - matching screenshot */}
                <div className="absolute -right-6 -top-6 size-12 rounded-full bg-cyan-400/30"></div>
                <div className="absolute -left-8 -top-4 size-8 rounded-full bg-blue-500/25"></div>
                <div className="absolute -bottom-4 -left-6 size-14 rounded-full bg-indigo-400/20"></div>
                <div className="absolute -bottom-8 -right-4 size-6 rounded-full bg-purple-500/35"></div>
                <div className="absolute -left-12 top-1/3 size-7 rounded-full bg-emerald-400/30"></div>
                <div className="absolute -right-10 top-1/2 size-10 rounded-full bg-blue-600/25"></div>
                <div className="absolute -top-8 left-1/4 size-5 rounded-full bg-orange-400/40"></div>
                <div className="absolute -bottom-6 right-1/3 size-9 rounded-full bg-pink-400/25"></div>
                <div className="absolute -left-6 bottom-1/4 size-4 rounded-full bg-teal-500/35"></div>
                <div className="absolute -right-4 top-1/4 size-11 rounded-full bg-violet-400/20"></div>
              </div>

              {/* Enhanced Desktop Benefits Below Image */}
              <div className="space-y-6">
                <div className="group relative overflow-hidden rounded-2xl border border-green-200/50 bg-white/95 p-6 shadow-xl transition-all duration-300 hover:shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50/40 via-transparent to-emerald-50/30 opacity-60"></div>
                  <div className="relative z-10 flex items-start space-x-4">
                    <div className="shrink-0">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-green-100 shadow-lg">
                        <Clock className="size-6 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Handle complex multi-problem consultations with ease</h3>
                      <p className="text-base text-gray-600">structured notes for every scenario</p>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-blue-200/50 bg-white/95 p-6 shadow-xl transition-all duration-300 hover:shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-indigo-50/30 opacity-60"></div>
                  <div className="relative z-10 flex items-start space-x-4">
                    <div className="shrink-0">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 shadow-lg">
                        <FileText className="size-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Finish notes in under 1 minute</h3>
                      <p className="text-base text-gray-600">reliably and accurately</p>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-purple-200/50 bg-white/95 p-6 shadow-xl transition-all duration-300 hover:shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/40 via-transparent to-violet-50/30 opacity-60"></div>
                  <div className="relative z-10 flex items-start space-x-4">
                    <div className="shrink-0">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-purple-100 shadow-lg">
                        <Eye className="size-6 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Focus on patients, not paperwork</h3>
                      <p className="text-base text-gray-600">leave the clinic on time</p>
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
