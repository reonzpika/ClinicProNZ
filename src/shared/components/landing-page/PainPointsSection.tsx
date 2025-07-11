'use client';

import { AlertTriangle, Building2, ChevronDown, Clock, FileText, Users } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { EmailCaptureModal } from '@/src/shared/components/EmailCaptureModal';
import { Button } from '@/src/shared/components/ui/button';

export const PainPointsSection = () => {
  const [expandedCards, setExpandedCards] = useState<number[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const toggleCard = (index: number) => {
    setExpandedCards(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index],
    );
  };

  const painPoints = [
    {
      icon: Clock,
      color: 'red' as const,
      title: 'Burnout Crisis',
      stat: '48% of GPs rate themselves as highly burnt out',
      description: ' (7-10 on burnout scale). Practice owners and full-time GPs are especially affected by overwhelming workloads.',
    },
    {
      icon: FileText,
      color: 'orange' as const,
      title: 'Rising Admin Burden',
      stat: 'GPs work an average of 7.2 unpaid hours per week',
      description: ', with administrative burden being a key driver of burnout. Documentation requirements keep growing while consultation time stays the same.',
    },
    {
      icon: Users,
      color: 'yellow' as const,
      title: 'Complex Multi-Morbidity',
      stat: 'Increased complexity of patient care',
      description: ' with more multi-morbidity and mental health conditions managed in the community. Comprehensive documentation is essential but time-consuming.',
    },
    {
      icon: AlertTriangle,
      color: 'blue' as const,
      title: 'Safety-Netting Demands',
      stat: 'Higher clinical decisions in shorter consultation times',
      description: ' contribute to workload stress. Robust safety-netting and clear follow-up plans are crucial for patient safety.',
    },
    {
      icon: Building2,
      color: 'purple' as const,
      title: 'Fragmented Care',
      stat: 'Almost half of GPs work part-time',
      description: ', meaning patients see different doctors frequently. Clear, consistent documentation is vital for continuity of care.',
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
  } as const;

  return (
    <>
      <section className="relative overflow-hidden bg-blue-50 py-16 sm:py-24 lg:py-32">
        {/* Sophisticated background elements - contained for mobile */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Subtle gradient layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-blue-50 to-white/50"></div>

          {/* Elegant geometric pattern */}
          <div className="absolute inset-0 opacity-0">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23374151' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zM0 0h40v40H0V0z'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>
        </div>

        {/* Enhanced floating decorative elements - mobile contained */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Large artistic orbs - scaled for mobile */}
          <div className="to-indigo-300/6 absolute -right-32 top-16 size-[400px] rounded-full bg-gradient-to-br from-blue-200/10 blur-3xl sm:-right-40 sm:size-[500px]"></div>
          <div className="from-gray-200/12 to-blue-200/8 absolute -left-24 bottom-20 size-[450px] rounded-full bg-gradient-to-tr blur-3xl sm:-left-32 sm:size-[600px]"></div>

          {/* Medium floating shapes - mobile optimized */}
          <div className="from-indigo-200/12 to-purple-300/8 absolute bottom-1/4 right-[15%] size-32 rounded-full bg-gradient-to-r blur-2xl sm:bottom-[30%] sm:right-[20%] sm:size-48"></div>
          <div className="to-blue-200/6 absolute left-1/4 top-[35%] size-28 rounded-full bg-gradient-to-r from-gray-300/10 blur-xl sm:top-[40%] sm:size-40"></div>
          <div className="from-cyan-200/8 absolute right-[40%] top-1/4 size-24 rounded-full bg-gradient-to-r to-indigo-200/10 blur-xl sm:right-[45%] sm:size-36"></div>

          {/* Geometric accent shapes - mobile positioned */}
          <div className="absolute right-1/4 top-[12%] size-6 rounded-full bg-blue-400/25 sm:right-[30%] sm:top-[15%] sm:size-8"></div>
          <div className="absolute bottom-[15%] left-[30%] size-4 rounded-full bg-indigo-400/35 sm:bottom-[20%] sm:left-[35%] sm:size-6"></div>
          <div className="absolute right-[55%] top-[55%] size-3 rounded-full bg-purple-400/30 sm:right-[60%] sm:top-[60%] sm:size-5"></div>
          <div className="absolute left-[10%] top-[65%] size-5 rounded-full bg-gray-400/20 sm:left-[15%] sm:top-[70%] sm:size-7"></div>

          {/* Elegant line elements - mobile shortened */}
          <div className="absolute right-1/4 top-[15%] h-20 w-px bg-gradient-to-b from-transparent via-blue-400/20 to-transparent sm:top-[20%] sm:h-32"></div>
          <div className="absolute bottom-[30%] left-[35%] h-16 w-px bg-gradient-to-b from-transparent via-indigo-400/15 to-transparent sm:bottom-[35%] sm:left-[40%] sm:h-28"></div>
          <div className="absolute right-[65%] top-[40%] h-12 w-px bg-gradient-to-b from-transparent via-purple-400/25 to-transparent sm:right-[70%] sm:top-[45%] sm:h-24"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Dr. Ryo's Personal Quote Callout with Profile Picture */}
          <div className="mb-16 text-center">
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border-2 border-red-200/50 bg-gradient-to-r from-red-50/80 to-rose-50/60 p-6 shadow-xl sm:p-8">
              {/* Background decoratives */}
              <div className="absolute -right-8 -top-8 size-20 rounded-full bg-gradient-to-br from-red-200/15 to-rose-300/10 blur-2xl"></div>
              <div className="absolute -bottom-6 -left-6 size-16 rounded-full bg-gradient-to-tr from-pink-200/20 to-red-300/15 blur-xl"></div>

              <div className="relative z-10">
                {/* From the Founder Header */}
                <div className="mb-6 text-center">
                  <div className="relative inline-block">
                    {/* Decorative underline */}
                    <div className="absolute -bottom-1 left-1/2 h-0.5 w-16 -translate-x-1/2 bg-gradient-to-r from-red-500 to-rose-500"></div>

                    {/* Stylish accent dots */}
                    <div className="absolute -left-4 top-1/2 size-2 -translate-y-1/2 rounded-full bg-red-400/60"></div>
                    <div className="absolute -right-4 top-1/2 size-2 -translate-y-1/2 rounded-full bg-rose-400/60"></div>

                    <h3 className="bg-gradient-to-r from-red-600 via-red-700 to-rose-600 bg-clip-text text-xl font-extrabold tracking-wide text-transparent sm:text-2xl">
                      From the Founder
                    </h3>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-6 lg:flex-row lg:gap-8 lg:text-left">
                  {/* Profile Picture - Made Bigger */}
                  <div className="shrink-0">
                    <div className="relative size-40 overflow-hidden rounded-2xl border-4 border-white shadow-2xl sm:size-48 lg:size-56">
                      <Image
                        src="/images/landing-page/DrRyoEguchiProfilePicMain.jpg"
                        alt="Dr. Ryo Eguchi"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Quote Content */}
                  <div className="flex-1">
                    <blockquote className="text-lg font-medium italic text-red-800 sm:text-xl lg:text-2xl">
                      "I used to spend up to two extra hours each evening catching up on notes — especially in practices with older patient lists — juggling paperwork long after clinic doors closed."
                    </blockquote>
                    <div className="mt-4 flex items-center justify-center space-x-3 lg:justify-start">
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Dr. Ryo Eguchi</div>
                        <div className="text-sm text-blue-600">Founder & Practicing GP</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-20 text-center">
            <div className="relative pb-8 pt-6">
              {/* Decorative accent behind title */}
              <div className="absolute -left-6 top-8 h-16 w-1 bg-gradient-to-b from-red-500 to-orange-600 sm:h-20 lg:-left-8"></div>
              <div className="absolute -right-6 top-12 h-12 w-0.5 bg-gradient-to-b from-blue-500 to-indigo-600 sm:h-16 lg:-right-8"></div>

              <h2 className="relative text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl">
                <span className="block text-red-600">The Burnout is Real</span>
              </h2>

              {/* Stylish accent elements */}
              <div className="absolute -right-8 top-4 size-3 rounded-full bg-red-400/70 sm:size-4 lg:-right-12"></div>
              <div className="absolute -left-6 top-16 size-2 rounded-full bg-blue-400/60 sm:size-3 lg:-left-10"></div>
            </div>

            <div className="relative mx-auto max-w-4xl">
              <p className="text-lg leading-relaxed text-gray-600 sm:text-xl lg:text-2xl">
                Built by a GP who lived it — this solution tackles the daily pressure you're under.
              </p>
              <p className="mt-3 text-base leading-relaxed text-gray-500 sm:text-lg lg:text-xl">
                <span className="font-semibold text-blue-600">Every challenge you face was felt by the GP who built this solution.</span>
              </p>

              {/* Decorative line accent */}
              <div className="absolute -left-2 top-6 h-px w-12 bg-gradient-to-r from-red-400 to-transparent sm:w-16 lg:-left-4"></div>
              <div className="absolute -right-2 bottom-6 h-px w-8 bg-gradient-to-l from-blue-400 to-transparent sm:w-12 lg:-right-4"></div>
            </div>
          </div>

          {/* Mobile: Collapsible Cards */}
          <div className="space-y-4 sm:space-y-6 lg:hidden">
            {painPoints.map((point, index) => {
              const colors = colorMap[point.color];
              const Icon = point.icon;
              const isExpanded = expandedCards.includes(index);

              return (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/95 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl"
                >
                  {/* Visual accent background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-3`}></div>

                  {/* Decorative corner accent */}
                  <div className={`absolute -right-6 -top-6 size-12 rounded-full ${colors.bg} opacity-20`}></div>

                  <div className="relative">
                    {/* Clickable Header */}
                    <button
                      onClick={() => toggleCard(index)}
                      className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50/50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`shrink-0 rounded-xl ${colors.bg} p-3 shadow-sm`}>
                          <Icon className={`size-6 ${colors.text}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 sm:text-xl">{point.title}</h3>
                          {index === 0 && (
                            <p className="text-sm font-medium text-red-600">Critical Issue</p>
                          )}
                        </div>
                      </div>
                      <ChevronDown
                        className={`size-5 text-gray-400 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Expandable Content */}
                    <div className={`overflow-hidden transition-all duration-300 ${
                      isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                    >
                      <div className="border-t border-gray-100 p-6 pt-4">
                        <p className="text-base leading-relaxed text-gray-700">
                          <strong className="text-gray-900">{point.stat}</strong>
                          {point.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Subtle side accent */}
                  <div className={`absolute inset-y-6 left-0 w-1 ${colors.accent} rounded-r-full`}></div>
                </div>
              );
            })}
          </div>

          {/* Desktop: Classic Card Grid with Full Content */}
          <div className="hidden lg:block">
            {/* First Row - 3 Cards */}
            <div className="mb-8 grid grid-cols-3 gap-6">
              {painPoints.slice(0, 3).map((point, index) => {
                const colors = colorMap[point.color];
                const Icon = point.icon;

                return (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/95 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    {/* Visual accent background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-5`}></div>

                    {/* Decorative corner accents */}
                    <div className={`absolute -right-6 -top-6 size-12 rounded-full ${colors.bg} opacity-15`}></div>
                    <div className={`absolute -bottom-3 -left-3 size-8 rounded-full ${colors.bg} opacity-10`}></div>

                    <div className="relative z-10 flex h-full flex-col">
                      {/* Header Section */}
                      <div className="mb-4 flex items-center justify-between">
                        <div className={`shrink-0 rounded-xl ${colors.bg} p-3 shadow-lg transition-transform group-hover:scale-105`}>
                          <Icon className={`size-6 ${colors.text}`} />
                        </div>
                        {index === 0 && (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                            Critical
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="mb-4 text-xl font-bold leading-tight text-gray-900">
                        {point.title}
                      </h3>

                      {/* Statistics - Highlighted */}
                      <div className="mb-4 rounded-lg border-l-4 border-l-blue-500 bg-gray-50 p-3">
                        <p className="text-sm font-bold text-gray-900">
                          {point.stat}
                        </p>
                      </div>

                      {/* Description */}
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed text-gray-700">
                          {point.description}
                        </p>
                      </div>
                    </div>

                    {/* Subtle side accent */}
                    <div className={`absolute inset-y-6 left-0 w-1 ${colors.accent} rounded-r-full`}></div>

                    {/* Floating accent elements */}
                    <div className="absolute -left-1 top-12 size-2 rounded-full bg-blue-400/40"></div>
                    <div className="absolute -right-2 bottom-8 size-3 rounded-full bg-indigo-400/30"></div>
                  </div>
                );
              })}
            </div>

            {/* Second Row - 2 Cards Centered */}
            <div className="flex justify-center">
              <div className="grid grid-cols-2 gap-6" style={{ width: 'calc(66.666667% + 0.5rem)' }}>
                {painPoints.slice(3, 5).map((point, index) => {
                  const actualIndex = index + 3;
                  const colors = colorMap[point.color];
                  const Icon = point.icon;

                  return (
                    <div
                      key={actualIndex}
                      className="group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/95 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                    >
                      {/* Visual accent background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-5`}></div>

                      {/* Decorative corner accents */}
                      <div className={`absolute -right-6 -top-6 size-12 rounded-full ${colors.bg} opacity-15`}></div>
                      <div className={`absolute -bottom-3 -left-3 size-8 rounded-full ${colors.bg} opacity-10`}></div>

                      <div className="relative z-10 flex h-full flex-col">
                        {/* Header Section */}
                        <div className="mb-4">
                          <div className={`shrink-0 rounded-xl ${colors.bg} inline-block p-3 shadow-lg transition-transform group-hover:scale-105`}>
                            <Icon className={`size-6 ${colors.text}`} />
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="mb-4 text-xl font-bold leading-tight text-gray-900">
                          {point.title}
                        </h3>

                        {/* Statistics - Highlighted */}
                        <div className="mb-4 rounded-lg border-l-4 border-l-blue-500 bg-gray-50 p-3">
                          <p className="text-sm font-bold text-gray-900">
                            {point.stat}
                          </p>
                        </div>

                        {/* Description */}
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed text-gray-700">
                            {point.description}
                          </p>
                        </div>
                      </div>

                      {/* Subtle side accent */}
                      <div className={`absolute inset-y-6 left-0 w-1 ${colors.accent} rounded-r-full`}></div>

                      {/* Floating accent elements */}
                      <div className="absolute -left-1 top-12 size-2 rounded-full bg-blue-400/40"></div>
                      <div className="absolute -right-2 bottom-8 size-3 rounded-full bg-indigo-400/30"></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Subtle Reference */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              <em>Data sourced from </em>
              <a
                href="https://www.rnzcgp.org.nz/our-voice/workforce-survey/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                RNZCGP Workforce Survey
              </a>
            </p>
          </div>

          {/* Call to Action with Green Highlight */}
          <div className="mt-16 text-center">
            <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border-2 border-green-200/50 bg-gradient-to-r from-green-50/80 to-emerald-50/60 p-6 shadow-xl sm:p-8">
              {/* Background decoratives */}
              <div className="absolute -right-8 -top-8 size-20 rounded-full bg-gradient-to-br from-green-200/15 to-emerald-300/10 blur-2xl"></div>
              <div className="absolute -bottom-6 -left-6 size-16 rounded-full bg-gradient-to-tr from-teal-200/20 to-green-300/15 blur-xl"></div>

              <div className="relative z-10">
                <h3 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">
                  You're Not Alone in This Struggle
                </h3>
                <p className="mb-6 text-lg font-medium text-gray-700 sm:text-xl">
                  <span className="font-semibold text-green-600">ClinicPro was built by someone who understands exactly what you're going through.</span>
                </p>
                <p className="mb-8 text-base text-gray-600">
                  Join the beta and experience how AI can transform your documentation workflow — built specifically for New Zealand general practice.
                </p>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:from-green-700 hover:to-emerald-700 hover:shadow-2xl"
                  onClick={() => setShowEmailModal(true)}
                >
                  Join Beta Testing (Free)
                </Button>
                <p className="mt-4 text-sm text-gray-500">
                  Free for the first 30 NZ GPs — No credit card required
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />
    </>
  );
};
