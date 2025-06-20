'use client';

import Image from 'next/image';

export const SolutionSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 py-20 text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-black/5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Floating decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-10 top-20 size-32 rounded-full bg-white/5 blur-xl"></div>
        <div className="absolute right-20 top-40 size-24 rounded-full bg-blue-300/10 blur-lg"></div>
        <div className="absolute bottom-32 left-1/4 size-40 rounded-full bg-indigo-300/5 blur-2xl"></div>
        <div className="absolute bottom-20 right-10 size-20 rounded-full bg-white/10 blur-lg"></div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Title and Description */}
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold">
            Finally, Documentation That Works With You
          </h2>
        </div>

        {/* GP's Day Transformation - Enhanced Card Style */}
        <div className="mb-16 text-center">
          <div className="relative mx-auto max-w-5xl">
            {/* Main transformation card */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-transparent bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-purple-400/20 p-1 shadow-2xl backdrop-blur-sm">
              <div className="rounded-xl bg-white/10 backdrop-blur-md">
                <Image
                  src="/images/landing-page/gp-day-transformation.png"
                  alt="GP's day transformation - from overwhelmed to efficient with ClinicPro"
                  width={1000}
                  height={400}
                  className="rounded-xl"
                  priority={false}
                />
              </div>

              {/* Before/After floating labels */}
              <div className="absolute left-4 top-4 z-10">
                <div className="rounded-full border border-white/20 bg-red-500/90 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm">
                  ❌ Before
                </div>
              </div>
              <div className="absolute right-4 top-4 z-10">
                <div className="rounded-full border border-white/20 bg-green-500/90 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm">
                  ✅ After
                </div>
              </div>
            </div>

            {/* Floating enhancement elements */}
            <div className="absolute -left-2 -top-2 size-4 animate-pulse rounded-full bg-yellow-400/60"></div>
            <div className="absolute -right-3 -top-1 size-3 animate-pulse rounded-full bg-green-400/60 delay-1000"></div>
            <div className="absolute -bottom-2 -left-3 size-5 animate-pulse rounded-full bg-blue-400/60 delay-500"></div>
            <div className="delay-1500 absolute -bottom-1 -right-2 size-3 animate-pulse rounded-full bg-purple-400/60"></div>

            {/* Subtle glow effect */}
            <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-blue-400/20 to-indigo-400/20 blur-xl"></div>
          </div>
        </div>

        {/* Transition arrow pointing to next section */}
        <div className="mt-12 flex justify-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-bounce rounded-full bg-white/20 p-3 backdrop-blur-sm">
              <svg className="size-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Option 1: Gradient fade transition at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-white/20"></div>

      {/* Option 5: Wave separator */}
      <div className="absolute inset-x-0 bottom-0">
        <svg viewBox="0 0 1200 120" className="h-20 w-full">
          <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" fill="white" fillOpacity="0.1" />
        </svg>
      </div>
    </section>
  );
};
