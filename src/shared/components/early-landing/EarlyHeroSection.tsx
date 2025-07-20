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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID,
          tier: 'standard',
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        console.error('Failed to create checkout session');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-nz-green-50 via-white to-nz-blue-50 py-16 sm:py-24 lg:py-32">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="to-nz-blue-300/8 absolute -right-40 top-20 size-[500px] rounded-full bg-gradient-to-br from-nz-green-200/10 blur-3xl"></div>
        <div className="from-nz-blue-200/8 absolute -left-60 bottom-32 size-[600px] rounded-full bg-gradient-to-tr to-nz-green-300/10 blur-3xl"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Trust Badge */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-nz-green-200 to-nz-blue-200 opacity-30 blur"></div>
              <div className="relative inline-flex items-center rounded-full border border-nz-green-200/50 bg-nz-green-50/80 px-4 py-2 text-sm font-medium text-nz-green-700 backdrop-blur-sm sm:px-5 sm:py-2.5">
                🩺 Built by a Practising NZ GP
              </div>
            </div>
          </div>

          {/* Main Headline */}
          <div className="mb-8">
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">ClinicPro turns consults</span>
              <span className="block text-nz-green-600">into notes — in seconds.</span>
            </h1>
          </div>

          {/* Sub-headline */}
          <div className="mx-auto mb-12 max-w-3xl">
            <p className="text-xl text-gray-600 sm:text-2xl">
              Join other NZ GPs making note-taking smarter and faster.
            </p>
          </div>

          {/* Key Points */}
          <div className="mx-auto mb-12 max-w-4xl space-y-4">
            {[
              { icon: Zap, text: 'Works instantly in your browser — private, encrypted, and GP-safe' },
              { icon: Smartphone, text: 'Use your phone mic — no app installs, just scan and record' },
              { icon: Globe, text: 'Fast, accurate notes ready to review in moments' },
              { icon: Lock, text: 'Understands NZ consults — made by a GP, trained on local patterns' },
              { icon: Mic, text: 'Less admin. Less burnout. More life.' },
            ].map((point, index) => (
              <div key={index} className="flex items-center justify-center gap-3 text-lg text-gray-700 sm:text-xl">
                <div className="flex size-8 items-center justify-center rounded-full bg-nz-green-100">
                  <point.icon className="size-4 text-nz-green-600" />
                </div>
                <span>{point.text}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="space-y-6">
            {/* Primary CTA */}
            <div className="relative inline-block">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-nz-green-600/20 to-nz-blue-600/20 blur-lg sm:-inset-2 sm:rounded-2xl"></div>
              <Button
                size="lg"
                className="relative bg-gradient-to-r from-nz-green-600 to-nz-green-700 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:from-nz-green-700 hover:to-nz-green-800 hover:shadow-2xl sm:px-10 sm:py-5 sm:text-xl"
                onClick={handleSuperEarlyClick}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Join Super Early (NZ$30/mo) — Only 15 Spots'}
                {!isLoading && <ArrowRight className="ml-2 size-5" />}
              </Button>
            </div>

            {/* Secondary CTA */}
            <div>
              <a
                href="/consultation"
                className="inline-flex items-center rounded-lg border border-nz-blue-600 bg-white px-6 py-3 text-base font-medium text-nz-blue-600 shadow-sm transition-colors hover:bg-nz-blue-50 hover:text-nz-blue-700"
              >
                See How It Works — Demo Version
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
