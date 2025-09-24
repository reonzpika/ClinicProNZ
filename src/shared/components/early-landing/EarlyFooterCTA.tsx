'use client';

import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

import AnimatedContent from '@/src/shared/components/AnimatedContent';
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
    <section className="relative bg-gradient-to-br from-nz-green-500 via-nz-green-600 to-nz-blue-600 py-20 sm:py-24 lg:py-32">
      {/* Background Elements - Simplified */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
        <div className="bg-nz-green-100/4 absolute -right-40 top-20 size-[400px] rounded-full blur-3xl"></div>
        <div className="bg-nz-blue-100/4 absolute -left-60 bottom-32 size-[400px] rounded-full blur-3xl"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Headline */}
          <AnimatedContent distance={40} direction="vertical" duration={0.4} ease="power3.out" threshold={0.1}>
            <div className="mb-6">
              <h2 className="font-oswald text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
                AI scribe for NZ GPs
              </h2>
            </div>
          </AnimatedContent>

          {/* Sub */}
          <AnimatedContent distance={30} direction="vertical" duration={0.3} ease="power3.out" threshold={0.1} delay={0.1}>
            <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-white/90 sm:text-2xl">
              Structured notes, referral‑ready images, and NZ‑referenced answers — fast
            </p>
          </AnimatedContent>

          {/* Bullets */}
          <AnimatedContent distance={30} direction="vertical" duration={0.3} ease="power3.out" threshold={0.1} delay={0.15}>
            <div className="mx-auto mb-8 grid max-w-3xl gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-white/10 px-4 py-3 text-white/95 ring-1 ring-white/20">✓ Notes in minutes</div>
              <div className="rounded-xl bg-white/10 px-4 py-3 text-white/95 ring-1 ring-white/20">✓ Photos sized for referrals</div>
              <div className="rounded-xl bg-white/10 px-4 py-3 text-white/95 ring-1 ring-white/20">✓ Trusted NZ sources, cited</div>
            </div>
          </AnimatedContent>

          {/* Trust */}
          <AnimatedContent distance={20} direction="vertical" duration={0.3} ease="power3.out" threshold={0.1} delay={0.2}>
            <div className="mb-10 flex flex-wrap items-center justify-center gap-3 text-sm text-white/90">
              <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1">Built by a practising NZ GP</span>
            </div>
          </AnimatedContent>

          {/* CTA Button */}
          <AnimatedContent
            distance={30}
            direction="vertical"
            duration={0.3}
            ease="power3.out"
            threshold={0.1}
            delay={0.3}
          >
            <div className="mb-12">
            <div className="relative inline-block w-full max-w-4xl">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-white/30 to-nz-green-300/30 blur-lg sm:-inset-2 sm:rounded-2xl"></div>
              <Button
                size="lg"
                onClick={handleJoinClick}
                disabled={isLoading}
                className="group relative w-full rounded-xl bg-orange-600 px-6 py-4 text-base font-semibold text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-orange-700 hover:shadow-2xl hover:shadow-orange-500/20 active:translate-y-0 active:scale-100 motion-reduce:transform-none motion-reduce:transition-none sm:px-8 sm:py-5 sm:text-lg md:px-10 md:py-6 md:text-xl"
              >
                {isLoading
                  ? 'Loading...'
                  : (
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-open-sans text-lg font-bold">Get more done in 15 min</span>
                        <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1 sm:size-6" />
                      </div>
                    )}
              </Button>
            </div>
            </div>
          </AnimatedContent>

        </div>
      </div>
    </section>
  );
};
