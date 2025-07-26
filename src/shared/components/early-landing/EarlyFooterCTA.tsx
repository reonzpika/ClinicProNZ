'use client';

import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';

export const EarlyFooterCTA = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinClick = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    <section className="relative bg-gradient-to-br from-nz-green-600 via-nz-green-700 to-nz-blue-700 py-16 sm:py-24 lg:py-32">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="to-nz-blue-300/8 absolute -right-40 top-20 size-[500px] rounded-full bg-gradient-to-br from-white/10 blur-3xl"></div>
        <div className="from-nz-blue-200/8 absolute -left-60 bottom-32 size-[600px] rounded-full bg-gradient-to-tr to-white/10 blur-3xl"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Headline */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="block">Spend less time on notes —</span>
              <span className="block text-nz-green-100">and take back your day.</span>
            </h2>
          </div>

          {/* Supporting Text */}
          <div className="mx-auto mb-12 max-w-3xl">
            <p className="text-xl text-nz-green-100 sm:text-2xl">
              Join the first 15 NZ GPs who are transforming their practice with ClinicPro.
            </p>
            <p className="mt-4 text-lg text-nz-green-200">
              Your time with family and patients matters more than paperwork.
            </p>
          </div>

          {/* CTA Button */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-white/30 to-nz-green-300/30 blur-lg sm:-inset-2 sm:rounded-2xl"></div>
              <Button
                size="lg"
                onClick={handleJoinClick}
                disabled={isLoading}
                className="relative bg-white px-8 py-4 text-lg font-semibold text-nz-green-700 shadow-xl transition-all duration-300 hover:bg-nz-green-50 hover:shadow-2xl sm:px-10 sm:py-5 sm:text-xl"
              >
                {isLoading ? 'Loading...' : 'Join Super Early (NZ$30/mo) — Only 15 Spots Available'}
                {!isLoading && <ArrowRight className="ml-2 size-5" />}
              </Button>
            </div>
          </div>

          {/* Trust Elements */}
          <div className="space-y-4">
            <p className="text-sm text-nz-green-200">
              No setup fees • Cancel anytime • Price locked for 12 months
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-nz-green-200">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-nz-green-300"></div>
                <span>Built by a practicing NZ GP</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-nz-green-300"></div>
                <span>Privacy Act 2020 compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-nz-green-300"></div>
                <span>Direct founder support</span>
              </div>
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="mt-12">
            <a
              href="/consultation"
              className="inline-flex items-center rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-base font-medium text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              See How It Works — Demo Version
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
