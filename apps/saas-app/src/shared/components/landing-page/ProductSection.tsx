'use client';

import { ArrowRight, Brain, CheckCircle, ChevronDown, FileCheck, Layers, Smartphone } from 'lucide-react';
import { useState } from 'react';

export const ProductSection = () => {
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);

  const toggleStep = (stepId: number) => {
    setExpandedSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId],
    );
  };

  const processSteps = [
    {
      id: 1,
      title: 'Record Anywhere',
      icon: Smartphone,
      color: 'green' as const,
      unique: 'Unique to ClinicPro',
      description: 'Desktop mic OR scan QR code to use your phone — zero hardware setup required. The only solution that gives you true recording flexibility.',
    },
    {
      id: 2,
      title: 'Add Rich Clinical Context',
      icon: Layers,
      color: 'blue' as const,
      unique: 'Clinical Intelligence',
      description: 'Take photos of skin lesions, type observations during consultation, use clinical checklists, get differential diagnosis suggestions. Complete flexibility.',
    },
    {
      id: 3,
      title: 'AI Generates Comprehensive Notes',
      icon: Brain,
      color: 'purple' as const,
      unique: null,
      description: 'Using recording + typed observations + images + checklists + clinical reasoning, AI creates structured notes with clinical context you\'d never get from basic transcription.',
    },
    {
      id: 4,
      title: 'Review & Perfect',
      icon: CheckCircle,
      color: 'orange' as const,
      unique: null,
      description: 'You\'re always in control. Review the comprehensive notes, add details, adjust clinical reasoning — it\'s your documentation.',
    },
    {
      id: 5,
      title: 'Export Everything',
      icon: FileCheck,
      color: 'indigo' as const,
      unique: null,
      description: 'Generate referral letters, patient advice sheets, copy to PMS. Complete clinical documentation ready in under a minute.',
    },
  ];

  const colorMap = {
    green: {
      bg: 'bg-gradient-to-br from-emerald-100 to-green-200',
      text: 'text-emerald-700',
      badge: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white',
      gradient: 'from-emerald-50 via-green-50 to-teal-50',
      border: 'border-emerald-300',
      accent: 'bg-gradient-to-r from-emerald-500 to-green-500',
    },
    blue: {
      bg: 'bg-gradient-to-br from-sky-100 to-blue-200',
      text: 'text-sky-700',
      badge: 'bg-gradient-to-r from-sky-500 to-blue-500 text-white',
      gradient: 'from-sky-50 via-blue-50 to-cyan-50',
      border: 'border-sky-300',
      accent: 'bg-gradient-to-r from-sky-500 to-blue-500',
    },
    purple: {
      bg: 'bg-gradient-to-br from-violet-100 to-purple-200',
      text: 'text-violet-700',
      badge: 'bg-gradient-to-r from-violet-500 to-purple-500 text-white',
      gradient: 'from-violet-50 via-purple-50 to-indigo-50',
      border: 'border-violet-300',
      accent: 'bg-gradient-to-r from-violet-500 to-purple-500',
    },
    orange: {
      bg: 'bg-gradient-to-br from-amber-100 to-orange-200',
      text: 'text-amber-700',
      badge: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
      gradient: 'from-amber-50 via-orange-50 to-red-50',
      border: 'border-amber-300',
      accent: 'bg-gradient-to-r from-amber-500 to-orange-500',
    },
    indigo: {
      bg: 'bg-gradient-to-br from-indigo-100 to-purple-200',
      text: 'text-indigo-700',
      badge: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
      gradient: 'from-indigo-50 via-purple-50 to-pink-50',
      border: 'border-indigo-300',
      accent: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-16 sm:py-24 lg:py-32">
      {/* Enhanced Visual Background Elements - mobile contained */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Large artistic orbs - scaled for mobile */}
        <div className="from-blue-200/12 to-indigo-300/8 absolute -right-48 top-20 size-[500px] rounded-full bg-gradient-to-br blur-3xl sm:-right-60 sm:size-[800px]"></div>
        <div className="to-pink-300/6 absolute -left-60 bottom-40 size-[600px] rounded-full bg-gradient-to-tr from-purple-200/10 blur-3xl sm:-left-80 sm:size-[900px]"></div>

        {/* Medium floating shapes - mobile optimized */}
        <div className="to-teal-300/12 absolute right-[15%] top-1/4 size-40 rounded-full bg-gradient-to-r from-emerald-200/15 blur-2xl sm:right-[20%] sm:top-[30%] sm:size-64"></div>
        <div className="from-violet-200/14 absolute bottom-1/4 left-[10%] size-36 rounded-full bg-gradient-to-r to-purple-300/10 blur-xl sm:left-[15%] sm:size-56"></div>
        <div className="absolute right-[40%] top-[55%] size-32 rounded-full bg-gradient-to-r from-amber-200/20 to-orange-300/15 blur-xl sm:right-[45%] sm:top-[60%] sm:size-48"></div>

        {/* Geometric accent shapes - mobile positioned */}
        <div className="absolute right-1/4 top-[12%] size-8 rounded-full bg-blue-400/35 sm:top-[15%] sm:size-12"></div>
        <div className="absolute bottom-[15%] left-1/4 size-6 rounded-full bg-emerald-400/45 sm:bottom-[20%] sm:left-[30%] sm:size-10"></div>
        <div className="absolute right-[55%] top-[40%] size-5 rounded-full bg-purple-400/40 sm:right-[60%] sm:top-[45%] sm:size-8"></div>
        <div className="absolute left-[15%] top-[65%] size-9 rounded-full bg-orange-400/30 sm:left-[20%] sm:top-[70%] sm:size-14"></div>
        <div className="absolute bottom-[30%] right-[30%] size-4 rounded-full bg-indigo-400/50 sm:bottom-[35%] sm:right-[35%] sm:size-6"></div>

        {/* Elegant line elements - mobile shortened */}
        <div className="absolute right-[15%] top-1/4 h-24 w-px bg-gradient-to-b from-transparent via-blue-400/25 to-transparent sm:right-[20%] sm:h-40"></div>
        <div className="absolute bottom-[35%] left-[30%] h-20 w-px bg-gradient-to-b from-transparent via-purple-400/20 to-transparent sm:bottom-[40%] sm:left-[35%] sm:h-36"></div>
        <div className="absolute right-[65%] top-[50%] h-16 w-px bg-gradient-to-b from-transparent via-emerald-400/30 to-transparent sm:right-[70%] sm:top-[55%] sm:h-32"></div>
      </div>

      {/* Sophisticated geometric patterns overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23a855f7' fill-opacity='1'%3E%3Cpath d='M40 40c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8zm16-16c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8zm0 32c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8zm-32-16c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8zm0 32c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Stylish Header Section */}
        <div className="mb-20 text-center">
          <div className="relative inline-block pb-6 pt-4">
            {/* Decorative accents behind title - mobile scaled */}
            <div className="absolute -left-8 top-6 h-20 w-1 bg-gradient-to-b from-purple-500 to-pink-600 sm:h-24 sm:w-2 lg:-left-12"></div>
            <div className="absolute -right-6 top-10 h-16 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 sm:h-20 sm:w-1.5 lg:-right-10"></div>

            <h2 className="relative mb-8 text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              <span className="block">More Than Transcription</span>
              <span className="block text-purple-600">True Clinical Intelligence</span>
            </h2>

            {/* Stylish accent elements - mobile positioned */}
            <div className="absolute -right-12 top-8 size-3 rounded-full bg-blue-400/70 sm:size-5 lg:-right-16"></div>
            <div className="absolute -left-10 top-20 size-2.5 rounded-full bg-purple-400/60 sm:size-4 lg:-left-14"></div>
          </div>

          <div className="relative mx-auto max-w-4xl">
            <p className="text-lg leading-relaxed text-gray-600 sm:text-xl lg:text-2xl">
              Unlike basic transcription tools, ClinicPro actively supports your clinical decision-making
            </p>
            <p className="mt-3 text-base leading-relaxed text-gray-500 sm:text-lg lg:text-xl">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-semibold text-transparent">during the consultation itself.</span>
            </p>

            {/* Decorative line accent - mobile scaled */}
            <div className="absolute -left-3 top-6 h-px w-12 bg-gradient-to-r from-purple-400 to-transparent sm:w-20 lg:-left-6"></div>
            <div className="absolute -right-3 bottom-6 h-px w-10 bg-gradient-to-l from-blue-400 to-transparent sm:w-16 lg:-right-6"></div>
          </div>
        </div>

        {/* Mobile: Collapsible Process Steps */}
        <div className="space-y-4 sm:space-y-6 lg:hidden">
          {processSteps.map((step) => {
            const colors = colorMap[step.color];
            const Icon = step.icon;
            const isExpanded = expandedSteps.includes(step.id);

            return (
              <div
                key={step.id}
                className="relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/95 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl"
              >
                {/* Visual accent background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-3`}></div>

                {/* Decorative corner accent */}
                <div className={`absolute -right-6 -top-6 size-12 rounded-full ${colors.bg} opacity-15 sm:-right-8 sm:-top-8 sm:size-16`}></div>

                <div className="relative z-10">
                  {/* Clickable Header */}
                  <button
                    onClick={() => toggleStep(step.id)}
                    className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`relative flex size-12 items-center justify-center rounded-xl ${colors.bg} shadow-lg sm:size-16 sm:rounded-2xl`}>
                        <Icon className={`size-6 ${colors.text} sm:size-8`} />
                        <div className={`absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full ${colors.accent} text-xs font-bold text-white shadow-md sm:size-8 sm:text-sm`}>
                          {step.id}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 sm:text-xl">{step.title}</h3>
                        {step.unique && (
                          <div className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colors.badge} shadow-md sm:text-sm`}>
                            🔥
                            {' '}
                            {step.unique}
                          </div>
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
                        <strong className="text-gray-900">
                          {step.description.split('.')[0]}
                          .
                        </strong>
                        {step.description.substring(step.description.indexOf('.') + 1)}
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

        {/* Desktop: 2-Row Card Layout */}
        <div className="hidden lg:block">
          {/* First Row - 3 Cards */}
          <div className="mb-8 grid grid-cols-3 gap-6">
            {processSteps.slice(0, 3).map((step) => {
              const colors = colorMap[step.color];
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/95 p-6 shadow-xl transition-all duration-300 hover:shadow-2xl"
                >
                  {/* Visual accent background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-5`}></div>

                  {/* Decorative corner accents */}
                  <div className={`absolute -right-6 -top-6 size-12 rounded-full ${colors.bg} opacity-15`}></div>
                  <div className={`absolute -bottom-3 -left-3 size-8 rounded-full ${colors.bg} opacity-10`}></div>

                  <div className="relative z-10">
                    {/* Enhanced Icon Section */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className={`relative flex size-12 items-center justify-center rounded-xl ${colors.bg} shadow-lg transition-transform group-hover:scale-105`}>
                        <Icon className={`size-6 ${colors.text}`} />
                        <div className={`absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full ${colors.accent} text-xs font-bold text-white shadow-md`}>
                          {step.id}
                        </div>
                      </div>
                      {step.unique && (
                        <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colors.badge} shadow-md`}>
                          🔥
                          {' '}
                          {step.unique}
                        </div>
                      )}
                    </div>

                    <h3 className="mb-3 text-lg font-bold text-gray-900">
                      {step.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-gray-700">
                      <strong className="text-gray-900">
                        {step.description.split('.')[0]}
                        .
                      </strong>
                      {step.description.substring(step.description.indexOf('.') + 1)}
                    </p>
                  </div>

                  {/* Subtle side accent */}
                  <div className={`absolute inset-y-4 left-0 w-1 ${colors.accent} rounded-r-full`}></div>

                  {/* Floating accent elements */}
                  <div className="absolute -left-1 top-12 size-2 rounded-full bg-blue-400/40"></div>
                  <div className="absolute -right-2 bottom-8 size-3 rounded-full bg-purple-400/30"></div>
                </div>
              );
            })}
          </div>

          {/* Second Row - 2 Cards Centered */}
          <div className="grid grid-cols-2 gap-6">
            {processSteps.slice(3, 5).map((step) => {
              const colors = colorMap[step.color];
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/95 p-6 shadow-xl transition-all duration-300 hover:shadow-2xl"
                >
                  {/* Visual accent background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-5`}></div>

                  {/* Decorative corner accents */}
                  <div className={`absolute -right-6 -top-6 size-12 rounded-full ${colors.bg} opacity-15`}></div>
                  <div className={`absolute -bottom-3 -left-3 size-8 rounded-full ${colors.bg} opacity-10`}></div>

                  <div className="relative z-10">
                    {/* Enhanced Icon Section */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className={`relative flex size-12 items-center justify-center rounded-xl ${colors.bg} shadow-lg transition-transform group-hover:scale-105`}>
                        <Icon className={`size-6 ${colors.text}`} />
                        <div className={`absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full ${colors.accent} text-xs font-bold text-white shadow-md`}>
                          {step.id}
                        </div>
                      </div>
                      {step.unique && (
                        <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colors.badge} shadow-md`}>
                          🔥
                          {' '}
                          {step.unique}
                        </div>
                      )}
                    </div>

                    <h3 className="mb-3 text-lg font-bold text-gray-900">
                      {step.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-gray-700">
                      <strong className="text-gray-900">
                        {step.description.split('.')[0]}
                        .
                      </strong>
                      {step.description.substring(step.description.indexOf('.') + 1)}
                    </p>
                  </div>

                  {/* Subtle side accent */}
                  <div className={`absolute inset-y-4 left-0 w-1 ${colors.accent} rounded-r-full`}></div>

                  {/* Floating accent elements */}
                  <div className="absolute -left-1 top-12 size-2 rounded-full bg-blue-400/40"></div>
                  <div className="absolute -right-2 bottom-8 size-3 rounded-full bg-purple-400/30"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Call to Action */}
        <div className="mt-20 text-center">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border-2 border-purple-200/50 bg-gradient-to-r from-purple-50/80 to-indigo-50/60 p-8 shadow-2xl">
            {/* Background decoratives */}
            <div className="absolute -right-8 -top-8 size-20 rounded-full bg-gradient-to-br from-purple-200/15 to-indigo-300/10 blur-2xl"></div>
            <div className="absolute -bottom-6 -left-6 size-16 rounded-full bg-gradient-to-tr from-blue-200/20 to-purple-300/15 blur-xl"></div>

            <div className="relative z-10">
              <h3 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl">
                Ready to Experience True Clinical Intelligence?
              </h3>
              <p className="mb-8 text-lg leading-relaxed text-gray-600 lg:text-xl">
                Join the beta and see how ClinicPro transforms not just your documentation,
                <span className="block font-medium text-purple-600 sm:inline"> but your entire approach to patient care.</span>
              </p>

              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
                <button className="group inline-flex items-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:from-purple-700 hover:to-indigo-700 hover:shadow-2xl">
                  <span>Join Beta Testing</span>
                  <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                </button>
                <p className="text-sm text-gray-500">
                  Free for the first 30 NZ GPs
                </p>
              </div>
            </div>

            {/* Floating accent elements */}
            <div className="absolute -left-3 top-16 size-3 rounded-full bg-purple-400/50"></div>
            <div className="absolute -right-2 bottom-20 size-4 rounded-full bg-blue-400/40"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
