'use client';

import { ArrowRight, Brain, CheckCircle, FileCheck, Layers, Smartphone } from 'lucide-react';

export const ProductSection = () => {
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
      {/* Enhanced Visual Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Large artistic orbs */}
        <div className="absolute -right-60 top-20 size-[800px] rounded-full bg-gradient-to-br from-blue-200/15 to-indigo-300/10 blur-3xl"></div>
        <div className="from-purple-200/12 to-pink-300/8 absolute -left-80 bottom-40 size-[900px] rounded-full bg-gradient-to-tr blur-3xl"></div>

        {/* Medium floating shapes */}
        <div className="absolute right-[20%] top-[30%] size-64 rounded-full bg-gradient-to-r from-emerald-200/20 to-teal-300/15 blur-2xl"></div>
        <div className="from-violet-200/18 to-purple-300/12 absolute bottom-1/4 left-[15%] size-56 rounded-full bg-gradient-to-r blur-xl"></div>
        <div className="absolute right-[45%] top-[60%] size-48 rounded-full bg-gradient-to-r from-amber-200/25 to-orange-300/20 blur-xl"></div>

        {/* Geometric accent shapes */}
        <div className="absolute right-1/4 top-[15%] size-12 rounded-full bg-blue-400/40"></div>
        <div className="absolute bottom-[20%] left-[30%] size-10 rounded-full bg-emerald-400/50"></div>
        <div className="absolute right-[60%] top-[45%] size-8 rounded-full bg-purple-400/45"></div>
        <div className="absolute left-[20%] top-[70%] size-14 rounded-full bg-orange-400/35"></div>
        <div className="absolute bottom-[35%] right-[35%] size-6 rounded-full bg-indigo-400/55"></div>

        {/* Elegant line elements */}
        <div className="absolute right-[20%] top-1/4 h-40 w-px bg-gradient-to-b from-transparent via-blue-400/30 to-transparent"></div>
        <div className="absolute bottom-[40%] left-[35%] h-36 w-px bg-gradient-to-b from-transparent via-purple-400/25 to-transparent"></div>
        <div className="absolute right-[70%] top-[55%] h-32 w-px bg-gradient-to-b from-transparent via-emerald-400/35 to-transparent"></div>
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

      <div className="relative mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
        {/* Stylish Header Section */}
        <div className="mb-20 text-center">
          <div className="relative inline-block pb-6 pt-4">
            {/* Decorative accents behind title */}
            <div className="absolute -left-12 top-6 h-24 w-2 bg-gradient-to-b from-purple-500 to-pink-600"></div>
            <div className="absolute -right-10 top-10 h-20 w-1.5 bg-gradient-to-b from-blue-500 to-indigo-600"></div>

            <h2 className="relative mb-8 text-4xl font-extrabold leading-relaxed tracking-tight text-gray-900 sm:text-5xl lg:text-6xl xl:text-7xl">
              <span className="block">More Than Transcription</span>
              <span className="block text-purple-600">True Clinical Intelligence</span>
            </h2>

            {/* Stylish accent elements */}
            <div className="absolute -right-16 top-8 size-5 rounded-full bg-blue-400/70"></div>
            <div className="absolute -left-14 top-20 size-4 rounded-full bg-purple-400/60"></div>
          </div>

          <div className="relative mx-auto max-w-4xl">
            <p className="text-xl leading-relaxed text-gray-600 lg:text-2xl">
              Unlike basic transcription tools, ClinicPro actively supports your clinical decision-making
            </p>
            <p className="mt-4 text-lg leading-relaxed text-gray-500 lg:text-xl">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-semibold text-transparent">during the consultation itself.</span>
            </p>

            {/* Decorative line accent */}
            <div className="absolute -left-6 top-6 h-px w-20 bg-gradient-to-r from-purple-400 to-transparent"></div>
            <div className="absolute -right-6 bottom-6 h-px w-16 bg-gradient-to-l from-blue-400 to-transparent"></div>
          </div>
        </div>

        {/* Mobile: Stylish Process Steps */}
        <div className="mb-16 space-y-8 lg:hidden">
          {processSteps.map((step) => {
            const colors = colorMap[step.color];
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className="relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/95 p-6 shadow-xl backdrop-blur-sm"
              >
                {/* Visual accent background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-3`}></div>

                {/* Decorative corner accent */}
                <div className={`absolute -right-8 -top-8 size-16 rounded-full ${colors.bg} opacity-15`}></div>

                <div className="relative z-10">
                  <div className="mb-6 flex items-start space-x-5">
                    <div className="shrink-0">
                      <div className={`relative flex size-16 items-center justify-center rounded-2xl ${colors.bg} shadow-lg`}>
                        <Icon className={`size-8 ${colors.text}`} />
                        <div className={`absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full ${colors.accent} text-sm font-bold text-white shadow-md`}>
                          {step.id}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-3 text-xl font-bold text-gray-900">{step.title}</h3>
                      {step.unique && (
                        <div className={`mb-4 inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${colors.badge} shadow-md`}>
                          🔥
                          {' '}
                          {step.unique}
                        </div>
                      )}
                      <p className="text-base leading-relaxed text-gray-700">
                        <strong className="text-gray-900">
                          {step.description.split('.')[0]}
                          .
                        </strong>
                        {step.description.split('.').slice(1).join('.')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subtle side accent */}
                <div className={`absolute inset-y-8 left-0 w-1.5 ${colors.accent} rounded-r-full`}></div>
              </div>
            );
          })}
        </div>

        {/* Desktop: Stylish Process Flow - 2 Rows */}
        <div className="hidden lg:block">
          <div className="relative mb-20 pb-4 pt-8">
            <div className="space-y-12">
              {/* First Row - Steps 1, 2, 3 */}
              <div className="relative">
                {/* Connection line for first row */}
                <div className="absolute left-0 top-1/2 h-2 w-full -translate-y-1/2">
                  <div className="size-full rounded-full bg-gradient-to-r from-emerald-400/40 via-sky-400/40 to-violet-400/40 shadow-lg"></div>
                </div>

                <div className="grid grid-cols-3 gap-8 px-4">
                  {processSteps.slice(0, 3).map((step, index) => {
                    const colors = colorMap[step.color];
                    const Icon = step.icon;
                    const isLastInRow = index === 2;

                    return (
                      <div key={step.id} className="relative pt-6 text-center">
                        {/* Enhanced card design */}
                        <div className="relative overflow-visible rounded-3xl border border-gray-200/50 bg-white/95 px-6 py-10 shadow-2xl backdrop-blur-sm">
                          {/* Visual accent background */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-3 rounded-3xl`}></div>

                          {/* Decorative corner accent */}
                          <div className={`absolute -right-6 -top-6 size-12 rounded-full ${colors.bg} opacity-15`}></div>

                          {/* Step number badge */}
                          <div className={`absolute -top-6 left-1/2 flex size-12 -translate-x-1/2 items-center justify-center rounded-full ${colors.accent} z-20 text-white shadow-xl`}>
                            <span className="text-sm font-bold">{step.id}</span>
                          </div>

                          {/* Icon section */}
                          <div className="relative z-10 mb-6 mt-2">
                            <div className={`mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl ${colors.bg} shadow-lg`}>
                              <Icon className={`size-10 ${colors.text}`} />
                            </div>

                            {/* Decorative elements around icon */}
                            <div className={`absolute -right-2 -top-2 size-4 rounded-full ${colors.accent} opacity-70`}></div>
                            <div className={`absolute -bottom-2 -left-2 size-3 rounded-full ${colors.accent} opacity-50`}></div>
                          </div>

                          <div className="relative z-10 pb-2">
                            <h3 className="mb-4 text-lg font-bold leading-tight text-gray-900">{step.title}</h3>

                            {step.unique && (
                              <div className={`mb-4 inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${colors.badge} shadow-md`}>
                                🔥
                                {' '}
                                {step.unique}
                              </div>
                            )}

                            <p className="pb-1 text-sm leading-relaxed text-gray-700">
                              <strong className="text-gray-900">
                                {step.description.split('.')[0]}
                                .
                              </strong>
                              {step.description.split('.').slice(1).join('.')}
                            </p>
                          </div>

                          {/* Arrow connector - only for first 2 cards in row */}
                          {!isLastInRow && (
                            <div className="absolute -right-6 top-1/2 z-20 -translate-y-1/2">
                              <div className="flex size-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg">
                                <ArrowRight className="size-5 text-gray-400" />
                              </div>
                            </div>
                          )}

                          {/* Subtle side accent */}
                          <div className={`absolute inset-y-12 left-0 w-1 ${colors.accent} rounded-r-full`}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Second Row - Steps 4, 5 */}
              <div className="relative mt-16">
                {/* Connection line for second row - centered for 2 items */}
                <div className="absolute left-1/3 top-1/2 h-2 w-1/3 -translate-y-1/2">
                  <div className="size-full rounded-full bg-gradient-to-r from-amber-400/40 to-indigo-400/40 shadow-lg"></div>
                </div>

                <div className="grid grid-cols-2 gap-8 px-4">
                  {processSteps.slice(3, 5).map((step, index) => {
                    const colors = colorMap[step.color];
                    const Icon = step.icon;
                    const isLastInRow = index === 1;

                    return (
                      <div key={step.id} className="relative pt-6 text-center">
                        {/* Enhanced card design */}
                        <div className="relative overflow-visible rounded-3xl border border-gray-200/50 bg-white/95 px-6 py-10 shadow-2xl backdrop-blur-sm">
                          {/* Visual accent background */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-3 rounded-3xl`}></div>

                          {/* Decorative corner accent */}
                          <div className={`absolute -right-6 -top-6 size-12 rounded-full ${colors.bg} opacity-15`}></div>

                          {/* Step number badge */}
                          <div className={`absolute -top-6 left-1/2 flex size-12 -translate-x-1/2 items-center justify-center rounded-full ${colors.accent} z-20 text-white shadow-xl`}>
                            <span className="text-sm font-bold">{step.id}</span>
                          </div>

                          {/* Icon section */}
                          <div className="relative z-10 mb-6 mt-2">
                            <div className={`mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl ${colors.bg} shadow-lg`}>
                              <Icon className={`size-10 ${colors.text}`} />
                            </div>

                            {/* Decorative elements around icon */}
                            <div className={`absolute -right-2 -top-2 size-4 rounded-full ${colors.accent} opacity-70`}></div>
                            <div className={`absolute -bottom-2 -left-2 size-3 rounded-full ${colors.accent} opacity-50`}></div>
                          </div>

                          <div className="relative z-10 pb-2">
                            <h3 className="mb-4 text-lg font-bold leading-tight text-gray-900">{step.title}</h3>

                            {step.unique && (
                              <div className={`mb-4 inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${colors.badge} shadow-md`}>
                                🔥
                                {' '}
                                {step.unique}
                              </div>
                            )}

                            <p className="pb-1 text-sm leading-relaxed text-gray-700">
                              <strong className="text-gray-900">
                                {step.description.split('.')[0]}
                                .
                              </strong>
                              {step.description.split('.').slice(1).join('.')}
                            </p>
                          </div>

                          {/* Arrow connector - only for first card in second row */}
                          {!isLastInRow && (
                            <div className="absolute -right-6 top-1/2 z-20 -translate-y-1/2">
                              <div className="flex size-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg">
                                <ArrowRight className="size-5 text-gray-400" />
                              </div>
                            </div>
                          )}

                          {/* Subtle side accent */}
                          <div className={`absolute inset-y-12 left-0 w-1 ${colors.accent} rounded-r-full`}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stylish Comparison Section */}
        <div className="mt-20">
          <div className="relative overflow-hidden rounded-3xl border border-gray-200/50 bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
            {/* Visual background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-indigo-50/40"></div>

            {/* Decorative corner accents */}
            <div className="absolute -right-12 -top-12 size-24 rounded-full bg-gradient-to-br from-purple-200/20 to-pink-300/15"></div>
            <div className="absolute -bottom-8 -left-8 size-20 rounded-full bg-gradient-to-tr from-blue-200/25 to-indigo-300/20"></div>

            <div className="relative">
              <div className="mb-12 text-center">
                <h3 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                  ClinicPro vs Basic Transcription Tools
                </h3>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="relative">
                  <div className="rounded-2xl border-2 border-red-200/50 bg-gradient-to-br from-red-50/80 to-orange-50/60 p-8 shadow-lg">
                    <h4 className="mb-6 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-xl font-bold text-transparent">❌ Basic Transcription (like others)</h4>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start space-x-3">
                        <span className="text-red-500">•</span>
                        <span>Audio only — no visual context</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-red-500">•</span>
                        <span>Simple text conversion</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-red-500">•</span>
                        <span>No clinical intelligence</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-red-500">•</span>
                        <span>Generic templates</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-red-500">•</span>
                        <span>Limited to desktop recording</span>
                      </li>
                    </ul>
                  </div>
                  {/* Side accent */}
                  <div className="absolute inset-y-8 left-0 w-1 rounded-r-full bg-gradient-to-b from-red-500 to-orange-500"></div>
                </div>

                <div className="relative">
                  <div className="rounded-2xl border-2 border-emerald-200/50 bg-gradient-to-br from-emerald-50/80 to-teal-50/60 p-8 shadow-lg">
                    <h4 className="mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-xl font-bold text-transparent">✅ ClinicPro Clinical Intelligence</h4>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start space-x-3">
                        <span className="text-emerald-500">•</span>
                        <strong className="text-emerald-600">Audio + typing + images + checklists + reasoning</strong>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-emerald-500">•</span>
                        <strong className="text-emerald-600">Mobile QR recording flexibility</strong>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-emerald-500">•</span>
                        <strong className="text-emerald-600">Differential diagnosis suggestions</strong>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-emerald-500">•</span>
                        <strong className="text-emerald-600">NZ-specific clinical decision support</strong>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-emerald-500">•</span>
                        <strong className="text-emerald-600">Comprehensive structured documentation</strong>
                      </li>
                    </ul>
                  </div>
                  {/* Enhanced glow effect */}
                  <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-emerald-200/20 to-teal-200/15 blur-xl"></div>
                  {/* Side accent */}
                  <div className="absolute inset-y-8 left-0 w-1 rounded-r-full bg-gradient-to-b from-emerald-500 to-teal-500"></div>
                </div>
              </div>
            </div>

            {/* Floating accent elements */}
            <div className="absolute -left-4 -top-4 size-6 rounded-full bg-blue-400/50"></div>
            <div className="absolute -right-3 -top-3 size-5 rounded-full bg-purple-400/60"></div>
            <div className="absolute -bottom-3 -left-3 size-5 rounded-full bg-indigo-400/40"></div>
            <div className="absolute -bottom-4 -right-4 size-4 rounded-full bg-emerald-400/55"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
