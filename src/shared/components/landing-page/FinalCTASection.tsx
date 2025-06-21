'use client';

import { ArrowRight, Clock, Shield, Users } from 'lucide-react';
import { useState } from 'react';

import { EmailCaptureModal } from '@/shared/components/EmailCaptureModal';
import { Button } from '@/shared/components/ui/button';

export const FinalCTASection = () => {
  const [showEmailModal, setShowEmailModal] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 py-20 text-white sm:py-28 lg:py-36">
        {/* Enhanced Visual Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Large artistic orbs */}
          <div className="absolute -left-80 top-16 size-[800px] rounded-full bg-gradient-to-r from-white/15 to-cyan-200/25 blur-3xl"></div>
          <div className="absolute -right-96 top-24 size-[900px] rounded-full bg-gradient-to-r from-green-200/20 to-emerald-300/30 blur-3xl"></div>
          <div className="absolute -bottom-60 -left-40 size-[1000px] rounded-full bg-gradient-to-r from-purple-200/15 to-pink-300/25 blur-3xl"></div>
          <div className="absolute -bottom-32 -right-80 size-[700px] rounded-full bg-gradient-to-r from-orange-200/25 to-yellow-300/35 blur-3xl"></div>

          {/* Medium floating shapes */}
          <div className="absolute left-1/4 top-[40%] size-64 rounded-full bg-gradient-to-r from-blue-300/20 to-indigo-400/30 blur-2xl"></div>
          <div className="absolute right-[30%] top-[60%] size-72 rounded-full bg-gradient-to-r from-pink-300/25 to-rose-400/35 blur-xl"></div>
          <div className="absolute bottom-[20%] left-[60%] size-56 rounded-full bg-gradient-to-r from-emerald-300/30 to-teal-400/40 blur-2xl"></div>

          {/* Geometric accent shapes */}
          <div className="absolute left-[20%] top-[15%] size-8 rounded-full bg-white/50"></div>
          <div className="absolute right-1/4 top-1/4 size-6 rounded-full bg-cyan-400/60"></div>
          <div className="absolute left-[70%] top-[35%] size-10 rounded-full bg-green-400/50"></div>
          <div className="absolute bottom-[40%] right-[15%] size-4 rounded-full bg-yellow-400/70"></div>
          <div className="absolute bottom-[15%] left-[40%] size-12 rounded-full bg-purple-400/45"></div>

          {/* Elegant line elements */}
          <div className="absolute left-[30%] top-[20%] h-48 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
          <div className="absolute right-[45%] top-[50%] h-40 w-px bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent"></div>
          <div className="absolute bottom-[30%] left-[80%] h-52 w-px bg-gradient-to-b from-transparent via-green-400/35 to-transparent"></div>
        </div>

        {/* Enhanced background pattern */}
        <div className="absolute inset-0 bg-black/5">
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M40 40c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8zm16-16c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8zm0 32c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8zm-32-16c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 text-center sm:px-8 lg:px-12">
          {/* Enhanced Title Section */}
          <div className="relative mb-12">
            <div className="relative inline-block">
              {/* Decorative accents behind title */}
              <div className="absolute -left-16 top-8 h-32 w-2 bg-gradient-to-b from-cyan-400 to-blue-400"></div>
              <div className="absolute -right-12 top-12 h-28 w-1.5 bg-gradient-to-b from-green-400 to-emerald-400"></div>

              <h2 className="relative mb-8 text-5xl font-extrabold leading-normal tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                <span className="block">Ready to Transform</span>
                <span className="block text-yellow-300">Your Documentation?</span>
              </h2>

              {/* Enhanced floating accent elements around title */}
              <div className="absolute -left-8 top-4 size-6 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 lg:-left-12"></div>
              <div className="absolute -right-6 top-8 size-5 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 lg:-right-10"></div>
              <div className="absolute -bottom-2 left-16 size-4 rounded-full bg-gradient-to-r from-purple-400 to-violet-400 lg:left-24"></div>
              <div className="absolute -bottom-1 right-20 size-5 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 lg:right-32"></div>
            </div>

            {/* Decorative line accents */}
            <div className="absolute -left-8 top-16 h-px w-24 bg-gradient-to-r from-cyan-400 to-transparent"></div>
            <div className="absolute -right-8 bottom-16 h-px w-20 bg-gradient-to-l from-yellow-400 to-transparent"></div>
          </div>

          <p className="mx-auto mb-16 max-w-4xl text-2xl leading-relaxed text-blue-100 sm:text-3xl lg:text-4xl">
            Join the first 30 NZ GPs who will experience the future of clinical documentation.
            <span className="block font-semibold text-yellow-300 sm:inline"> Help shape ClinicPro before our public launch.</span>
          </p>

          {/* Enhanced Benefits Grid */}
          <div className="mx-auto mb-20 grid max-w-5xl gap-8 sm:grid-cols-3 lg:gap-12">
            <div className="group text-center">
              <div className="relative mx-auto mb-6 flex size-24 items-center justify-center rounded-full border-2 border-white/20 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm transition-all duration-300 sm:mb-8 sm:size-28">
                <Clock className="size-12 text-white sm:size-14" />
                {/* Enhanced glowing effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/25 to-emerald-400/35 opacity-0 blur-xl transition-opacity group-hover:opacity-100"></div>
                {/* Floating particles around icon */}
                <div className="absolute -right-2 -top-2 size-3 rounded-full bg-green-400/60"></div>
                <div className="absolute -bottom-2 -left-2 size-2 rounded-full bg-emerald-400/70"></div>
              </div>
              <h3 className="mb-4 text-2xl font-semibold sm:text-3xl">Save 2+ Hours Daily</h3>
              <p className="text-lg text-blue-100 sm:text-xl">Leave the clinic on time, every day</p>
            </div>

            <div className="group text-center">
              <div className="relative mx-auto mb-6 flex size-24 items-center justify-center rounded-full border-2 border-white/20 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm transition-all duration-300 sm:mb-8 sm:size-28">
                <Shield className="size-12 text-white sm:size-14" />
                {/* Enhanced glowing effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/25 to-indigo-400/35 opacity-0 blur-xl transition-opacity group-hover:opacity-100"></div>
                {/* Floating particles around icon */}
                <div className="absolute -right-2 -top-2 size-3 rounded-full bg-blue-400/60"></div>
                <div className="absolute -bottom-2 -left-2 size-2 rounded-full bg-indigo-400/70"></div>
              </div>
              <h3 className="mb-4 text-2xl font-semibold sm:text-3xl">NZ Healthcare Focus</h3>
              <p className="text-lg text-blue-100 sm:text-xl">Built specifically for our health system</p>
            </div>

            <div className="group text-center">
              <div className="relative mx-auto mb-6 flex size-24 items-center justify-center rounded-full border-2 border-white/20 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm transition-all duration-300 sm:mb-8 sm:size-28">
                <Users className="size-12 text-white sm:size-14" />
                {/* Enhanced glowing effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/25 to-violet-400/35 opacity-0 blur-xl transition-opacity group-hover:opacity-100"></div>
                {/* Floating particles around icon */}
                <div className="absolute -right-2 -top-2 size-3 rounded-full bg-purple-400/60"></div>
                <div className="absolute -bottom-2 -left-2 size-2 rounded-full bg-violet-400/70"></div>
              </div>
              <h3 className="mb-4 text-2xl font-semibold sm:text-3xl">GP Community Driven</h3>
              <p className="text-lg text-blue-100 sm:text-xl">Your feedback shapes our development</p>
            </div>
          </div>

          {/* Enhanced CTA Button */}
          <div className="mb-16">
            <Button
              size="lg"
              className="hover:shadow-3xl group relative overflow-hidden bg-gradient-to-r from-white to-gray-100 px-12 py-6 text-2xl font-semibold text-blue-600 shadow-2xl transition-all duration-300 hover:scale-105 hover:from-yellow-100 hover:to-white lg:px-16 lg:py-8 lg:text-3xl"
              onClick={() => setShowEmailModal(true)}
            >
              <span className="relative z-10 flex items-center">
                Get Free Access (Limited Time)
                <ArrowRight className="ml-4 size-8 transition-transform group-hover:translate-x-2 lg:size-10" />
              </span>
              {/* Enhanced button effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              {/* Enhanced floating particles */}
              <div className="absolute right-6 top-6 size-3 rounded-full bg-blue-400/50"></div>
              <div className="absolute bottom-6 left-8 size-2 rounded-full bg-indigo-400/70"></div>
              <div className="absolute bottom-4 right-12 size-2.5 rounded-full bg-purple-400/60"></div>
            </Button>
          </div>

          <div className="space-y-8">
            <p className="text-xl text-blue-100 sm:text-2xl">
              <span className="font-semibold text-yellow-300">Free access for early feedback</span>
              <span className="block sm:inline"> — No credit card required</span>
            </p>

            {/* Enhanced trust indicators */}
            <div className="flex flex-col items-center justify-center gap-6 text-lg text-blue-200 sm:flex-row sm:gap-12">
              <span className="flex items-center rounded-full border border-white/20 bg-white/10 px-6 py-3 backdrop-blur-sm transition-all hover:bg-white/15">
                <span className="mr-3 text-xl">✓</span>
                Be among the first 30 NZ GPs
              </span>
              <span className="flex items-center rounded-full border border-white/20 bg-white/10 px-6 py-3 backdrop-blur-sm transition-all hover:bg-white/15">
                <span className="mr-3 text-xl">✓</span>
                Help shape the future
              </span>
              <span className="flex items-center rounded-full border border-white/20 bg-white/10 px-6 py-3 backdrop-blur-sm transition-all hover:bg-white/15">
                <span className="mr-3 text-xl">✓</span>
                No commitment required
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced floating badges */}
        <div className="absolute left-8 top-12 hidden md:block lg:left-16 lg:top-20">
          <div className="rounded-full border border-white/30 bg-gradient-to-r from-white/15 to-white/10 px-8 py-4 text-lg font-medium backdrop-blur-md transition-all hover:from-white/20 hover:to-white/15">
            🇳🇿 Built for NZ GPs
          </div>
        </div>
        <div className="absolute right-8 top-12 hidden md:block lg:right-16 lg:top-20">
          <div className="rounded-full border border-white/30 bg-gradient-to-r from-white/15 to-white/10 px-8 py-4 text-lg font-medium backdrop-blur-md transition-all hover:from-white/20 hover:to-white/15">
            ⚡ Zero Setup Required
          </div>
        </div>

        {/* Enhanced Wave separator at bottom */}
        <div className="absolute inset-x-0 bottom-0">
          <svg viewBox="0 0 1200 120" className="h-24 w-full">
            <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" fill="url(#ctaWaveGradient)" />
            <defs>
              <linearGradient id="ctaWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
                <stop offset="50%" stopColor="#f0f9ff" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />
    </>
  );
};
