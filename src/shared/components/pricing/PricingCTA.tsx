'use client';

import { Button } from '@/src/shared/components/ui/button';

export const PricingCTA = () => {
  return (
    <section className="bg-blue-600 py-20 text-white">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-6 text-4xl font-bold">Ready to Transform Your Documentation?</h2>

        <p className="mb-8 text-xl leading-relaxed text-blue-100">
          Join hundreds of GPs who save 2+ hours daily with ClinicalMind. Start your free trial today
          and experience the difference intelligent documentation makes.
        </p>

        <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="bg-white px-8 py-4 text-lg text-blue-600 hover:bg-gray-100"
          >
            Start 14-Day Free Trial
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white px-8 py-4 text-lg text-white hover:bg-blue-700"
          >
            Schedule a Demo
          </Button>
        </div>

        <div className="space-y-2 text-blue-100">
          <p>✓ No credit card required for trial</p>
          <p>✓ Full access to all features</p>
          <p>✓ Cancel anytime with one click</p>
          <p>✓ Setup takes less than 5 minutes</p>
        </div>

        <div className="mt-12 rounded-lg bg-blue-700 p-6">
          <h3 className="mb-4 text-xl font-semibold">Limited Time Offer</h3>
          <p className="mb-4 text-blue-100">
            Sign up this month and get your first 3 months of Professional plan for the price of
            Basic ($30/month instead of $70/month)
          </p>
          <p className="text-sm text-blue-200">
            Offer valid for new customers only. Automatically switches to regular pricing after 3
            months.
          </p>
        </div>
      </div>
    </section>
  );
};
