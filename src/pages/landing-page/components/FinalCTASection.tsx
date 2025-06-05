'use client';

import { Check } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

export const FinalCTASection = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-20 text-white">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-6 text-4xl font-bold">
          Join Hundreds of GPs Already Leaving on Time
        </h2>
        <p className="mb-8 text-xl text-blue-100">
          Start with a 14-day free trial. Choose Basic at $30/month or Professional at $70/month. Cancel anytime.
        </p>

        <Button size="lg" className="mb-8 bg-white px-12 py-4 text-lg font-semibold text-blue-600 hover:bg-gray-100">
          Start 14-Day Free Trial
        </Button>

        <div className="flex flex-col items-center justify-center gap-6 text-blue-100 sm:flex-row">
          <div className="flex items-center space-x-2">
            <Check className="size-5 text-green-400" />
            <span>HIPAA Compliant</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="size-5 text-green-400" />
            <span>No Long-term Contracts</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="size-5 text-green-400" />
            <span>Cancel Anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};
