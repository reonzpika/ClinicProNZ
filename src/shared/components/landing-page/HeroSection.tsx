'use client';

import { Clock, FileText, Shield } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { EmailCaptureModal } from '@/shared/components/EmailCaptureModal';
import { Button } from '@/shared/components/ui/button';

export const HeroSection = () => {
  const [showEmailModal, setShowEmailModal] = useState(false);

  return (
    <>
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-5xl lg:text-6xl">
                Overwhelmed by Paperwork and Complex Consults?
                <span className="mt-2 block text-blue-600">Get Your Time Back.</span>
              </h1>

              <p className="mb-8 text-xl leading-relaxed text-gray-600">
                Designed by a New Zealand GP to help you finish notes faster, improve patient safety, and reduce burnout.
                <span className="mt-2 block font-medium text-gray-700">
                  Unlike generic solutions, built specifically for NZ healthcare.
                </span>
              </p>

              <div className="mb-8 space-y-4">
                <div className="flex items-center justify-center space-x-3 lg:justify-start">
                  <Clock className="size-5 shrink-0 text-green-500" />
                  <span className="text-lg">
                    <strong>Finish notes in under 1 minute</strong>
                    {' — '}
                    reliably and accurately
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-3 lg:justify-start">
                  <FileText className="size-5 shrink-0 text-green-500" />
                  <span className="text-lg">
                    <strong>Focus on patients, not paperwork</strong>
                    {' — '}
                    no more staying late for notes
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-3 lg:justify-start">
                  <Shield className="size-5 shrink-0 text-green-500" />
                  <span className="text-lg">
                    <strong>NZ-aligned clinical support</strong>
                    {' — '}
                    safer decisions, better documentation
                  </span>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                <Button
                  size="lg"
                  className="bg-blue-600 px-8 py-4 text-lg text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl"
                  onClick={() => setShowEmailModal(true)}
                >
                  Get Free Access (Limited Time)
                </Button>
              </div>

              <p className="mt-4 text-center text-sm text-gray-500 lg:text-left">
                <span className="font-medium">No commitment</span>
                {' '}
                — keep me posted on your progress
              </p>
            </div>

            <div className="relative space-y-6">
              {/* Hero Image - Top */}
              <div className="relative">
                <div className="hover:shadow-3xl group relative mx-auto max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all duration-300">
                  <Image
                    src="/images/landing-page/hero-image.png"
                    alt="GP consultation with patient - professional healthcare setting"
                    width={500}
                    height={250}
                    className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    priority
                  />
                  {/* Subtle overlay with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

                  {/* Title on bottom left of image */}
                  <div className="absolute bottom-4 left-4">
                    <div className="rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-gray-800 shadow-lg backdrop-blur-sm">
                      Intelligent Note Generation
                    </div>
                  </div>
                </div>

                {/* Powered by ClinicPro - Crossing border */}
                <div className="absolute -bottom-3 -right-3 z-10 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                  ⚡ Powered by ClinicPro
                </div>

                {/* Decorative elements around hero image */}
                <div className="absolute -right-3 -top-3 size-6 animate-pulse rounded-full bg-blue-400/60"></div>
                <div className="absolute -bottom-2 -left-2 size-4 animate-pulse rounded-full bg-green-400/60 delay-1000"></div>
                <div className="absolute -left-4 top-1/2 size-5 animate-pulse rounded-full bg-purple-400/60 delay-500"></div>
                <div className="delay-1500 absolute -right-4 top-1/4 size-3 animate-pulse rounded-full bg-indigo-400/60"></div>
              </div>

              {/* Demo Component - Bottom */}
              <div className="relative">
                <div className="mx-auto max-w-lg overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl">
                  {/* Content */}
                  <div className="relative z-10 p-8">
                    <div className="pt-2">
                      <h4 className="mb-3 font-semibold text-gray-900">Key Capabilities:</h4>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <span className="size-2 rounded-full bg-green-500"></span>
                          <span>Handles multi-problem consultations seamlessly</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="size-2 rounded-full bg-blue-500"></span>
                          <span>Custom vital prefixes (e.g. \bp \p for PMS integration)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="size-2 rounded-full bg-purple-500"></span>
                          <span>Fully customizable templates and structure</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="size-2 rounded-full bg-orange-500"></span>
                          <span>NZ medical terminology and abbreviations</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="size-2 rounded-full bg-indigo-500"></span>
                          <span>Clinical reasoning and decision support</span>
                        </div>
                      </div>

                      {/* Start Recording Button */}
                      <div className="mt-6 text-center">
                        <Button className="rounded-full bg-red-500 px-6 py-3 text-white shadow-lg transition-colors hover:bg-red-600">
                          🎤 Start Recording
                        </Button>
                      </div>

                      {/* RNZCGP Standards - Moved below button */}
                      <div className="mt-4 text-center text-xs text-gray-500">
                        ✓ Meets RNZCGP documentation standards
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative elements around demo */}
                <div className="absolute -right-2 -top-2 size-4 animate-pulse rounded-full bg-purple-400/60 delay-500"></div>
                <div className="delay-1500 absolute -bottom-3 -left-3 size-5 animate-pulse rounded-full bg-indigo-400/60"></div>
                <div className="absolute -right-4 top-1/2 size-3 animate-pulse rounded-full bg-green-400/60 delay-1000"></div>
              </div>

              {/* Floating feature badge */}
              <div className="absolute -left-4 -top-4 z-20 rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-white shadow-lg">
                Built for NZ GPs
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
