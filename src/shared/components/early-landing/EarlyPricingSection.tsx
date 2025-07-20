'use client';

import { ArrowRight, Crown, Star } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';

export const EarlyPricingSection = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinClick = async () => {
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
    <section className="relative bg-white py-16 sm:py-24 lg:py-32">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="to-nz-blue-300/8 absolute -right-40 top-20 size-[500px] rounded-full bg-gradient-to-br from-nz-green-200/10 blur-3xl"></div>
        <div className="from-nz-blue-200/8 absolute -left-60 bottom-32 size-[600px] rounded-full bg-gradient-to-tr to-nz-green-300/10 blur-3xl"></div>
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="relative">
            {/* Decorative accent behind title */}
            <div className="absolute -left-4 top-4 h-16 w-1.5 bg-gradient-to-b from-nz-green-500 to-nz-blue-600 sm:h-20 lg:-left-8"></div>

            <h2 className="relative text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="block">Pricing</span>
            </h2>

            {/* Stylish accent elements */}
            <div className="absolute -right-8 top-4 size-3 rounded-full bg-nz-green-400/70 sm:size-4 lg:-right-12"></div>
            <div className="absolute -left-6 top-16 size-2 rounded-full bg-nz-blue-400/60 sm:size-3 lg:-left-10"></div>
          </div>
        </div>

        {/* Main Pricing Card */}
        <div className="mx-auto max-w-lg">
          <div className="hover:shadow-3xl group relative overflow-hidden rounded-3xl border-2 border-nz-green-200/50 bg-white shadow-2xl transition-all duration-300 hover:-translate-y-1">
            {/* Special Badge */}
            <div className="absolute -right-8 -top-8 size-20 rounded-full bg-gradient-to-br from-nz-green-200/20 to-nz-blue-200/15 blur-2xl"></div>
            <div className="absolute right-4 top-4">
              <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-nz-green-600 to-nz-blue-600 px-3 py-1 text-sm font-bold text-white shadow-lg">
                <Crown className="size-4" />
                <span>Super Early</span>
              </div>
            </div>

            <div className="relative z-10 p-8 text-center">
              {/* Price */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <span className="text-lg text-gray-500 line-through">NZ$89</span>
                  <Star className="size-5 text-nz-green-600" />
                </div>
                <div className="text-6xl font-extrabold text-nz-green-600">
                  NZ$30
                </div>
                <div className="text-lg text-gray-600">per month</div>
              </div>

              {/* Title */}
              <h3 className="mb-4 text-2xl font-bold text-gray-900">
                Super Early Member Price
              </h3>

              {/* Subtitle */}
              <p className="mb-6 text-lg text-gray-600">
                (Normally NZ$89)
              </p>

              {/* Scarcity */}
              <div className="mb-8 rounded-xl border-2 border-red-200/50 bg-gradient-to-r from-red-50/80 to-orange-50/60 p-4 shadow-lg">
                <p className="text-lg font-bold text-red-700">
                  Only 15 spots available
                </p>
                <p className="text-sm text-red-600">
                  for GPs who want to help shape the future of smarter workflows in NZ general practice.
                </p>
              </div>

              {/* CTA Button */}
              <div className="mb-6">
                <div className="relative inline-block">
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-nz-green-600/20 to-nz-blue-600/20 blur-lg sm:-inset-2 sm:rounded-2xl"></div>
                  <Button
                    size="lg"
                    className="relative w-full bg-gradient-to-r from-nz-green-600 to-nz-green-700 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:from-nz-green-700 hover:to-nz-green-800 hover:shadow-2xl"
                    onClick={handleJoinClick}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Secure Your Spot Now'}
                    {!isLoading && <ArrowRight className="ml-2 size-5" />}
                  </Button>
                </div>
              </div>

              {/* Additional Info */}
              <p className="text-sm text-gray-500">
                No setup fees • Cancel anytime • Price locked for 12 months
              </p>
            </div>
          </div>
        </div>

        {/* Why This Price Section */}
        <div className="mt-16 text-center">
          <div className="mx-auto max-w-3xl rounded-2xl border-2 border-nz-blue-200/50 bg-gradient-to-r from-nz-blue-50/80 to-nz-green-50/60 p-8 shadow-lg">
            <h4 className="mb-4 text-xl font-bold text-nz-blue-900">Why the discount?</h4>
            <p className="text-lg text-nz-blue-800">
              My SaaS is early-stage. Your real-world feedback is invaluable. This pricing is my thank you for helping build something bigger.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-nz-green-600">Direct line</div>
                <div className="text-sm text-gray-700">to founder</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-nz-green-600">Weekly updates</div>
                <div className="text-sm text-gray-700">based on YOUR feedback</div>
              </div>
            </div>

            <p className="mt-6 font-semibold text-nz-green-700">
              Shape ambient transcription for NZ medicine
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
