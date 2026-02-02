'use client';

import { ArrowRight, CheckCircle, Clock, Zap } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { First30Modal } from '@/src/shared/components/First30Modal';
import { Button } from '@/src/shared/components/ui/button';
import { clinicProLandingData } from '@/src/shared/data/clinicpro-landing';

export const EarlyAdoptersSection = () => {
  const [showFirst30Modal, setShowFirst30Modal] = useState(false);

  return (
    <>
      <section className="relative bg-gradient-to-br from-nz-green-50 to-nz-blue-50 py-16 sm:py-24 lg:py-32">
        {/* Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="from-nz-blue-200/12 to-nz-green-300/8 absolute -left-40 top-32 size-[600px] rounded-full bg-gradient-to-br blur-3xl"></div>
          <div className="to-nz-blue-300/6 absolute -right-60 bottom-20 size-[700px] rounded-full bg-gradient-to-tr from-nz-green-200/10 blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Founder Story */}
          <div className="mb-20">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Left: Founder Image */}
              <div className="flex justify-center lg:justify-start">
                <div className="relative">
                  <div className="overflow-hidden rounded-3xl border-4 border-white shadow-2xl">
                    <Image
                      src={clinicProLandingData.founder.image}
                      alt={`${clinicProLandingData.founder.name} - ${clinicProLandingData.founder.title}`}
                      width={400}
                      height={400}
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                  {/* Decorative elements around image */}
                  <div className="absolute -right-4 -top-4 size-8 rounded-full bg-nz-green-500/30"></div>
                  <div className="absolute -bottom-4 -left-4 size-6 rounded-full bg-nz-blue-500/40"></div>
                  <div className="absolute -left-6 top-1/2 size-4 rounded-full bg-nz-green-500/35"></div>

                  {/* Name label under image */}
                  <div className="mt-4 text-center">
                    <h3 className="text-2xl font-bold text-gray-900">{clinicProLandingData.founder.name}</h3>
                    <p className="text-lg font-medium text-nz-blue-600">{clinicProLandingData.founder.title}</p>
                  </div>
                </div>
              </div>

              {/* Right: Founder Story Text */}
              <div className="text-center lg:text-left">
                <div className="relative">
                  {/* Decorative accent behind title */}
                  <div className="absolute -left-4 top-4 h-20 w-1.5 bg-gradient-to-b from-nz-green-500 to-nz-blue-600 lg:-left-8"></div>

                  <h2 className="relative mb-6 text-3xl font-extrabold leading-normal tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                    <span className="block">Built by a GP Who</span>
                    <span className="block text-nz-green-600">Truly Knows the Struggle</span>
                  </h2>

                  {/* Stylish accent elements */}
                  <div className="absolute -right-8 top-6 size-4 rounded-full bg-nz-green-400/60 lg:-right-12"></div>
                  <div className="absolute -left-6 top-16 size-3 rounded-full bg-nz-blue-400/70 lg:-left-10"></div>
                </div>

                <div className="relative mx-auto max-w-3xl lg:mx-0">
                  <blockquote className="mb-6 text-xl italic leading-relaxed text-gray-700 lg:text-2xl">
                    "
                    {clinicProLandingData.founder.quote}
                    "
                  </blockquote>

                  {/* Decorative line accents */}
                  <div className="absolute -left-4 top-4 h-px w-16 bg-gradient-to-r from-nz-green-400 to-transparent"></div>
                  <div className="absolute -right-4 bottom-4 h-px w-12 bg-gradient-to-l from-nz-blue-400 to-transparent"></div>
                </div>

                {/* Call Invitation CTA */}
                <div className="mt-8">
                  <Button
                    size="lg"
                    onClick={() => setShowFirst30Modal(true)}
                    className="bg-gradient-to-r from-nz-green-600 to-nz-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:from-nz-green-700 hover:to-nz-blue-700 hover:shadow-2xl"
                  >
                    Join the First 30 GPs
                    <ArrowRight className="ml-2 size-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Roadmap Highlights */}
          <div>
            <div className="mb-12 text-center">
              <h3 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
                What's Coming in Q3 '25
              </h3>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                You're not just getting early access: you're helping shape the future of GP documentation in New Zealand
              </p>
            </div>

            {/* Roadmap Progress Bar */}
            <div className="relative mx-auto max-w-4xl">
              {/* Progress Line */}
              <div className="absolute left-1/2 top-1/2 h-1 w-full -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-nz-green-200 via-nz-blue-200 to-nz-green-200"></div>

              {/* Milestones */}
              <div className="flex items-center justify-between gap-8">
                {clinicProLandingData.roadmap.map((milestone, index) => (
                  <div key={index} className="flex flex-col items-center text-center">
                    {/* Milestone Icon */}
                    <div className={`mb-4 flex size-16 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
                      milestone.status === 'current'
                        ? 'bg-gradient-to-br from-nz-green-500 to-nz-blue-500'
                        : 'bg-gradient-to-br from-gray-200 to-gray-300'
                    }`}
                    >
                      {index === 0 && <Zap className={`size-8 ${milestone.status === 'current' ? 'text-white' : 'text-gray-600'}`} />}
                      {index === 1 && <CheckCircle className={`size-8 ${milestone.status === 'current' ? 'text-white' : 'text-gray-600'}`} />}
                      {index === 2 && <Clock className={`size-8 ${milestone.status === 'current' ? 'text-white' : 'text-gray-600'}`} />}
                    </div>

                    {/* Milestone Content */}
                    <div className="max-w-32">
                      <h4 className={`mb-2 text-lg font-bold ${
                        milestone.status === 'current' ? 'text-nz-green-600' : 'text-gray-700'
                      }`}
                      >
                        {milestone.milestone}
                      </h4>
                      <p className="text-sm text-gray-600">{milestone.quarter}</p>
                      {milestone.status === 'current' && (
                        <div className="mt-2 inline-flex items-center rounded-full bg-nz-green-100 px-3 py-1 text-xs font-medium text-nz-green-800">
                          Current Phase
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Info */}
              <div className="mt-12 rounded-2xl border-2 border-nz-blue-200/50 bg-gradient-to-r from-nz-blue-50/80 to-nz-green-50/60 p-8 text-center shadow-lg">
                <h4 className="mb-4 text-xl font-bold text-nz-blue-900">Your Voice Shapes Our Development</h4>
                <p className="mx-auto max-w-2xl text-nz-blue-800">
                  As one of the first 30 GPs, you'll have direct input into feature prioritisation,
                  user interface design, and workflow optimisation. Your feedback drives our roadmap.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-nz-green-700">
                    <CheckCircle className="size-4" />
                    <span>Monthly feedback sessions</span>
                  </div>
                  <div className="flex items-center gap-2 text-nz-green-700">
                    <CheckCircle className="size-4" />
                    <span>Direct developer access</span>
                  </div>
                  <div className="flex items-center gap-2 text-nz-green-700">
                    <CheckCircle className="size-4" />
                    <span>Feature request priority</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      <First30Modal
        isOpen={showFirst30Modal}
        onClose={() => setShowFirst30Modal(false)}
      />
    </>
  );
};
