'use client';

import { Eye, Shield, Users, Zap } from 'lucide-react';
import { useState } from 'react';

export const ClinicalDecisionSection = () => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const trustPillars = [
    {
      id: 1,
      icon: Eye,
      title: 'Clinical Judgment First',
      summary: 'Never replaces your expertise — ClinicPro enhances your decision-making with contextual support.',
      details: 'You remain in complete control of every clinical decision. ClinicPro provides intelligent support without ever overriding your professional judgment.',
      color: 'green' as const,
    },
    {
      id: 2,
      icon: Shield,
      title: 'Privacy by Design',
      summary: 'Your data, your control. Privacy Act 2020 compliant, end-to-end encryption.',
      details: 'No patient data used for training. Built with NZ healthcare privacy standards in mind. Complete transparency in how your data is handled.',
      color: 'blue' as const,
    },
    {
      id: 3,
      icon: Users,
      title: 'Built by GPs, for GPs',
      summary: 'Created by a practicing NZ GP who faces the same documentation challenges.',
      details: 'Real clinical experience drives every feature. Every decision comes from understanding the daily pressures and workflows of New Zealand general practice.',
      color: 'purple' as const,
    },
  ];

  const colorMap = {
    green: {
      bg: 'bg-gradient-to-br from-green-100 to-emerald-200',
      text: 'text-green-700',
      border: 'border-green-200',
      gradient: 'from-green-50 via-emerald-50 to-teal-50',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-100 to-indigo-200',
      text: 'text-blue-700',
      border: 'border-blue-200',
      gradient: 'from-blue-50 via-indigo-50 to-purple-50',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-100 to-violet-200',
      text: 'text-purple-700',
      border: 'border-purple-200',
      gradient: 'from-purple-50 via-violet-50 to-indigo-50',
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50 py-16 sm:py-24 lg:py-32">
      {/* Enhanced Visual Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Large artistic orbs */}
        <div className="to-indigo-300/6 absolute -left-80 top-24 size-[700px] rounded-full bg-gradient-to-br from-blue-200/10 blur-3xl"></div>
        <div className="from-purple-200/8 absolute -right-96 bottom-16 size-[800px] rounded-full bg-gradient-to-tr to-pink-300/5 blur-3xl"></div>

        {/* Medium floating shapes */}
        <div className="from-emerald-200/12 to-teal-300/8 absolute left-[20%] top-[35%] size-56 rounded-full bg-gradient-to-r blur-2xl"></div>
        <div className="to-purple-300/6 absolute right-[15%] top-[55%] size-64 rounded-full bg-gradient-to-r from-violet-200/10 blur-xl"></div>
        <div className="absolute bottom-[30%] left-[65%] size-48 rounded-full bg-gradient-to-r from-amber-200/15 to-orange-300/10 blur-xl"></div>

        {/* Geometric accent shapes */}
        <div className="absolute left-[30%] top-[20%] size-10 rounded-full bg-blue-400/35"></div>
        <div className="absolute right-1/4 top-1/4 size-8 rounded-full bg-emerald-400/40"></div>
        <div className="absolute left-3/4 top-[40%] size-12 rounded-full bg-purple-400/30"></div>
        <div className="absolute bottom-[35%] right-[20%] size-6 rounded-full bg-orange-400/45"></div>
        <div className="absolute bottom-[20%] left-[40%] size-14 rounded-full bg-indigo-400/25"></div>

        {/* Elegant line elements */}
        <div className="absolute left-[35%] top-[30%] h-40 w-px bg-gradient-to-b from-transparent via-blue-400/25 to-transparent"></div>
        <div className="absolute right-[45%] top-[65%] h-36 w-px bg-gradient-to-b from-transparent via-purple-400/30 to-transparent"></div>
        <div className="absolute bottom-[40%] left-[80%] h-32 w-px bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent"></div>
      </div>

      {/* Sophisticated geometric patterns overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.015]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='1'%3E%3Cpath d='M40 40c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8zm16-16c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8zm0 32c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8zm-32-16c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
        {/* Stylish Header Section */}
        <div className="mb-16 text-center">
          <div className="relative inline-block">
            {/* Decorative accents behind title */}
            <div className="absolute -left-12 top-6 h-28 w-2 bg-gradient-to-b from-green-500 to-blue-600"></div>
            <div className="absolute -right-10 top-10 h-24 w-1.5 bg-gradient-to-b from-purple-500 to-indigo-600"></div>

            <h2 className="relative mb-6 text-4xl font-extrabold leading-normal tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              <span className="block">Why GPs</span>
              <span className="block text-green-600">Trust ClinicPro</span>
            </h2>

            {/* Stylish accent elements */}
            <div className="absolute -right-16 top-4 size-5 rounded-full bg-green-400/60"></div>
            <div className="absolute -left-14 top-20 size-4 rounded-full bg-blue-400/70"></div>
          </div>

          <div className="relative mx-auto max-w-3xl">
            <p className="text-xl leading-relaxed text-gray-600 lg:text-2xl">
              Built by a practicing NZ GP who understands the trust patients place in you.
            </p>
            <p className="mt-3 text-base leading-relaxed text-gray-500 sm:text-lg">
              <span className="font-medium text-blue-600">Every decision prioritizes your clinical judgment and patient privacy.</span>
            </p>

            {/* Decorative line accent */}
            <div className="absolute -left-8 top-6 h-px w-24 bg-gradient-to-r from-green-400 to-transparent"></div>
            <div className="absolute -right-8 bottom-6 h-px w-20 bg-gradient-to-l from-blue-400 to-transparent"></div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left column - Collapsible Trust Pillars */}
          <div className="space-y-6">
            {trustPillars.map((pillar) => {
              const colors = colorMap[pillar.color];
              const Icon = pillar.icon;
              const isExpanded = expandedCard === pillar.id;

              return (
                <div
                  key={pillar.id}
                  className={`group relative overflow-hidden rounded-2xl border ${colors.border} bg-white/95 shadow-xl transition-all duration-300 hover:shadow-2xl`}
                >
                  {/* Visual accent background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-40`}></div>

                  {/* Decorative corner accent */}
                  <div className={`absolute -right-6 -top-6 size-16 rounded-full ${colors.bg} opacity-20`}></div>

                  <button
                    onClick={() => setExpandedCard(isExpanded ? null : pillar.id)}
                    className="relative z-10 w-full p-6 text-left"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`shrink-0 rounded-xl ${colors.bg} p-3 shadow-lg`}>
                        <Icon className={`size-6 ${colors.text}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-2 text-xl font-semibold text-gray-900">{pillar.title}</h3>
                        <p className="text-base leading-relaxed text-gray-600">
                          {pillar.summary}
                        </p>
                        {isExpanded && (
                          <div className="mt-4 border-t border-gray-200 pt-4">
                            <p className="text-sm leading-relaxed text-gray-700">
                              {pillar.details}
                            </p>
                          </div>
                        )}
                        <div className="mt-3 text-sm font-medium text-blue-600">
                          {isExpanded ? 'Show less' : 'Learn more'}
                          {' '}
                          →
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Floating accent elements */}
                  <div className="absolute -left-2 top-20 size-3 rounded-full bg-blue-400/40"></div>
                </div>
              );
            })}
          </div>

          {/* Right column - Professional Standards */}
          <div className="space-y-8">
            <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-200/60 bg-gradient-to-br from-indigo-50/80 to-purple-50/60 p-8 shadow-2xl">
              {/* Background decoratives */}
              <div className="absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-indigo-200/20 to-purple-300/15 blur-2xl"></div>
              <div className="absolute -bottom-6 -left-6 size-20 rounded-full bg-gradient-to-tr from-blue-200/25 to-indigo-300/20 blur-xl"></div>

              <div className="relative z-10 text-center">
                <div className="mb-6">
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-200 shadow-xl">
                    <Zap className="size-8 text-indigo-600" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">Professional Excellence</h3>
                  <p className="text-base leading-relaxed text-gray-600">
                    Designed to enhance your professional practice while protecting what matters most.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-white/60 bg-white/80 p-4 shadow-lg backdrop-blur-sm">
                    <h4 className="mb-2 text-base font-semibold text-gray-900">✓ RNZCGP Standards</h4>
                    <p className="text-sm text-gray-600">
                      Meets all professional documentation requirements for NZ general practice.
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/60 bg-white/80 p-4 shadow-lg backdrop-blur-sm">
                    <h4 className="mb-2 text-base font-semibold text-gray-900">✓ Medico-Legal Protection</h4>
                    <p className="text-sm text-gray-600">
                      Comprehensive documentation reduces liability risks while maintaining clinical accuracy.
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/60 bg-white/80 p-4 shadow-lg backdrop-blur-sm">
                    <h4 className="mb-2 text-base font-semibold text-gray-900">✓ Complete Transparency</h4>
                    <p className="text-sm text-gray-600">
                      No black box algorithms. You understand exactly how notes are generated.
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating accent elements */}
              <div className="absolute -left-3 top-24 size-4 rounded-full bg-indigo-400/50"></div>
              <div className="absolute -right-2 bottom-32 size-5 rounded-full bg-purple-400/40"></div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-green-200/60 bg-gradient-to-br from-green-50/80 to-emerald-50/60 p-6 shadow-xl">
              {/* Background decoratives */}
              <div className="absolute -right-6 -top-6 size-20 rounded-full bg-gradient-to-br from-green-200/15 to-emerald-300/10 blur-xl"></div>

              <div className="relative z-10 text-center">
                <h3 className="mb-3 text-xl font-semibold text-gray-900">🔒 Privacy-First Commitment</h3>
                <p className="mb-4 text-base text-gray-600">
                  <strong>No patient data storage.</strong>
                  {' '}
                  <strong>No commercial use.</strong>
                  {' '}
                  <strong>No training on your consultations.</strong>
                </p>
                <div className="inline-flex items-center space-x-3 rounded-full border border-green-300/60 bg-white/80 px-4 py-2 shadow-lg">
                  <Shield className="size-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Privacy Act 2020 Compliant</span>
                </div>
              </div>

              {/* Floating accent elements */}
              <div className="absolute -left-2 top-16 size-3 rounded-full bg-green-400/50"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
