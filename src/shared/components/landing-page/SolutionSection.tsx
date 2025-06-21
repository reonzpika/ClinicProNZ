'use client';

import Image from 'next/image';

export const SolutionSection = () => {
  return (
    <section className="relative overflow-visible bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 py-16 text-white sm:py-24 lg:py-32">
      {/* Sophisticated background elements */}
      <div className="pointer-events-none absolute inset-0">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/5"></div>

        {/* Elegant geometric pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
      </div>

      {/* Enhanced Visual Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Large artistic orbs */}
        <div className="from-blue-400/8 absolute -right-80 top-40 size-[1000px] rounded-full bg-gradient-to-br to-indigo-500/5 blur-3xl"></div>
        <div className="to-pink-500/6 absolute -left-60 bottom-20 size-[800px] rounded-full bg-gradient-to-tr from-purple-400/10 blur-3xl"></div>

        {/* Medium floating shapes */}
        <div className="from-cyan-400/12 to-blue-500/8 absolute right-[15%] top-1/4 size-72 rounded-full bg-gradient-to-r blur-2xl"></div>
        <div className="absolute bottom-[30%] left-[20%] size-64 rounded-full bg-gradient-to-r from-indigo-400/15 to-purple-500/10 blur-xl"></div>
        <div className="to-cyan-400/12 absolute right-[45%] top-[60%] size-56 rounded-full bg-gradient-to-r from-blue-500/10 blur-xl"></div>

        {/* Geometric accent shapes */}
        <div className="absolute right-1/4 top-[20%] size-16 rounded-full bg-white/15"></div>
        <div className="absolute bottom-1/4 left-[30%] size-12 rounded-full bg-blue-300/20"></div>
        <div className="absolute right-[60%] top-[50%] size-10 rounded-full bg-indigo-300/25"></div>
        <div className="absolute left-[15%] top-[65%] size-16 rounded-full bg-purple-300/15"></div>
        <div className="absolute bottom-[40%] right-[35%] size-8 rounded-full bg-cyan-300/30"></div>

        {/* Elegant line elements */}
        <div className="absolute right-[20%] top-[30%] h-48 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
        <div className="absolute bottom-[45%] left-[35%] h-40 w-px bg-gradient-to-b from-transparent via-blue-300/25 to-transparent"></div>
        <div className="absolute right-[70%] top-[55%] h-36 w-px bg-gradient-to-b from-transparent via-indigo-300/20 to-transparent"></div>
      </div>

      <div className="relative mx-auto max-w-6xl px-3 sm:px-4 lg:px-8">
        {/* Stylish Header Section */}
        <div className="mb-20 text-center">
          <div className="relative inline-block">
            {/* Decorative accents behind title */}
            <div className="absolute -left-16 top-8 h-28 w-2 bg-gradient-to-b from-cyan-400 to-blue-500"></div>
            <div className="absolute -right-12 top-12 h-24 w-1.5 bg-gradient-to-b from-indigo-400 to-purple-500"></div>

            <h2 className="relative mb-8 text-4xl font-extrabold leading-normal tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              <span className="block">End Admin Overwhelm,</span>
              <span className="block text-cyan-300">Start Focusing on Patients</span>
            </h2>

            {/* Stylish accent elements */}
            <div className="absolute -right-20 top-12 size-6 rounded-full bg-cyan-400/70"></div>
            <div className="-left-18 absolute top-24 size-5 rounded-full bg-blue-400/60"></div>
          </div>

          <div className="relative mx-auto max-w-4xl">
            <p className="text-xl leading-relaxed text-blue-100 lg:text-2xl">
              See how ClinicPro transforms your daily workflow from burnout to balance
            </p>

            {/* Decorative line accent */}
            <div className="absolute -left-8 top-6 h-px w-24 bg-gradient-to-r from-cyan-400/50 to-transparent"></div>
            <div className="absolute -right-8 bottom-6 h-px w-20 bg-gradient-to-l from-blue-400/50 to-transparent"></div>
          </div>
        </div>

        {/* Enhanced Transformation Image */}
        <div className="mb-20 text-center">
          <div className="relative mx-auto max-w-5xl">
            {/* Artistic image container */}
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/5 p-2 shadow-2xl backdrop-blur-md">
              {/* Enhanced background elements */}
              <div className="via-indigo-500/8 absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/10 to-purple-600/5"></div>

              {/* Decorative corner accents */}
              <div className="absolute -right-8 -top-8 size-20 rounded-full bg-gradient-to-br from-cyan-400/15 to-blue-500/10"></div>
              <div className="absolute -bottom-6 -left-6 size-16 rounded-full bg-gradient-to-tr from-indigo-400/20 to-purple-500/15"></div>

              <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm">
                <Image
                  src="/images/landing-page/gp-day-transformation.png"
                  alt="GP's day transformation - from overwhelmed to efficient with ClinicPro"
                  width={1000}
                  height={400}
                  className="w-full rounded-2xl"
                  priority={false}
                />
              </div>

              {/* Stylish Before/After labels */}
              <div className="absolute left-4 top-4 z-10">
                <div className="relative rounded-full border border-white/30 bg-red-500/90 px-4 py-2 text-sm font-bold text-white shadow-xl backdrop-blur-sm">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-400/30 to-orange-400/20 blur"></div>
                  <span className="relative">❌ Before</span>
                </div>
              </div>
              <div className="absolute right-4 top-4 z-10">
                <div className="relative rounded-full border border-white/30 bg-green-500/90 px-4 py-2 text-sm font-bold text-white shadow-xl backdrop-blur-sm">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-green-400/30 to-emerald-400/20 blur"></div>
                  <span className="relative">✅ After</span>
                </div>
              </div>
            </div>

            {/* Floating enhancement elements */}
            <div className="absolute -left-4 -top-4 size-8 rounded-full bg-yellow-400/60"></div>
            <div className="absolute -right-3 -top-3 size-6 rounded-full bg-green-400/70"></div>
            <div className="absolute -bottom-4 -left-3 size-10 rounded-full bg-blue-400/50"></div>
            <div className="absolute -bottom-3 -right-4 size-7 rounded-full bg-purple-400/65"></div>

            {/* Enhanced glow effect */}
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-blue-400/15 to-indigo-500/10 blur-2xl"></div>
          </div>
        </div>

        {/* Stylish Transformation Benefits */}
        <div className="mb-20">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="relative mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-sm">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent"></div>
                <span className="relative text-3xl">⏰</span>
                {/* Decorative corner accent */}
                <div className="absolute -right-2 -top-2 size-4 rounded-full bg-cyan-400/50"></div>
              </div>
              <h3 className="mb-3 text-xl font-bold">From 2+ hours overtime</h3>
              <div className="mb-3 text-2xl text-green-300">↓</div>
              <p className="text-lg text-blue-100">Leave on time every day</p>
            </div>

            <div className="text-center">
              <div className="relative mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-sm">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent"></div>
                <span className="relative text-3xl">📝</span>
                {/* Decorative corner accent */}
                <div className="absolute -right-2 -top-2 size-4 rounded-full bg-blue-400/50"></div>
              </div>
              <h3 className="mb-3 text-xl font-bold">From complex documentation</h3>
              <div className="mb-3 text-2xl text-green-300">↓</div>
              <p className="text-lg text-blue-100">Notes completed in under 1 minute</p>
            </div>

            <div className="text-center">
              <div className="relative mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-sm">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent"></div>
                <span className="relative text-3xl">🩺</span>
                {/* Decorative corner accent */}
                <div className="absolute -right-2 -top-2 size-4 rounded-full bg-indigo-400/50"></div>
              </div>
              <h3 className="mb-3 text-xl font-bold">From weekend admin</h3>
              <div className="mb-3 text-2xl text-green-300">↓</div>
              <p className="text-lg text-blue-100">Focus purely on patient care</p>
            </div>
          </div>
        </div>

        {/* Enhanced Results Summary */}
        <div className="text-center">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-sm">
            {/* Visual background elements */}
            <div className="to-indigo-600/8 absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 via-blue-500/5"></div>

            {/* Decorative corner accents */}
            <div className="to-blue-500/8 absolute -right-10 -top-10 size-20 rounded-full bg-gradient-to-br from-cyan-400/10"></div>
            <div className="absolute -bottom-8 -left-8 size-16 rounded-full bg-gradient-to-tr from-indigo-400/15 to-purple-500/10"></div>

            <div className="relative">
              <h3 className="mb-6 text-3xl font-bold">The Result?</h3>
              <p className="mb-8 text-xl leading-relaxed text-blue-100">
                Better patient care, improved work-life balance, and documentation that actually supports your clinical decisions.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6">
                <span className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium backdrop-blur-sm">
                  ✓ 79% burnout → Sustainable practice
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium backdrop-blur-sm">
                  ✓ 7.2 unpaid hours → Time with family
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium backdrop-blur-sm">
                  ✓ Admin burden → Clinical focus
                </span>
              </div>
            </div>

            {/* Floating accent elements */}
            <div className="absolute -left-3 -top-3 size-5 rounded-full bg-cyan-400/40"></div>
            <div className="absolute -right-2 -top-2 size-4 rounded-full bg-blue-400/50"></div>
            <div className="absolute -bottom-2 -left-2 size-4 rounded-full bg-indigo-400/35"></div>
            <div className="absolute -bottom-3 -right-3 size-3 rounded-full bg-purple-400/45"></div>
          </div>
        </div>

        {/* Stylish Transition Arrow */}
        <div className="mt-16 flex justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-white/20 p-4 shadow-xl backdrop-blur-sm">
              <svg className="size-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
