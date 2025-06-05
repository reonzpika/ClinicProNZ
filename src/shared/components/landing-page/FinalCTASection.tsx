'use client';

import { Button } from '@/shared/components/ui/button';

export const FinalCTASection = () => {
  return (
    <section className="bg-blue-600 py-20 text-white">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-6 text-4xl font-bold">
          Ready to Leave the Clinic on Time?
        </h2>

        <p className="mb-8 text-xl leading-relaxed text-blue-100">
          Join hundreds of GPs who've already transformed their documentation workflow.
          Start your 14-day free trial today - no credit card required.
        </p>

        <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Button size="lg" className="bg-white px-8 py-4 text-lg text-blue-600 hover:bg-gray-100">
            Start 14-Day Free Trial
          </Button>
          <Button size="lg" variant="outline" className="border-white px-8 py-4 text-lg text-white hover:bg-blue-700">
            Book a Demo
          </Button>
        </div>

        <div className="space-y-2 text-blue-100">
          <p>✓ 14-day free trial on all plans</p>
          <p>✓ No credit card required</p>
          <p>✓ Cancel anytime</p>
          <p>✓ Setup in under 5 minutes</p>
        </div>
      </div>
    </section>
  );
};
