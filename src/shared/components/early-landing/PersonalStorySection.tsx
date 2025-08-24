'use client';

import Image from 'next/image';
import React from 'react';

import AnimatedContent from '@/src/shared/components/AnimatedContent';

export const PersonalStorySection = () => {
  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-24">

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text Content */}
          <div className="flex flex-col justify-center">
            <div className="relative">
              {/* Decorative accent behind title */}
              <div className="absolute -left-4 top-4 h-20 w-1.5 bg-gradient-to-b from-nz-green-500 to-nz-blue-600 lg:-left-8"></div>

              <AnimatedContent
                distance={60}
                direction="vertical"
                duration={0.8}
                ease="power3.out"
                threshold={0.2}
                delay={0.1}
              >
                <h2 className="relative mb-6 text-3xl font-extrabold leading-normal tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                  <span className="block">Thank You for</span>
                  <span className="block text-nz-green-600">Stopping By</span>
                </h2>
              </AnimatedContent>

            </div>

            <AnimatedContent
              distance={80}
              direction="vertical"
              duration={0.8}
              ease="power3.out"
              threshold={0.2}
              delay={0.3}
            >
              <div className="space-y-8 text-lg leading-relaxed text-gray-700">
                <div className="rounded-lg bg-nz-blue-50/50 p-4">
                  <h3 className="mb-2 text-xl font-bold text-nz-green-700">A Message from Dr. Ryo Eguchi</h3>
                  <p className="text-base font-medium text-nz-blue-800">Practising GP & Founder</p>
                </div>

                <blockquote className="border-l-4 border-nz-green-500 bg-gray-50 p-6 italic">
                  <p className="mb-4 text-lg text-gray-800">
                    "Like many GPs, I felt increasingly disconnected from why I became a doctor. The constant rush, endless admin, and pressure were taking their toll — on me and my patients.
                  </p>
                  <p className="text-lg text-gray-800">
                    Then I discovered my ikigai: combining my medical expertise with my deep passion for AI and automation. ClinicPro was born from this vision — using smart technology to give GPs back their time, reduce burnout, and restore the joy in patient care."
                  </p>
                </blockquote>

                {/* Three key points */}
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-2 size-2 shrink-0 rounded-full bg-nz-green-600"></div>
                    <div>
                      <h5 className="mb-1 text-lg font-bold text-nz-green-600">Built by a GP, for GPs:</h5>
                      <p className="text-base text-gray-700">Every feature tested in real practice, every day.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-2 size-2 shrink-0 rounded-full bg-nz-green-600"></div>
                    <div>
                      <h5 className="mb-1 text-lg font-bold text-nz-green-600">Community-driven:</h5>
                      <p className="text-base text-gray-700">Join fellow GPs in our platform community, sharing workflow innovations and practical insights.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-2 size-2 shrink-0 rounded-full bg-nz-green-600"></div>
                    <div>
                      <h5 className="mb-1 text-lg font-bold text-nz-green-600">The result:</h5>
                      <p className="text-base text-gray-700">GPs who finish on time and feel fulfilled in their practice.</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedContent>
          </div>

          {/* Image */}
          <div className="flex items-center justify-center lg:justify-end">
            <AnimatedContent
              distance={100}
              direction="horizontal"
              duration={1.0}
              ease="power3.out"
              threshold={0.2}
              delay={0.5}
            >
              <div className="relative">
                {/* Decorative background elements */}
                <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-nz-green-100/50 to-nz-blue-100/30 blur-2xl"></div>

                <div className="relative size-96 overflow-hidden rounded-3xl border-4 border-white shadow-2xl transition-transform duration-300 hover:scale-105 sm:size-[500px] lg:size-[600px]">
                  <Image
                    src="/images/landing-page/DrRyoEguchiProfilePicMain.jpg"
                    alt="Dr. Ryo Eguchi - Founder of ClinicPro"
                    fill
                    className="object-cover"
                    priority
                  />

                  {/* Subtle overlay for better text contrast on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100"></div>
                </div>

                {/* Simple decorative elements */}
                <div className="absolute -bottom-6 -right-6 size-10 rounded-full bg-nz-green-400/70 shadow-lg"></div>
                <div className="absolute -left-6 -top-6 size-8 rounded-full bg-nz-blue-400/60 shadow-lg"></div>
                <div className="absolute right-4 top-8 size-4 rounded-full bg-nz-green-300/80"></div>
              </div>
            </AnimatedContent>
          </div>
        </div>
      </div>
    </section>
  );
};
