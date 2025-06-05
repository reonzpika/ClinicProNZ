'use client';

import { Check, Clock, Shield } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

export const PricingCTA = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-20 text-white">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-6 text-4xl font-bold">
          Ready to Transform Your Documentation?
        </h2>
        <p className="mb-8 text-xl text-blue-100">
          Join hundreds of GPs who are already saving 2+ hours daily with ClinicalMind AI Scribe.
          Start your free trial today and experience the difference.
        </p>

        <div className="mb-8 flex flex-col items-center justify-center gap-6 sm:flex-row">
          <Button size="lg" className="bg-white px-12 py-4 text-lg font-semibold text-blue-600 hover:bg-gray-100">
            Start 14-Day Free Trial
          </Button>
          <Button size="lg" variant="outline" className="border-white px-8 py-4 text-lg text-white hover:bg-white hover:text-blue-600">
            Schedule a Demo
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="flex items-center justify-center space-x-3 text-blue-100">
            <Clock className="size-6 text-green-400" />
            <div className="text-left">
              <div className="font-semibold text-white">14-Day Free Trial</div>
              <div className="text-sm">No credit card required</div>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-3 text-blue-100">
            <Shield className="size-6 text-green-400" />
            <div className="text-left">
              <div className="font-semibold text-white">HIPAA Compliant</div>
              <div className="text-sm">Your data is secure</div>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-3 text-blue-100">
            <Check className="size-6 text-green-400" />
            <div className="text-left">
              <div className="font-semibold text-white">Cancel Anytime</div>
              <div className="text-sm">No long-term contracts</div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-blue-500 pt-8">
          <p className="text-blue-100">
            <strong className="text-white">Special Offer:</strong>
            {' '}
            Get your first month 50% off when you upgrade from your free trial.
          </p>
          <p className="mt-2 text-sm text-blue-200">
            Offer valid for new customers only. Cannot be combined with other offers.
          </p>
        </div>
      </div>
    </section>
  );
};
