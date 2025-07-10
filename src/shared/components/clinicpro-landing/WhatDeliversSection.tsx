'use client';

import { FileText, Mic, Settings, Shield } from 'lucide-react';

import { clinicProLandingData } from '@/shared/data/clinicpro-landing';

const iconMap = {
  FileText,
  Mic,
  Settings,
  Shield,
};

export const WhatDeliversSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-nz-blue-50/30 py-16 sm:py-24 lg:py-32">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="from-nz-green-200/12 to-nz-blue-300/8 absolute -left-40 top-32 size-[600px] rounded-full bg-gradient-to-br blur-3xl"></div>
        <div className="to-nz-green-300/6 absolute -right-60 bottom-20 size-[700px] rounded-full bg-gradient-to-tr from-nz-blue-200/10 blur-3xl"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Key Metrics Subsection */}
        <div className="mb-20 text-center">
          <h2 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
            What ClinicPro Delivers
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-gray-600 sm:text-xl">
            Real results that transform your practice and reclaim your time
          </p>

          {/* Metrics Grid */}
          <div className="grid gap-8 sm:grid-cols-3">
            {clinicProLandingData.metrics.map((metric, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-nz-green-50/40 via-transparent to-nz-blue-50/30 opacity-60"></div>

                <div className="relative z-10 text-center">
                  <div className="mb-2 text-5xl font-extrabold text-nz-green-600 sm:text-6xl lg:text-7xl">
                    {metric.value}
                  </div>
                  <div className="text-sm font-medium text-gray-700 sm:text-base">
                    {metric.unit}
                    {' '}
                    {metric.label}
                  </div>
                </div>

                {/* Decorative corner accent */}
                <div className="absolute -right-2 -top-2 size-12 rounded-full bg-gradient-to-br from-nz-green-200/20 to-nz-blue-300/15 transition-all duration-300 group-hover:scale-110"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Features Subsection */}
        <div>
          <div className="mb-16 text-center">
            <h3 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
              Core Features That Work
            </h3>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Purpose-built for New Zealand general practice workflows
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {clinicProLandingData.coreFeatures.map((feature, index) => {
              const IconComponent = iconMap[feature.icon as keyof typeof iconMap];

              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border border-nz-green-200/50 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-nz-green-50/40 via-transparent to-nz-blue-50/30 opacity-50"></div>

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="mb-4 flex justify-center">
                      <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-nz-green-100 to-nz-blue-100 shadow-lg transition-all duration-300 group-hover:scale-110">
                        <IconComponent className="size-7 text-nz-green-600" />
                      </div>
                    </div>

                    {/* Content */}
                    <h4 className="mb-3 text-center text-lg font-bold text-gray-900">
                      {feature.title}
                    </h4>
                    <p className="text-center text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -left-2 top-4 size-3 rounded-full bg-nz-green-400/40 transition-all duration-300 group-hover:scale-125"></div>
                  <div className="absolute -right-1 bottom-6 size-2 rounded-full bg-nz-blue-400/35 transition-all duration-300 group-hover:scale-150"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
