'use client';

import Image from 'next/image';

export const SolutionSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 py-16 text-white sm:py-24 lg:py-32">
      {/* Sophisticated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
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

      {/* Enhanced Visual Background Elements - mobile contained */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Large artistic orbs - scaled for mobile */}
        <div className="from-blue-400/6 to-indigo-500/4 absolute -right-60 top-40 size-[600px] rounded-full bg-gradient-to-br blur-3xl sm:-right-80 sm:size-[1000px]"></div>
        <div className="from-purple-400/8 absolute -left-48 bottom-20 size-[500px] rounded-full bg-gradient-to-tr to-pink-500/5 blur-3xl sm:-left-60 sm:size-[800px]"></div>

        {/* Medium floating shapes - mobile optimized */}
        <div className="to-blue-500/6 absolute right-[10%] top-1/4 size-48 rounded-full bg-gradient-to-r from-cyan-400/10 blur-2xl sm:right-[15%] sm:size-72"></div>
        <div className="from-indigo-400/12 to-purple-500/8 absolute bottom-1/4 left-[15%] size-40 rounded-full bg-gradient-to-r blur-xl sm:bottom-[30%] sm:left-[20%] sm:size-64"></div>
        <div className="from-blue-500/8 absolute right-[40%] top-[55%] size-36 rounded-full bg-gradient-to-r to-cyan-400/10 blur-xl sm:right-[45%] sm:top-[60%] sm:size-56"></div>

        {/* Geometric accent shapes - mobile positioned */}
        <div className="bg-white/12 absolute right-1/4 top-[15%] size-12 rounded-full sm:top-[20%] sm:size-16"></div>
        <div className="absolute bottom-1/4 left-1/4 size-8 rounded-full bg-blue-300/15 sm:left-[30%] sm:size-12"></div>
        <div className="absolute right-[55%] top-[45%] size-6 rounded-full bg-indigo-300/20 sm:right-[60%] sm:top-[50%] sm:size-10"></div>
        <div className="bg-purple-300/12 absolute left-[10%] top-[60%] size-10 rounded-full sm:left-[15%] sm:top-[65%] sm:size-16"></div>
        <div className="absolute bottom-[35%] right-[30%] size-5 rounded-full bg-cyan-300/25 sm:bottom-[40%] sm:right-[35%] sm:size-8"></div>

        {/* Elegant line elements - mobile shortened */}
        <div className="absolute right-[15%] top-1/4 h-32 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent sm:right-[20%] sm:top-[30%] sm:h-48"></div>
        <div className="absolute bottom-[40%] left-[30%] h-24 w-px bg-gradient-to-b from-transparent via-blue-300/20 to-transparent sm:bottom-[45%] sm:left-[35%] sm:h-40"></div>
        <div className="absolute right-[65%] top-[50%] h-20 w-px bg-gradient-to-b from-transparent via-indigo-300/15 to-transparent sm:right-[70%] sm:top-[55%] sm:h-36"></div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Stylish Header Section */}
        <div className="mb-20 text-center">
          <div className="relative inline-block">
            {/* Decorative accents behind title - mobile scaled */}
            <div className="absolute -left-8 top-8 h-20 w-1 bg-gradient-to-b from-cyan-400 to-blue-500 sm:h-28 sm:w-2 lg:-left-16"></div>
            <div className="absolute -right-6 top-12 h-16 w-1 bg-gradient-to-b from-indigo-400 to-purple-500 sm:h-24 sm:w-1.5 lg:-right-12"></div>

            <h2 className="relative mb-8 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              <span className="block">End Admin Overwhelm,</span>
              <span className="block text-cyan-300">Start Focusing on Patients</span>
            </h2>

            {/* Stylish accent elements - mobile positioned */}
            <div className="absolute -right-12 top-12 size-4 rounded-full bg-cyan-400/70 sm:size-6 lg:-right-20"></div>
            <div className="lg:-left-18 absolute -left-10 top-24 size-3 rounded-full bg-blue-400/60 sm:size-5"></div>
          </div>

          <div className="relative mx-auto max-w-4xl">
            <p className="text-lg leading-relaxed text-blue-100 sm:text-xl lg:text-2xl">
              See how ClinicPro transforms your daily workflow from burnout to balance
            </p>

            {/* Decorative line accent - mobile scaled */}
            <div className="absolute -left-4 top-6 h-px w-16 bg-gradient-to-r from-cyan-400/50 to-transparent sm:w-24 lg:-left-8"></div>
            <div className="absolute -right-4 bottom-6 h-px w-12 bg-gradient-to-l from-blue-400/50 to-transparent sm:w-20 lg:-right-8"></div>
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
              <div className="absolute -right-6 -top-6 size-16 rounded-full bg-gradient-to-br from-cyan-400/15 to-blue-500/10 sm:-right-8 sm:-top-8 sm:size-20"></div>
              <div className="absolute -bottom-4 -left-4 size-12 rounded-full bg-gradient-to-tr from-indigo-400/20 to-purple-500/15 sm:-bottom-6 sm:-left-6 sm:size-16"></div>

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

              {/* Modern Before/After labels */}
              <div className="absolute left-4 top-4 z-10">
                <div className="relative rounded-2xl border border-red-300/30 bg-gradient-to-r from-red-600/95 to-red-500/90 px-4 py-2.5 text-sm font-bold text-white shadow-2xl backdrop-blur-sm">
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-red-400/20 to-red-300/15 blur-sm"></div>
                  <span className="relative flex items-center gap-2">
                    <span className="text-red-100">BEFORE:</span>
                    <span className="text-red-50">Overwhelmed</span>
                  </span>
                </div>
              </div>

              {/* Mobile: Right bottom positioning for After label */}
              <div className="absolute bottom-4 right-4 z-10 lg:right-4 lg:top-4">
                <div className="relative rounded-2xl border border-green-300/30 bg-gradient-to-r from-green-600/95 to-emerald-500/90 px-4 py-2.5 text-sm font-bold text-white shadow-2xl backdrop-blur-sm">
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-green-400/20 to-emerald-300/15 blur-sm"></div>
                  <span className="relative flex items-center gap-2">
                    <span className="text-green-100">AFTER:</span>
                    <span className="text-green-50">Balanced</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Floating enhancement elements - mobile scaled */}
            <div className="absolute -left-3 -top-3 size-6 rounded-full bg-yellow-400/60 sm:-left-4 sm:-top-4 sm:size-8"></div>
            <div className="absolute -right-2 -top-2 size-4 rounded-full bg-green-400/70 sm:-right-3 sm:-top-3 sm:size-6"></div>
            <div className="absolute -bottom-3 -left-2 size-7 rounded-full bg-blue-400/50 sm:-bottom-4 sm:-left-3 sm:size-10"></div>
            <div className="absolute -bottom-2 -right-3 size-5 rounded-full bg-purple-400/65 sm:-bottom-3 sm:-right-4 sm:size-7"></div>

            {/* Enhanced glow effect */}
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-blue-400/15 to-indigo-500/10 blur-2xl"></div>
          </div>
        </div>

        {/* Stylish Transformation Benefits - Emphasizing Solutions */}
        <div className="mb-20">
          <div className="grid gap-8 sm:grid-cols-3">
            {/* Mobile: Horizontal layout with icon on left, Desktop: Icon centered */}
            <div className="flex items-start space-x-4 lg:block lg:space-x-0 lg:text-center">
              <div className="relative flex size-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-sm lg:mx-auto lg:mb-6 lg:size-20">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent"></div>
                <span className="relative text-2xl lg:text-3xl">⏰</span>
                {/* Decorative corner accent */}
                <div className="absolute -right-1 -top-1 size-3 rounded-full bg-cyan-400/50 lg:-right-2 lg:-top-2 lg:size-4"></div>
              </div>
              <div className="flex-1 lg:text-center">
                <h3 className="mb-2 text-base font-medium text-red-200 lg:text-lg">From 2+ hours overtime</h3>
                <div className="mb-3 text-2xl font-bold text-green-300 lg:text-3xl">↓</div>
                <p className="text-lg font-bold text-green-100 lg:text-xl">Leave on time every day</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 lg:block lg:space-x-0 lg:text-center">
              <div className="relative flex size-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-sm lg:mx-auto lg:mb-6 lg:size-20">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent"></div>
                <span className="relative text-2xl lg:text-3xl">📝</span>
                {/* Decorative corner accent */}
                <div className="absolute -right-1 -top-1 size-3 rounded-full bg-blue-400/50 lg:-right-2 lg:-top-2 lg:size-4"></div>
              </div>
              <div className="flex-1 lg:text-center">
                <h3 className="mb-2 text-base font-medium text-red-200 lg:text-lg">From complex documentation</h3>
                <div className="mb-3 text-2xl font-bold text-green-300 lg:text-3xl">↓</div>
                <p className="text-lg font-bold text-green-100 lg:text-xl">Notes completed in under 1 minute</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 lg:block lg:space-x-0 lg:text-center">
              <div className="relative flex size-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-sm lg:mx-auto lg:mb-6 lg:size-20">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent"></div>
                <span className="relative text-2xl lg:text-3xl">🩺</span>
                {/* Decorative corner accent */}
                <div className="absolute -right-1 -top-1 size-3 rounded-full bg-indigo-400/50 lg:-right-2 lg:-top-2 lg:size-4"></div>
              </div>
              <div className="flex-1 lg:text-center">
                <h3 className="mb-2 text-base font-medium text-red-200 lg:text-lg">From weekend admin</h3>
                <div className="mb-3 text-2xl font-bold text-green-300 lg:text-3xl">↓</div>
                <p className="text-lg font-bold text-green-100 lg:text-xl">Focus purely on patient care</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Results Summary - Making solutions stand out */}
        <div className="text-center">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-sm">
            {/* Visual background elements */}
            <div className="to-indigo-600/8 absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 via-blue-500/5"></div>

            {/* Decorative corner accents */}
            <div className="to-blue-500/8 absolute -right-8 -top-8 size-16 rounded-full bg-gradient-to-br from-cyan-400/10 sm:-right-10 sm:-top-10 sm:size-20"></div>
            <div className="absolute -bottom-6 -left-6 size-12 rounded-full bg-gradient-to-tr from-indigo-400/15 to-purple-500/10 sm:-bottom-8 sm:-left-8 sm:size-16"></div>

            <div className="relative">
              <h3 className="mb-6 text-3xl font-bold">The Result?</h3>
              <p className="mb-8 text-xl leading-relaxed text-blue-100">
                Better patient care, improved work-life balance, and documentation that actually supports your clinical decisions.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6">
                <span className="rounded-full border-2 border-green-400/30 bg-gradient-to-r from-green-500/20 to-emerald-500/15 px-6 py-3 text-base font-bold text-green-100 shadow-lg backdrop-blur-sm">
                  ✓ 79% burnout →
                  {' '}
                  <span className="text-green-50">Sustainable practice</span>
                </span>
                <span className="rounded-full border-2 border-blue-400/30 bg-gradient-to-r from-blue-500/20 to-cyan-500/15 px-6 py-3 text-base font-bold text-blue-100 shadow-lg backdrop-blur-sm">
                  ✓ 7.2 unpaid hours →
                  {' '}
                  <span className="text-blue-50">Time with family</span>
                </span>
                <span className="rounded-full border-2 border-purple-400/30 bg-gradient-to-r from-purple-500/20 to-indigo-500/15 px-6 py-3 text-base font-bold text-purple-100 shadow-lg backdrop-blur-sm">
                  ✓ Admin burden →
                  {' '}
                  <span className="text-purple-50">Clinical focus</span>
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

        {/* Call to Action Arrow */}
        <div className="mt-16 flex justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-white/20 p-4 shadow-xl backdrop-blur-sm">
              <svg className="size-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <p className="text-center text-lg font-medium text-blue-100">
              Ready to transform your practice?
            </p>
          </div>
        </div>

        {/* Dr. Ryo's Personal Mission */}
        <div className="mt-20">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border-2 border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-sm">
            {/* Background decoratives */}
            <div className="absolute -right-10 -top-10 size-24 rounded-full bg-gradient-to-br from-white/10 to-blue-300/15 blur-2xl"></div>
            <div className="absolute -bottom-8 -left-8 size-20 rounded-full bg-gradient-to-tr from-indigo-300/20 to-purple-400/15 blur-xl"></div>

            <div className="relative z-10 text-center">
              <h3 className="mb-6 text-2xl font-bold text-white sm:text-3xl">My Promise to You</h3>
              <blockquote className="mb-6 text-lg italic text-blue-100 sm:text-xl">
                "No GP should sacrifice their life for documentation. ClinicPro gives you back the time that belongs with your patients, your family, and yourself."
              </blockquote>
            </div>

            {/* Floating accent elements */}
            <div className="absolute -left-3 top-16 size-3 rounded-full bg-white/40"></div>
            <div className="absolute -right-2 bottom-20 size-4 rounded-full bg-blue-300/50"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
