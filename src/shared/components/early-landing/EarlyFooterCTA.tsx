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
          {/* Main Headline */}
          <AnimatedContent
            distance={40}
            direction="vertical"
            duration={0.4}
            ease="power3.out"
            threshold={0.1}
          >
            <div className="mb-8">
              <h2 className="font-oswald text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
                <span className="text-white">ENOUGH IS</span>
{' '}
<span>ENOUGH</span>
              </h2>
            </div>
          </AnimatedContent>

          {/* Strong Message */}
          <AnimatedContent
            distance={30}
            direction="vertical"
            duration={0.3}
            ease="power3.out"
            threshold={0.1}
            delay={0.1}
          >
            <div className="mx-auto mb-12 max-w-4xl">
              <p className="text-xl leading-relaxed text-white/90 sm:text-2xl">
                The 15-minute consult isn't stretching. The health system isn't fixing itself. Legacy tools won't suddenly work for us.
              </p>
              <p className="mt-4 text-xl font-bold text-white">
                Technology is moving fast — but if we don't change how we work, nothing will change.
              </p>
            </div>
          </AnimatedContent>

          {/* Secondary Headline */}
          <AnimatedContent
            distance={30}
            direction="vertical"
            duration={0.3}
            ease="power3.out"
            threshold={0.1}
            delay={0.2}
          >
            <div className="mb-12">
            <h3 className="font-oswald text-2xl font-black text-white sm:text-3xl md:text-4xl">
              GET MORE DONE IN 15 MINUTES
            </h3>
            <p className="mt-4 text-lg text-white/90 sm:text-xl">
              Take back control of your time, your consults, and your sanity.
            </p>
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
                        <span className="font-open-sans text-lg font-bold">
                          Start Today
                        </span>
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
