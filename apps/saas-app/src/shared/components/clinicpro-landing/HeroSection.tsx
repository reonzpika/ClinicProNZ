'use client';

import { ArrowRight, Play, Users } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { EmailCaptureModal } from '@/shared/components/EmailCaptureModal';
import { First30Modal } from '@/shared/components/First30Modal';
import { Button } from '@/shared/components/ui/button';
import { Countdown } from '@/shared/components/ui/Countdown';
import { clinicProLandingData } from '@/shared/data/clinicpro-landing';
import { getLaunchDate } from '@/shared/utils/launch-config';

export const ClinicProHeroSection = () => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showFirst30Modal, setShowFirst30Modal] = useState(false);

  return (
    <>
      {/* Enhanced Shocking Statistic Banner with brand colors */}
      <div className="border-b-2 border-red-300 bg-gradient-to-r from-red-100 to-orange-100 py-3 sm:py-4">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-medium text-red-800 sm:text-base">
              <span className="font-bold text-red-900">⚠️ 79% of NZ GPs report burnout</span>
              <span className="hidden text-red-700 xs:inline"> — </span>
              <a
                href="https://www.rnzcgp.org.nz/our-voice/workforce-survey/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block font-semibold text-blue-600 underline hover:text-blue-700 xs:mt-0 xs:inline"
              >
                RNZCGP Workforce Survey
              </a>
            </p>
          </div>
        </div>
      </div>

      <section className="relative overflow-hidden bg-white py-16 sm:py-24 lg:py-32">
        {/* Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-nz-blue-50/30 via-transparent to-nz-green-50/20"></div>

          {/* Geometric pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2316a34a' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          {/* Floating elements */}
          <div className="absolute -right-32 -top-32 size-[400px] rounded-full bg-gradient-to-br from-nz-blue-200/15 to-nz-green-300/10 blur-3xl sm:-right-40 sm:-top-40 sm:size-[600px]"></div>
          <div className="absolute -bottom-48 -left-48 size-[500px] rounded-full bg-gradient-to-tr from-nz-green-100/20 to-nz-blue-200/15 blur-3xl sm:-bottom-60 sm:-left-60 sm:size-[700px]"></div>

          {/* NZ Silhouette */}
          <div className="absolute bottom-8 left-8 opacity-15 sm:bottom-12 sm:left-12 lg:bottom-16 lg:left-16">
            <div className="relative size-48 sm:size-64 lg:size-80">
              <Image
                src="/images/landing-page/NewZealandSilhouette .png"
                alt=""
                fill
                className="object-contain opacity-50 grayscale"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Trust Badge */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-nz-green-200 to-nz-blue-200 opacity-30 blur"></div>
                <div className="relative inline-flex items-center rounded-full border border-nz-green-200/50 bg-nz-green-50/80 px-4 py-2 text-sm font-medium text-nz-green-700 backdrop-blur-sm sm:px-5 sm:py-2.5">
                  🩺 Built by a Practising NZ GP
                </div>
              </div>
            </div>

            {/* Main Headline */}
            <div className="mb-8">
              <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
                {clinicProLandingData.hero.headline}
              </h1>
            </div>

            {/* Sub-headlines */}
            <div className="mx-auto mb-8 max-w-3xl space-y-3">
              {clinicProLandingData.hero.subheadlines.map((subheadline, index) => (
                <div key={index} className="flex items-center justify-center gap-3 text-lg text-gray-600 sm:text-xl">
                  <div className="flex size-6 items-center justify-center rounded-full bg-nz-green-100">
                    <div className="size-2 rounded-full bg-nz-green-600"></div>
                  </div>
                  <span>{subheadline}</span>
                </div>
              ))}
            </div>

            {/* Primary CTA */}
            <div className="mb-6">
              <div className="relative inline-block">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-nz-green-600/20 to-nz-blue-600/20 blur-lg sm:-inset-2 sm:rounded-2xl"></div>
                <Button
                  size="lg"
                  className="relative bg-gradient-to-r from-nz-green-600 to-nz-green-700 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:from-nz-green-700 hover:to-nz-green-800 hover:shadow-2xl sm:px-10 sm:py-5 sm:text-xl"
                  onClick={() => setShowFirst30Modal(true)}
                >
                  {clinicProLandingData.hero.primaryCTA}
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </div>
            </div>

            {/* Secondary CTA */}
            <div className="mb-8 space-y-4">
              <div>
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="font-medium text-nz-blue-600 underline transition-colors hover:text-nz-blue-700"
                >
                  {clinicProLandingData.hero.secondaryCTA}
                </button>
              </div>

              {/* Login Button */}
              <div>
                <a
                  href="/login"
                  className="inline-flex items-center rounded-lg border border-nz-blue-600 bg-white px-6 py-3 text-base font-medium text-nz-blue-600 shadow-sm transition-colors hover:bg-nz-blue-50 hover:text-nz-blue-700"
                >
                  Already have an account? Sign In
                </a>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="mx-auto mb-12 max-w-md">
              <Countdown
                targetDate={getLaunchDate()}
                label={clinicProLandingData.hero.countdownText}
              />
            </div>

            {/* Hero Carousel/Screenshots Preview */}
            <div className="mx-auto max-w-5xl">
              <div className="relative">
                <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-br from-nz-blue-50 to-nz-green-100 shadow-2xl">
                  <Image
                    src="/images/landing-page/hero-image.png"
                    alt="ClinicPro AI Medical Scribe Interface"
                    fill
                    className="object-cover"
                    priority
                  />

                  {/* Overlay Labels */}
                  <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
                    <div className="rounded-xl border border-white/30 bg-white/90 px-3 py-2 backdrop-blur-sm sm:px-4 sm:py-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 sm:text-sm">
                        <div className="size-2 rounded-full bg-nz-green-500"></div>
                        <span>Scan QR</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute right-4 top-1/2 -translate-y-1/2 sm:right-6">
                    <div className="rounded-xl border border-white/30 bg-white/90 px-3 py-2 backdrop-blur-sm sm:px-4 sm:py-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 sm:text-sm">
                        <div className="size-2 rounded-full bg-nz-blue-500"></div>
                        <span>Review Live</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6">
                    <div className="rounded-xl border border-white/30 bg-nz-green-600/90 px-3 py-2 backdrop-blur-sm sm:px-4 sm:py-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-white sm:text-sm">
                        <div className="size-2 rounded-full bg-white"></div>
                        <span>One-click Note</span>
                      </div>
                    </div>
                  </div>

                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="group flex size-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white sm:size-20">
                      <Play className="ml-1 size-6 text-nz-green-600 sm:size-8" />
                    </button>
                  </div>
                </div>

                {/* Floating stats around image */}
                <div className="absolute -bottom-4 left-4 rounded-lg bg-white p-3 shadow-lg sm:-bottom-6 sm:left-6 sm:p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-600 sm:text-sm">
                    <Users className="size-4 text-nz-green-600" />
                    <span>30+ GPs signed up</span>
                  </div>
                </div>

                <div className="absolute -top-4 right-4 rounded-lg bg-white p-3 shadow-lg sm:-top-6 sm:right-6 sm:p-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-nz-green-600 sm:text-xl">&lt;1min</div>
                    <div className="text-xs text-gray-600 sm:text-sm">avg note time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />
      <First30Modal
        isOpen={showFirst30Modal}
        onClose={() => setShowFirst30Modal(false)}
      />
    </>
  );
};
