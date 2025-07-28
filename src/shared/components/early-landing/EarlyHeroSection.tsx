'use client';

import { ArrowRight, Globe, Lock, Mic, Smartphone, Zap } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';

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
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">

          {/* Left Column - Content */}
          <div className="flex flex-col justify-center text-center lg:text-left">
            {/* Trust Badge */}
            <div className="mb-6">
              <div className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                🩺 Built by a Practising NZ GP
              </div>
            </div>

            {/* Headline */}
            <h1 className="mb-6 leading-tight text-gray-900">
              <span className="block text-3xl font-bold tracking-tight text-gray-800 lg:text-4xl xl:text-5xl">
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">ClinicPro</span>
                {' '}
                turns consults into
              </span>
              <span className="mt-2 block text-4xl font-black tracking-tight text-green-600 lg:text-6xl xl:text-7xl">Notes </span>
              <span className="block text-4xl font-black tracking-tight text-green-600 lg:text-6xl xl:text-7xl">in Seconds.</span>
            </h1>

            {/* Subtitle */}
            <p className="mb-8 text-lg text-gray-600 lg:text-xl">
              Join other NZ GPs making note-taking smarter and faster.
            </p>

            {/* Benefits */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3 lg:justify-start">
                <div className="flex size-6 items-center justify-center rounded-full bg-green-100">
                  <Zap className="size-3 text-green-600" />
                </div>
                <span className="text-gray-700">Browser-based, private & GP-safe</span>
              </div>
              <div className="flex items-center justify-center gap-3 lg:justify-start">
                <div className="flex size-6 items-center justify-center rounded-full bg-blue-100">
                  <Smartphone className="size-3 text-blue-600" />
                </div>
                <span className="text-gray-700">Phone recording via QR scan</span>
              </div>
              <div className="flex items-center justify-center gap-3 lg:justify-start">
                <div className="flex size-6 items-center justify-center rounded-full bg-green-100">
                  <Mic className="size-3 text-green-600" />
                </div>
                <span className="text-gray-700">Notes ready in moments</span>
              </div>
              <div className="flex items-center justify-center gap-3 lg:justify-start">
                <div className="flex size-6 items-center justify-center rounded-full bg-blue-100">
                  <Lock className="size-3 text-blue-600" />
                </div>
                <span className="text-gray-700">Built for NZ consultations</span>
              </div>
              <div className="flex items-center justify-center gap-3 lg:justify-start">
                <div className="flex size-6 items-center justify-center rounded-full bg-green-100">
                  <Globe className="size-3 text-green-600" />
                </div>
                <span className="text-gray-700">Less admin. More life.</span>
              </div>
            </div>

            {/* Mobile Image - Between Benefits and CTA */}
            <div className="my-8 lg:hidden">
              <div className="relative">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 shadow-2xl">
                  <img
                    src="/images/landing-page/hero-image.png"
                    alt="ClinicPro AI Medical Scribe Interface"
                    className="size-full object-cover"
                  />
                </div>
                {/* Mobile Decorative elements */}
                <div className="absolute -right-4 -top-4 size-8 rounded-full bg-blue-500/30"></div>
                <div className="absolute -bottom-4 -left-4 size-6 rounded-full bg-green-500/40"></div>
                <div className="absolute -left-6 top-1/2 size-4 rounded-full bg-purple-500/35"></div>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image - Desktop Only */}
          <div className="hidden lg:flex lg:items-center lg:justify-center">
            <div className="relative">
              <div className="aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 shadow-2xl">
                <img
                  src="/images/landing-page/hero-image.png"
                  alt="ClinicPro AI Medical Scribe Interface"
                  className="size-full object-cover"
                />
              </div>
              {/* Desktop Decorative elements around image */}
              <div className="absolute -right-4 -top-4 size-8 rounded-full bg-blue-500/30"></div>
              <div className="absolute -bottom-4 -left-4 size-6 rounded-full bg-green-500/40"></div>
              <div className="absolute -left-6 top-1/2 size-4 rounded-full bg-purple-500/35"></div>
              <div className="absolute -right-2 top-1/3 size-5 rounded-full bg-indigo-500/25"></div>
              <div className="absolute -bottom-2 right-1/4 size-7 rounded-full bg-cyan-400/20"></div>
            </div>
          </div>

        </div>

        {/* CTA Buttons - Centered at Bottom */}
        <div className="mt-16 flex flex-col items-center gap-6 text-center">
          <Button
            onClick={handleSuperEarlyClick}
            disabled={isLoading}
            className="hover:shadow-3xl w-full max-w-sm bg-green-600 px-4 py-3 text-sm font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-green-700 sm:max-w-lg sm:px-6 sm:py-4 sm:text-base lg:max-w-xl lg:px-8 lg:py-5 lg:text-lg"
          >
            {isLoading
              ? 'Loading...'
              : (
                  <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
                    <span className="whitespace-nowrap">
                      Join Super Early
                      {' '}
                      <span className="hidden sm:inline">— Only</span>
                      <span className="sm:hidden">—</span>
                      {' '}
                      15 Spots
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-green-200 line-through sm:text-sm">NZ$89</span>
                      <span className="text-xs sm:text-sm">→</span>
                      <span className="text-xs font-bold sm:text-sm">NZ$30/mo</span>
                      <ArrowRight className="ml-1 size-3 sm:size-4" />
                    </div>
                  </div>
                )}
          </Button>

          <a
            href="/consultation"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            See How It Works — Demo Version
          </a>
        </div>
      </div>
    </section>
  );
};
