'use client';

import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import Image from 'next/image';

import Aurora from './Aurora';

export const EarlyHeroSection = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSuperEarlyClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: 'standard',
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else if (response.status === 401) {
        // Public user needs to sign up first
        window.location.href = '/auth/register?redirect=upgrade';
      } else {
        console.error('Failed to create checkout session');
        // TODO: Replace with proper toast notification
        console.error('Something went wrong. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      // TODO: Replace with proper toast notification
      console.error('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
        <section className="relative min-h-screen bg-gray-900 py-20 motion-reduce:transition-none motion-reduce:duration-0 lg:py-28">
      {/* Aurora Background */}
      <div className="absolute inset-0 opacity-90">
        <div className="motion-reduce:hidden">
          <Aurora
            colorStops={['#3b82f6', '#22c55e', '#06b6d4']}
            blend={0.8}
            amplitude={1.5}
            speed={0.4}
          />
        </div>
        <div className="absolute inset-0 hidden bg-gradient-to-br from-nz-blue-700/40 via-nz-green-700/30 to-gray-900/60 motion-reduce:block"></div>
      </div>

      {/* Light overlay for better text readability */}
      <div className="absolute inset-0 bg-gray-900/20"></div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
              <p className="mb-3">ClinicPro gives you more control:</p>
              <ul className="ml-5 list-disc space-y-2">
                <li>Specify problems, add additional note</li>
                <li>Upload and resize lesion images instantly during the consult</li>
                <li>Chat with trusted NZ health resources</li>
              </ul>
            </div>

            {/* Mobile Image - Between Benefits and CTA */}
            <div className="my-8 lg:hidden">
              <div className="relative">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gray-600/30 bg-gradient-to-br from-gray-800 to-gray-700 shadow-2xl">
                  <div className="group relative size-full">
                    <Image
                      src="/images/landing-page/hero-image.png"
                      alt="ClinicPro AI Medical Scribe Interface"
                      width={1280}
                      height={960}
                      sizes="100vw"
                      priority
                      className="h-auto w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                    />
                    {/* 2025 Trend: Video Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/20 opacity-0 transition-all duration-500 group-hover:opacity-100">
                      <button className="rounded-full bg-white/10 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20">
                        <div className="flex size-8 items-center justify-center rounded-full bg-green-500 shadow-lg">
                          <div className="ml-1 size-0 border-y-8 border-l-[12px] border-y-transparent border-l-white"></div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column - Hero Image - Desktop Only */}
          <div className="hidden lg:flex lg:items-center lg:justify-center">
            <div className="relative">
              <div className="relative aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl border border-gray-600/30 bg-gradient-to-br from-gray-800 to-gray-700 shadow-2xl">
                <div className="group relative size-full">
                  <Image
                    src="/images/landing-page/hero-image.png"
                    alt="ClinicPro AI Medical Scribe Interface"
                    width={1200}
                    height={900}
                    sizes="(max-width: 1280px) 50vw, 600px"
                    className="h-auto w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* 2025 Trend: Video Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/20 opacity-0 transition-all duration-500 group-hover:opacity-100">
                    <button className="rounded-full bg-white/10 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20">
                      <div className="flex size-10 items-center justify-center rounded-full bg-green-500 shadow-lg">
                        <div className="ml-1 size-0 border-y-[10px] border-l-[15px] border-y-transparent border-l-white"></div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

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
