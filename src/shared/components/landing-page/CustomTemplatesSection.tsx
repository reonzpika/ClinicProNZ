'use client';

import { Calendar, ChevronDown, Globe, Network, Rocket, Share2, Sparkles, Users, Zap } from 'lucide-react';
import { useState } from 'react';

import { EmailCaptureModal } from '@/src/shared/components/EmailCaptureModal';
import { Button } from '@/src/shared/components/ui/button';

export const CustomTemplatesSection = () => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  const [showAllPhases, setShowAllPhases] = useState(false);

  const roadmapPhases = [
    {
      id: 0,
      timeframe: 'Early Q3 2025',
      title: 'Enhanced Clinical Tools',
      icon: Sparkles,
      color: 'green' as const,
      description: 'Advanced clinical tools that help GPs gather information seamlessly during consultations, enhancing decision-making without disrupting patient interaction.',
      features: [
        {
          icon: Calendar,
          title: 'Interactive Checklists',
          description: 'Condition-specific checklists that guide consultations',
        },
        {
          icon: Zap,
          title: 'Clinical Calculators',
          description: 'Risk scores, dosing calculators, and assessment tools',
        },
        {
          icon: Rocket,
          title: 'Real-time Guidance',
          description: 'Context-aware suggestions based on patient presentation',
        },
      ],
    },
    {
      id: 1,
      timeframe: 'Mid Q3 2025',
      title: 'Session Management & GP Marketplace',
      icon: Users,
      color: 'blue' as const,
      description: 'A comprehensive community platform designed specifically for New Zealand GPs to collaborate, share knowledge, and improve clinical workflows together.',
      features: [
        {
          icon: Network,
          title: 'Session Management',
          description: 'Advanced consultation workflow control and organisation',
        },
        {
          icon: Share2,
          title: 'GP-run Marketplace',
          description: 'Share templates & AI prompts with community ratings',
        },
        {
          icon: Users,
          title: 'Community Forums',
          description: 'Workflow tips, app improvements & NZ GP life discussions',
        },
        {
          icon: Sparkles,
          title: 'Peer Collaboration',
          description: 'Comment threads and collaborative template development',
        },
      ],
    },
    {
      id: 2,
      timeframe: 'Late Q3 2025',
      title: 'NZ Resources Hub',
      icon: Globe,
      color: 'orange' as const,
      description: 'One-click access to all the trusted New Zealand health resources you use daily, integrated seamlessly into your consultation workflow.',
      features: [
        {
          icon: Globe,
          title: 'Trusted NZ Sites',
          description: 'BPAC, Healthify, MoH guidelines, HealthPathways, ACC',
        },
        {
          icon: Zap,
          title: 'Consolidated Hub',
          description: 'All resources in one place, no more browser tabs',
        },
        {
          icon: Network,
          title: 'Smart Integration',
          description: 'Context-aware resource suggestions during consultations',
        },
        {
          icon: Rocket,
          title: 'Workflow Optimisation',
          description: 'Streamlined access patterns based on consultation type',
        },
      ],
    },
    {
      id: 3,
      timeframe: 'Q4 2025+',
      title: 'Complete Practice Integration',
      icon: Rocket,
      color: 'purple' as const,
      description: 'Complete integration with New Zealand\'s healthcare infrastructure, eliminating duplicate data entry and creating a seamless workflow from consultation to follow-up.',
      features: [
        {
          icon: Network,
          title: 'HealthPathways Integration',
          description: 'Search referral pathways, criteria & forms directly in-app',
        },
        {
          icon: Zap,
          title: 'Direct PMS Connectivity',
          description: 'Medtech 32, My Practice, Profile integration',
        },
        {
          icon: Rocket,
          title: 'Bi-directional Sync',
          description: 'Patient records, referrals & prescribing stay in sync',
        },
        {
          icon: Globe,
          title: 'Zero Duplicate Entry',
          description: 'Write once, sync everywhere across your practice systems',
        },
      ],
    },
  ];

  const colorMap = {
    green: {
      bg: 'bg-green-100',
      border: 'border-green-200',
      text: 'text-green-600',
      badge: 'bg-green-100 text-green-800',
      gradient: 'from-green-50 to-green-100',
    },
    blue: {
      bg: 'bg-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-800',
      gradient: 'from-blue-50 to-blue-100',
    },
    orange: {
      bg: 'bg-orange-100',
      border: 'border-orange-200',
      text: 'text-orange-600',
      badge: 'bg-orange-100 text-orange-800',
      gradient: 'from-orange-50 to-orange-100',
    },
    purple: {
      bg: 'bg-purple-100',
      border: 'border-purple-200',
      text: 'text-purple-600',
      badge: 'bg-purple-100 text-purple-800',
      gradient: 'from-purple-50 to-purple-100',
    },
  } as const;

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-16 sm:py-24 lg:py-32">
        {/* Enhanced Visual Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Large artistic orbs */}
          <div className="to-purple-300/6 absolute -left-80 top-32 size-[800px] rounded-full bg-gradient-to-br from-indigo-200/10 blur-3xl"></div>
          <div className="from-blue-200/8 absolute -right-96 bottom-24 size-[900px] rounded-full bg-gradient-to-tr to-cyan-300/5 blur-3xl"></div>

          {/* Medium floating shapes */}
          <div className="from-emerald-200/12 to-teal-300/8 absolute left-[18%] top-[35%] size-64 rounded-full bg-gradient-to-r blur-2xl"></div>
          <div className="to-purple-300/6 absolute right-[12%] top-[55%] size-72 rounded-full bg-gradient-to-r from-violet-200/10 blur-xl"></div>
          <div className="absolute bottom-[30%] left-[70%] size-56 rounded-full bg-gradient-to-r from-amber-200/15 to-orange-300/10 blur-xl"></div>

          {/* Geometric accent shapes */}
          <div className="absolute left-1/4 top-[20%] size-12 rounded-full bg-indigo-400/35"></div>
          <div className="absolute right-[30%] top-1/4 size-10 rounded-full bg-emerald-400/40"></div>
          <div className="absolute left-3/4 top-[40%] size-14 rounded-full bg-purple-400/30"></div>
          <div className="absolute bottom-[35%] right-[20%] size-8 rounded-full bg-orange-400/45"></div>
          <div className="absolute bottom-[20%] left-[40%] size-16 rounded-full bg-blue-400/25"></div>

          {/* Elegant line elements */}
          <div className="absolute left-[30%] top-[30%] h-44 w-px bg-gradient-to-b from-transparent via-indigo-400/25 to-transparent"></div>
          <div className="absolute right-[45%] top-[65%] h-40 w-px bg-gradient-to-b from-transparent via-purple-400/30 to-transparent"></div>
          <div className="absolute bottom-[40%] left-[85%] h-36 w-px bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent"></div>
        </div>

        {/* Sophisticated geometric patterns overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.015]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='1'%3E%3Cpath d='M40 40c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8zm16-16c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8zm0 32c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8zm-32-16c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
          {/* Stylish Header Section */}
          <div className="mb-20 text-center">
            <div className="relative inline-block">
              {/* Decorative accents behind title */}
              <div className="absolute -left-14 top-6 h-32 w-2 bg-gradient-to-b from-indigo-500 to-purple-600"></div>
              <div className="absolute -right-12 top-10 h-28 w-1.5 bg-gradient-to-b from-blue-500 to-cyan-600"></div>

              <h2 className="relative mb-6 text-4xl font-extrabold leading-normal tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                <span className="block">The Future of</span>
                <span className="block text-indigo-600">GP Practice</span>
              </h2>

              {/* Stylish accent elements */}
              <div className="-right-18 absolute top-4 size-5 rounded-full bg-indigo-400/60"></div>
              <div className="top-22 absolute -left-16 size-4 rounded-full bg-purple-400/70"></div>
            </div>

            <div className="relative mx-auto max-w-3xl">
              <p className="text-xl leading-relaxed text-gray-600 lg:text-2xl">
                We're just getting started. Here's our roadmap to transform not just documentation,
                <span className="block sm:inline"> but the entire GP workflow and community collaboration.</span>
              </p>

              {/* Decorative line accent */}
              <div className="absolute -left-8 top-6 h-px w-28 bg-gradient-to-r from-indigo-400 to-transparent"></div>
              <div className="absolute -right-8 bottom-6 h-px w-24 bg-gradient-to-l from-purple-400 to-transparent"></div>
            </div>
          </div>

          {/* Mobile: Enhanced Collapsible Timeline */}
          <div className="space-y-6 lg:hidden">
            {roadmapPhases.slice(0, showAllPhases ? roadmapPhases.length : 2).map((phase) => {
              const colors = colorMap[phase.color];
              const Icon = phase.icon;
              const isExpanded = expandedPhase === phase.id;

              return (
                <div
                  key={phase.id}
                  className={`relative overflow-hidden rounded-2xl border-2 ${colors.border} bg-white/95 shadow-xl transition-all duration-300`}
                >
                  {/* Visual accent background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-30`}></div>

                  {/* Decorative corner accent */}
                  <div className={`absolute -right-6 -top-6 size-16 rounded-full ${colors.bg} opacity-40`}></div>

                  <button
                    onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                    className="relative z-10 w-full p-6 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`rounded-xl ${colors.bg} p-3 shadow-lg`}>
                          <Icon className={`size-6 ${colors.text}`} />
                        </div>
                        <div>
                          <div className={`mb-2 inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${colors.badge}`}>
                            {phase.timeframe}
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">{phase.title}</h3>
                        </div>
                      </div>
                      <ChevronDown className={`size-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  <div className={`relative z-10 px-6 transition-all duration-300 ${isExpanded ? 'pb-6' : 'h-0 overflow-hidden'}`}>
                    <p className="mb-6 text-base leading-relaxed text-gray-700">
                      {phase.description}
                    </p>
                    <div className="space-y-4">
                      {phase.features.map((feature, idx) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <div key={idx} className="flex items-start space-x-3">
                            <div className={`rounded-lg ${colors.bg} p-2`}>
                              <FeatureIcon className={`size-4 ${colors.text}`} />
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">{feature.title}</span>
                              <p className="text-sm text-gray-600">{feature.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Floating accent elements */}
                  <div className="absolute -left-2 top-20 size-3 rounded-full bg-indigo-400/40"></div>
                </div>
              );
            })}

            {!showAllPhases && (
              <button
                onClick={() => setShowAllPhases(true)}
                className="w-full rounded-xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 py-4 text-center font-medium text-indigo-600 transition-all hover:from-indigo-100 hover:to-purple-100"
              >
                <span>Show Complete Roadmap</span>
                <ChevronDown className="ml-2 inline size-4" />
              </button>
            )}
          </div>

          {/* Desktop: Left Timeline Design */}
          <div className="relative hidden lg:block">
            {/* Left timeline line */}
            <div className="absolute left-16 top-0 h-full w-1 bg-gradient-to-b from-green-400 via-blue-400 via-orange-400 to-purple-400 shadow-lg"></div>

            <div className="space-y-16">
              {roadmapPhases.map((phase, index) => {
                const colors = colorMap[phase.color];
                const Icon = phase.icon;

                return (
                  <div key={phase.id} className="relative flex items-start">
                    {/* Enhanced timeline dot */}
                    <div className={`absolute left-12 top-6 size-10 rounded-full ${colors.bg} z-10 border-4 border-white shadow-xl`}>
                      <div className="flex size-full items-center justify-center">
                        <Icon className={`size-5 ${colors.text}`} />
                      </div>
                    </div>

                    {/* Connecting line from dot to card */}
                    <div className={`absolute left-[88px] top-11 h-0.5 w-12 ${colors.bg} opacity-60`}></div>

                    {/* Content card */}
                    <div className="ml-32 w-full max-w-4xl">
                      <div className={`relative overflow-hidden rounded-2xl border-2 ${colors.border} bg-gradient-to-br ${colors.gradient} hover:shadow-3xl p-8 shadow-2xl transition-all duration-300`}>
                        {/* Visual accent background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/15 opacity-70"></div>

                        {/* Decorative corner accents */}
                        <div className={`absolute -right-8 -top-8 size-24 rounded-full ${colors.bg} opacity-25 blur-sm`}></div>
                        <div className={`absolute -bottom-4 -left-4 size-16 rounded-full ${colors.bg} opacity-20 blur-sm`}></div>

                        <div className="relative z-10">
                          <div className="mb-6 flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`rounded-xl ${colors.bg} p-4 shadow-lg`}>
                                <Icon className={`size-8 ${colors.text}`} />
                              </div>
                              <div>
                                <div className={`mb-3 inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${colors.badge}`}>
                                  {phase.timeframe}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 lg:text-3xl">{phase.title}</h3>
                              </div>
                            </div>

                            {/* Phase number badge */}
                            <div className={`flex size-12 items-center justify-center rounded-full ${colors.bg} border-2 ${colors.border} text-lg font-bold ${colors.text}`}>
                              {index + 1}
                            </div>
                          </div>

                          <p className="mb-8 text-lg leading-relaxed text-gray-700 lg:text-xl">
                            {phase.description}
                          </p>

                          <div className="grid gap-6 md:grid-cols-2">
                            {phase.features.map((feature, idx) => {
                              const FeatureIcon = feature.icon;
                              return (
                                <div key={idx} className="flex items-start space-x-4">
                                  <div className={`rounded-lg ${colors.bg} p-3 shadow-md`}>
                                    <FeatureIcon className={`size-5 ${colors.text}`} />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                                    <p className="text-sm leading-relaxed text-gray-600">{feature.description}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Enhanced floating accent elements */}
                        <div className="absolute -left-3 top-20 size-4 rounded-full bg-indigo-400/40"></div>
                        <div className="absolute -right-3 bottom-16 size-5 rounded-full bg-purple-400/35"></div>
                        <div className="absolute right-20 top-8 size-3 rounded-full bg-emerald-400/45"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Timeline end decoration */}
            <div className="absolute bottom-0 left-12 size-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg"></div>
          </div>

          {/* Enhanced Beta Participation CTA */}
          <div className="mt-20 text-center">
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border-2 border-blue-200/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 p-6 shadow-2xl sm:p-8 lg:p-10">
              {/* Background decoratives */}
              <div className="absolute -right-16 -top-16 size-40 rounded-full bg-gradient-to-br from-blue-200/15 to-indigo-300/10 blur-3xl"></div>
              <div className="absolute -bottom-12 -left-12 size-32 rounded-full bg-gradient-to-tr from-purple-200/20 to-pink-300/15 blur-2xl"></div>

              <div className="relative z-10">
                <h3 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
                  Help Shape the Future of GP Practice
                </h3>
                <p className="mb-8 text-base leading-relaxed text-gray-600 sm:text-lg lg:text-xl">
                  As a beta tester, your feedback directly influences our roadmap.
                  <span className="block font-medium text-blue-600 sm:inline"> Be part of building the tools that will transform NZ healthcare.</span>
                </p>
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    className="max-w-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-base text-white shadow-xl transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl sm:px-8 sm:py-4 sm:text-lg lg:px-10 lg:text-xl"
                    onClick={() => setShowEmailModal(true)}
                  >
                    Join Beta & Influence Roadmap
                  </Button>
                </div>
                <p className="mt-6 text-sm text-gray-500 sm:text-base">
                  <span className="font-medium">Priority access</span>
                  {' '}
                  to all new features as they're released
                </p>
              </div>

              {/* Floating accent elements */}
              <div className="absolute -left-4 top-24 size-4 rounded-full bg-blue-400/40"></div>
              <div className="absolute -right-3 bottom-28 size-5 rounded-full bg-purple-400/35"></div>
            </div>
          </div>

          {/* Enhanced Innovation Promise */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-3 rounded-full border border-gray-200/60 bg-gray-50/80 px-8 py-4 shadow-lg">
              <Sparkles className="size-5 text-purple-500" />
              <span className="text-base font-medium text-gray-700">Continuously evolving based on NZ GP feedback</span>
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
