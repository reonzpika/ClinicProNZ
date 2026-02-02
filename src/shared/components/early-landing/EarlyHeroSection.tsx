'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';

// Removed animated Aurora for reliability and performance

export const EarlyHeroSection = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSuperEarlyClick = async () => {
    setIsLoading(true);
    // Always send public users to sign-up, then redirect straight to clinical consultation
    window.location.href = '/auth/register?redirect_url=%2Fai-scribe%2Fconsultation';
  };

  return (
        <section className="relative min-h-screen bg-gray-900 py-20 motion-reduce:transition-none motion-reduce:duration-0 lg:py-28">
      {/* Static gradient background (simple & reliable) */}
      <div className="absolute inset-0 bg-gradient-to-br from-nz-blue-800/40 via-nz-green-800/30 to-gray-900/70"></div>

      {/* Light overlay for better text readability */}
      <div className="absolute inset-0 bg-gray-900/20"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">

          {/* Left Column - Content */}
          <div className="flex flex-col justify-center text-center lg:text-left">
            {/* Trust Badges */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <div className="inline-flex items-center rounded-full border border-green-300/30 bg-green-500/20 px-4 py-2 text-sm font-medium text-green-200">
                🩺 Built by a Practising NZ GP
              </div>
            </div>

            {/* Headline */}
            <h1 className="mb-6 leading-tight">
              <span className="block font-oswald text-4xl font-black tracking-tight text-white lg:text-6xl xl:text-7xl">
                AI scribe for NZ GPs
              </span>
            </h1>

            {/* Subtitle */}
            <div className="mb-8 text-lg text-gray-100 lg:text-xl">
              <p className="mb-3 font-open-sans text-2xl font-bold text-green-300 lg:text-3xl">and more...</p>
              <p className="mb-3">Handle complex, multi‑problem consults with ease:</p>
              <ul className="ml-5 list-disc space-y-2">
                <li>Capture by audio; add typed input when needed</li>
                <li>Get structured notes in seconds; finish on time</li>
                <li>Upload and resize clinical images during the consult</li>
                <li>AI Chat: get answers fast from trusted resources</li>
              </ul>
            </div>

            {/* Mobile Image - Between Benefits and CTA */}
            <div className="my-8 lg:hidden">
              <div className="relative h-64 overflow-hidden rounded-2xl border-4 border-white shadow-2xl sm:h-80 md:h-96">
                <Image
                  src="/images/landing-page/hero-image.png"
                  alt="ClinicPro AI Medical Scribe Interface"
                  fill
                  sizes="100vw"
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image - Desktop Only */}
          <div className="hidden lg:flex lg:items-center lg:justify-center">
            <div className="relative h-[460px] w-full max-w-lg overflow-hidden rounded-2xl border-4 border-white shadow-2xl">
              <Image
                src="/images/landing-page/hero-image.png"
                alt="ClinicPro AI Medical Scribe Interface"
                fill
                sizes="(max-width: 1280px) 50vw, 600px"
                className="object-cover"
              />
            </div>
          </div>

        </div>

        {/* CTA Buttons - Centered at Bottom */}
        <div className="mt-20 flex flex-col items-center gap-8 text-center">
          <Button
            onClick={handleSuperEarlyClick}
            disabled={isLoading}
            className="hover:shadow-3xl group w-full max-w-sm rounded-xl bg-orange-600 px-6 py-4 text-sm font-bold text-white shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-orange-700 hover:shadow-orange-500/25 active:translate-y-0 active:scale-100 motion-reduce:transform-none motion-reduce:transition-none sm:max-w-lg sm:px-8 sm:py-5 sm:text-base lg:max-w-xl lg:px-10 lg:py-6 lg:text-lg"
          >
            {isLoading
              ? 'Loading...'
              : (
                  <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
                    <span className="whitespace-nowrap">Get more done in 15 min</span>
                    <ArrowRight className="ml-1 size-3 transition-transform duration-300 group-hover:translate-x-1 sm:size-4" />
                  </div>
                )}
          </Button>
        </div>

        {/* 2025 Trend: Sticky Mobile CTA - Fixed Position */}
        <div className="fixed inset-x-4 bottom-4 z-50 md:hidden">
          <Button
            onClick={handleSuperEarlyClick}
            disabled={isLoading}
            className="group w-full rounded-xl border border-orange-500/20 bg-orange-600 px-6 py-4 text-sm font-bold text-white shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:bg-orange-700 hover:shadow-orange-500/30 active:scale-100"
          >
            {isLoading
              ? 'Loading...'
              : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Get more done in 15 min</span>
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                )}
          </Button>
        </div>
      </div>
        </section>
  );
};
