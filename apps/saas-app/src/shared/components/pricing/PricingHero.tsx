'use client';

import { Check, Clock, Shield } from 'lucide-react';

export const PricingHero = () => {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mb-8 text-xl leading-relaxed text-gray-600">
            Choose the plan that fits your practice. Start free, upgrade when you need clinical intelligence.
          </p>

          <div className="mb-12 flex flex-wrap justify-center gap-8">
            <div className="flex items-center space-x-3">
              <Check className="size-5 text-green-500" />
              <span className="text-lg">
                <strong>14-Day Free Trial</strong>
                {' '}
                on all plans
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="size-5 text-green-500" />
              <span className="text-lg">
                <strong>No Setup Fees</strong>
                {' '}
                or hidden costs
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="size-5 text-green-500" />
              <span className="text-lg">
                <strong>Cancel Anytime</strong>
                {' '}
                with one click
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
