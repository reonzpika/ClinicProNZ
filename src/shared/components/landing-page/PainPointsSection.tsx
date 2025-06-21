'use client';

import { AlertTriangle, Building2, ChevronDown, Clock, FileText, Users } from 'lucide-react';
import { useState } from 'react';

export const PainPointsSection = () => {
  const [showAllCards, setShowAllCards] = useState(false);

  const painPoints = [
    {
      icon: FileText,
      color: 'red' as const,
      title: 'Rising Admin Burden',
      stat: 'GPs work an average of 7.2 unpaid hours per week',
      description: ', with administrative burden being a key driver of burnout. Documentation requirements keep growing while consultation time stays the same.',
    },
    {
      icon: Users,
      color: 'orange' as const,
      title: 'Complex Multi-Morbidity',
      stat: 'Increased complexity of patient care',
      description: ' with more multi-morbidity and mental health conditions managed in the community. Comprehensive documentation is essential but time-consuming.',
    },
    {
      icon: AlertTriangle,
      color: 'yellow' as const,
      title: 'Safety-Netting Demands',
      stat: 'Higher clinical decisions in shorter consultation times',
      description: ' contribute to workload stress. Robust safety-netting and clear follow-up plans are crucial for patient safety.',
    },
    {
      icon: Building2,
      color: 'blue' as const,
      title: 'Fragmented Care',
      stat: 'Almost half of GPs work part-time',
      description: ', meaning patients see different doctors frequently. Clear, consistent documentation is vital for continuity of care.',
    },
    {
      icon: Clock,
      color: 'purple' as const,
      title: 'Burnout Crisis',
      stat: '48% of GPs rate themselves as highly burnt out',
      description: ' (7-10 on burnout scale). Practice owners and full-time GPs are especially affected by overwhelming workloads.',
    },
    {
      icon: FileText,
      color: 'green' as const,
      title: 'The Solution',
      stat: 'ClinicPro was built by a practicing NZ GP',
      description: ' who experienced these exact challenges and decided to do something about it. Every feature addresses real pain points from the workforce survey.',
      isSpecial: true,
    },
  ];

  const colorMap = {
    red: {
      bg: 'bg-gradient-to-br from-red-100 to-rose-200',
      text: 'text-red-700',
      link: 'text-red-600',
      border: 'border-red-300',
      gradient: 'from-red-50 via-rose-50 to-pink-50',
      accent: 'bg-gradient-to-r from-red-500 to-rose-500',
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-200 to-amber-250',
      text: 'text-orange-700',
      link: 'text-orange-600',
      border: 'border-orange-300',
      gradient: 'from-orange-100 via-amber-80 to-yellow-50',
      accent: 'bg-gradient-to-r from-orange-500 to-amber-500',
    },
    yellow: {
      bg: 'bg-gradient-to-br from-yellow-100 to-amber-200',
      text: 'text-yellow-700',
      link: 'text-yellow-600',
      border: 'border-yellow-300',
      gradient: 'from-yellow-50 via-amber-50 to-orange-50',
      accent: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-100 to-indigo-200',
      text: 'text-blue-700',
      link: 'text-blue-600',
      border: 'border-blue-300',
      gradient: 'from-blue-50 via-indigo-50 to-purple-50',
      accent: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-100 to-violet-200',
      text: 'text-purple-700',
      link: 'text-purple-600',
      border: 'border-purple-300',
      gradient: 'from-purple-50 via-violet-50 to-indigo-50',
      accent: 'bg-gradient-to-r from-purple-500 to-violet-500',
    },
    green: {
      bg: 'bg-gradient-to-br from-green-100 to-emerald-200',
      text: 'text-green-700',
      link: 'text-green-600',
      border: 'border-green-300',
      gradient: 'from-green-50 via-emerald-50 to-blue-50',
      accent: 'bg-gradient-to-r from-green-500 to-emerald-500',
    },
  } as const;

  return (
    <section className="relative overflow-visible bg-gray-50 py-16 sm:py-24 lg:py-32">
      {/* Sophisticated background elements */}
      <div className="pointer-events-none absolute inset-0">
        {/* Subtle gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100/30 via-gray-50 to-white/50"></div>

        {/* Elegant geometric pattern */}
        <div className="absolute inset-0 opacity-[0.015]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23374151' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zM0 0h40v40H0V0z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
      </div>

      {/* Enhanced floating decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Large artistic orbs */}
        <div className="from-blue-200/12 to-indigo-300/8 absolute -right-40 top-16 size-[500px] rounded-full bg-gradient-to-br blur-3xl"></div>
        <div className="absolute -left-32 bottom-20 size-[600px] rounded-full bg-gradient-to-tr from-gray-200/15 to-blue-200/10 blur-3xl"></div>

        {/* Medium floating shapes */}
        <div className="absolute bottom-[30%] right-[20%] size-48 rounded-full bg-gradient-to-r from-indigo-200/15 to-purple-300/10 blur-2xl"></div>
        <div className="from-gray-300/12 to-blue-200/8 absolute left-1/4 top-[40%] size-40 rounded-full bg-gradient-to-r blur-xl"></div>
        <div className="to-indigo-200/12 absolute right-[45%] top-1/4 size-36 rounded-full bg-gradient-to-r from-cyan-200/10 blur-xl"></div>

        {/* Geometric accent shapes */}
        <div className="absolute right-[30%] top-[15%] size-8 rounded-full bg-blue-400/30"></div>
        <div className="absolute bottom-[20%] left-[35%] size-6 rounded-full bg-indigo-400/40"></div>
        <div className="absolute right-[60%] top-[60%] size-5 rounded-full bg-purple-400/35"></div>
        <div className="absolute left-[15%] top-[70%] size-7 rounded-full bg-gray-400/25"></div>

        {/* Elegant line elements */}
        <div className="absolute right-1/4 top-[20%] h-32 w-px bg-gradient-to-b from-transparent via-blue-400/25 to-transparent"></div>
        <div className="absolute bottom-[35%] left-[40%] h-28 w-px bg-gradient-to-b from-transparent via-indigo-400/20 to-transparent"></div>
        <div className="absolute right-[70%] top-[45%] h-24 w-px bg-gradient-to-b from-transparent via-purple-400/30 to-transparent"></div>
      </div>

      <div className="relative mx-auto max-w-6xl px-3 sm:px-4 lg:px-8">
        <div className="mb-20 text-center">
          <div className="relative pb-8 pt-6">
            {/* Decorative accent behind title */}
            <div className="absolute -left-8 top-8 h-20 w-1.5 bg-gradient-to-b from-blue-500 to-indigo-600"></div>
            <div className="absolute -right-8 top-12 h-16 w-1 bg-gradient-to-b from-indigo-500 to-purple-600"></div>

            <h2 className="relative text-4xl font-extrabold leading-relaxed tracking-tight text-gray-900 sm:text-5xl lg:text-6xl xl:text-7xl">
              <span className="block">We Understand</span>
              <span className="block text-blue-600">Your Day</span>
            </h2>

            {/* Stylish accent elements */}
            <div className="absolute -right-12 top-4 size-4 rounded-full bg-blue-400/70"></div>
            <div className="absolute -left-10 top-16 size-3 rounded-full bg-indigo-400/60"></div>
          </div>

          <div className="relative mx-auto max-w-4xl">
            <p className="text-xl leading-relaxed text-gray-600 lg:text-2xl">
              The numbers don't lie — NZ GPs are struggling with unprecedented workload and burnout.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-gray-500 lg:text-xl">
              <span className="font-semibold text-blue-600">Every challenge you face was felt by the GP who built this solution.</span>
            </p>

            {/* Decorative line accent */}
            <div className="absolute -left-4 top-6 h-px w-16 bg-gradient-to-r from-blue-400 to-transparent"></div>
            <div className="absolute -right-4 bottom-6 h-px w-12 bg-gradient-to-l from-indigo-400 to-transparent"></div>
          </div>
        </div>

        {/* Mobile: Stylish card display */}
        <div className="space-y-6 lg:hidden">
          {painPoints.slice(0, showAllCards ? painPoints.length : 3).map((point, index) => {
            const colors = colorMap[point.color];
            const Icon = point.icon;

            return (
              <div
                key={index}
                className="relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/95 p-6 shadow-xl backdrop-blur-sm"
              >
                {/* Visual accent background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-3`}></div>

                {/* Decorative corner accent */}
                <div className={`absolute -right-6 -top-6 size-12 rounded-full ${colors.bg} opacity-20`}></div>

                <div className="relative">
                  <div className="mb-4 flex items-start space-x-4">
                    <div className={`shrink-0 rounded-xl ${colors.bg} p-3 shadow-sm`}>
                      <Icon className={`size-6 ${colors.text}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-bold text-gray-900">{point.title}</h3>
                      <p className="text-sm leading-relaxed text-gray-700">
                        <strong className="text-gray-900">{point.stat}</strong>
                        {point.description}
                      </p>
                    </div>
                  </div>

                  {!point.isSpecial && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <a
                        href="https://www.rnzcgp.org.nz/our-voice/workforce-survey/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        Source: RNZCGP Workforce Survey
                      </a>
                    </div>
                  )}
                </div>

                {/* Subtle side accent */}
                <div className={`absolute inset-y-6 left-0 w-1 ${colors.accent} rounded-r-full`}></div>
              </div>
            );
          })}

          {!showAllCards && (
            <button
              onClick={() => setShowAllCards(true)}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 py-6 text-center font-semibold text-blue-700 shadow-lg"
            >
              <span>Show All Challenges</span>
              <ChevronDown className="ml-2 inline size-5" />
            </button>
          )}

        </div>

        {/* Desktop: Stylish grid layout */}
        <div className="hidden gap-8 md:grid-cols-2 lg:grid lg:grid-cols-3">
          {painPoints.map((point, index) => {
            const colors = colorMap[point.color];
            const Icon = point.icon;

            return (
              <div
                key={index}
                className="relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/95 p-8 shadow-xl backdrop-blur-sm"
              >
                {/* Visual accent background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-3`}></div>

                {/* Decorative corner accent */}
                <div className={`absolute -right-8 -top-8 size-16 rounded-full ${colors.bg} opacity-20`}></div>

                <div className="relative">
                  <div className="mb-6">
                    <div className={`inline-flex rounded-2xl ${colors.bg} p-4 shadow-sm`}>
                      <Icon className={`size-8 ${colors.text}`} />
                    </div>
                  </div>

                  <h3 className="mb-4 text-xl font-bold text-gray-900">{point.title}</h3>

                  <p className="mb-6 text-base leading-relaxed text-gray-700">
                    <strong className="text-gray-900">{point.stat}</strong>
                    {point.description}
                  </p>

                  {!point.isSpecial && (
                    <div className="border-t border-gray-100 pt-4">
                      <a
                        href="https://www.rnzcgp.org.nz/our-voice/workforce-survey/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Source: RNZCGP Workforce Survey
                      </a>
                    </div>
                  )}
                </div>

                {/* Subtle side accent */}
                <div className={`absolute inset-y-8 left-0 w-1 ${colors.accent} rounded-r-full`}></div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
};
