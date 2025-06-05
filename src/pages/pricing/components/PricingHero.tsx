'use client';

export const PricingHero = () => {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
          Simple, Transparent Pricing
        </h1>
        <p className="mb-8 text-xl leading-relaxed text-gray-600">
          Choose the plan that fits your practice. Start with a 14-day free trial,
          no credit card required. Cancel anytime.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <div className="flex items-center space-x-2 text-green-600">
            <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">14-Day Free Trial</span>
          </div>
          <div className="flex items-center space-x-2 text-green-600">
            <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">No Credit Card Required</span>
          </div>
          <div className="flex items-center space-x-2 text-green-600">
            <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Cancel Anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};
