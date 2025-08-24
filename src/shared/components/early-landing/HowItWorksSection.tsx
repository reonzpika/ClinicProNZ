import { Brain, Clock, FileText, Heart, Home } from 'lucide-react';

import AnimatedContent from '@/src/shared/components/AnimatedContent';

export const HowItWorksSection = () => {
  const problems = [
    {
      icon: Clock,
      title: 'Time Pressure',
      description: 'Back-to-back patients, falling behind, using lunch breaks to catch up.',
      quote: '"I can\'t delve deep enough into complex cases; I\'m always watching the clock."',
      color: 'red',
      impact: 'High',
    },
    {
      icon: FileText,
      title: 'Administrative Burden',
      description: 'The paperwork mountain never ends – notes, referrals, ACC, hospital letters.',
      quote: '"It\'s not just 15 minutes, it\'s 15 minutes plus all the hidden work that no one sees."',
      color: 'nzGreen',
      impact: 'Critical',
    },
    {
      icon: Heart,
      title: 'Emotional Exhaustion',
      description: 'The stress of trying to fit everything into such a short time is taking its toll.',
      quote: '"By the end of the day, I feel like a data entry clerk, not a doctor."',
      color: 'cyan',
      impact: 'Severe',
    },
    {
      icon: Brain,
      title: 'Cognitive Overload',
      description: 'Managing multiple patients in quick succession is mentally exhausting.',
      quote: '"The cognitive load of remembering details from back-to-back patients until I can write notes is immense."',
      color: 'nzBlue',
      impact: 'High',
    },
    {
      icon: Home,
      title: 'Personal Life Sacrifice',
      description: 'The personal cost of professional demands creates guilt on multiple fronts.',
      quote: '"Another night spent catching up on notes… it\'s impacting my family life."',
      color: 'slate',
      impact: 'Critical',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      red: {
        gradient: 'from-white to-gray-50',
        icon: 'bg-red-100 border-red-200',
        iconColor: 'text-red-600',
        accent: 'bg-gradient-to-r from-red-500 to-rose-500',
        border: 'border-red-200',
        impact: 'bg-red-100 text-red-700 border-red-200',
      },
      nzGreen: {
        gradient: 'from-white to-gray-50',
        icon: 'bg-nz-green-100 border-nz-green-200',
        iconColor: 'text-nz-green-600',
        accent: 'bg-gradient-to-r from-nz-green-500 to-cyan-500',
        border: 'border-nz-green-200',
        impact: 'bg-nz-green-100 text-nz-green-700 border-nz-green-200',
      },
      cyan: {
        gradient: 'from-white to-gray-50',
        icon: 'bg-cyan-100 border-cyan-200',
        iconColor: 'text-cyan-600',
        accent: 'bg-gradient-to-r from-cyan-500 to-nz-blue-500',
        border: 'border-cyan-200',
        impact: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      },
      nzBlue: {
        gradient: 'from-white to-gray-50',
        icon: 'bg-nz-blue-100 border-nz-blue-200',
        iconColor: 'text-nz-blue-600',
        accent: 'bg-gradient-to-r from-nz-blue-500 to-purple-500',
        border: 'border-nz-blue-200',
        impact: 'bg-nz-blue-100 text-nz-blue-700 border-nz-blue-200',
      },
      slate: {
        gradient: 'from-white to-gray-50',
        icon: 'bg-slate-100 border-slate-200',
        iconColor: 'text-slate-600',
        accent: 'bg-gradient-to-r from-slate-500 to-gray-500',
        border: 'border-slate-200',
        impact: 'bg-slate-100 text-slate-700 border-slate-200',
      },
    };
    return colors[color as keyof typeof colors] || colors.red;
  };

  return (
    <section className="relative bg-gray-900 py-16 sm:py-20 lg:py-24">

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <div className="relative mb-8">
            <div className="absolute -left-6 top-2 h-20 w-1 bg-gradient-to-b from-nz-green-400 via-cyan-400 to-nz-blue-400"></div>

            <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/20 backdrop-blur-sm">
              <div className="size-2 rounded-full bg-gradient-to-r from-nz-green-400 to-cyan-400"></div>
              Current Reality Check
            </div>

            <div className="relative mb-6">
              <AnimatedContent
                distance={40}
                direction="vertical"
                duration={0.8}
                ease="power3.out"
                threshold={0.1}
                delay={0.1}
              >
                <h2 className="text-center">
                  <span className="block font-oswald text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
                    DOES THIS SOUND
                  </span>
                  <span className="mt-2 block font-oswald text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
                    <span className="bg-gradient-to-r from-nz-blue-400 to-nz-green-400 bg-clip-text text-transparent">FAMILIAR?</span>
                  </span>
                </h2>
              </AnimatedContent>
            </div>

            {/* Floating accent dots */}
            <div className="absolute -right-8 top-8 size-4 rounded-full bg-gradient-to-br from-nz-green-400 to-cyan-400 shadow-lg"></div>
            <div className="absolute -left-8 bottom-8 size-3 rounded-full bg-gradient-to-br from-nz-blue-400 to-purple-400 shadow-lg"></div>
          </div>
        </div>

        {/* Animated Problem Cards - Asymmetric Grid */}
        <div className="mb-16">
          {/* First Row - 2 Cards */}
          <AnimatedContent
            distance={50}
            direction="horizontal"
            duration={0.5}
            ease="power3.out"
            threshold={0.1}
            delay={0.1}
          >
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              {problems.slice(0, 2).map((problem, index) => {
                const IconComponent = problem.icon;
                const colors = getColorClasses(problem.color);

                return (
                  <div
                    key={index}
                    className={`group relative overflow-hidden rounded-3xl border ${colors.border} bg-gradient-to-br ${colors.gradient} p-8 shadow-lg shadow-gray-900/5 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-gray-900/10 motion-reduce:transform-none motion-reduce:transition-none`}
                  >
                    {/* Enhanced accent line */}
                    <div className={`absolute left-0 top-8 h-16 w-2 rounded-r-full ${colors.accent} shadow-lg`}></div>

                    <div className="relative space-y-8">
                      {/* Header with icon and impact badge */}
                      <div className="flex items-start justify-between">
                        <div className={`rounded-2xl border ${colors.icon} p-4 shadow-md backdrop-blur-sm transition-all duration-300 group-hover:rotate-2 group-hover:scale-105`}>
                          <IconComponent className={`size-7 ${colors.iconColor}`} />
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm ${colors.impact}`}>
                          {problem.impact}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="space-y-6">
                        <h3 className="font-open-sans text-lg font-black leading-tight text-gray-900">
                          {index + 1}
.
{problem.title}
                        </h3>

                        <p className="text-xs leading-relaxed text-gray-700 sm:text-sm">
                          {problem.description}
                        </p>

                        {/* Enhanced quote design */}
                        <div className="relative rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-md backdrop-blur-md">
                          <div className="absolute -left-2 top-6 size-4 rotate-45 border-l border-t border-gray-200 bg-gray-50"></div>
                          <blockquote className="text-sm font-medium italic leading-relaxed text-gray-700">
                            {problem.quote}
                          </blockquote>
                          {/* Subtle floating accent */}
                          <div className="absolute -right-2 -top-2 size-3 rounded-full bg-gradient-to-br from-nz-green-400/60 to-cyan-400/60 blur-sm"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </AnimatedContent>

          {/* Second Row - 3 Cards */}
          <AnimatedContent
            distance={50}
            direction="horizontal"
            reverse
            duration={0.5}
            ease="power3.out"
            threshold={0.1}
            delay={0.2}
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {problems.slice(2).map((problem, index) => {
                const IconComponent = problem.icon;
                const colors = getColorClasses(problem.color);

                return (
                  <div
                    key={index + 2}
                    className={`group relative overflow-hidden rounded-3xl border ${colors.border} bg-gradient-to-br ${colors.gradient} p-6 shadow-lg shadow-gray-900/5 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-gray-900/10 motion-reduce:transform-none motion-reduce:transition-none`}
                  >
                    {/* Enhanced accent line */}
                    <div className={`absolute left-0 top-6 h-12 w-2 rounded-r-full ${colors.accent} shadow-lg`}></div>

                    <div className="relative space-y-6">
                      {/* Header with icon and impact badge */}
                      <div className="flex items-start justify-between">
                        <div className={`rounded-xl border ${colors.icon} p-3 shadow-md backdrop-blur-sm transition-all duration-300 group-hover:rotate-2 group-hover:scale-105`}>
                          <IconComponent className={`size-6 ${colors.iconColor}`} />
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm ${colors.impact}`}>
                          {problem.impact}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="space-y-6">
                        <h3 className="font-open-sans text-base font-black leading-tight text-gray-900 sm:text-lg">
                          {index + 3}
.
{problem.title}
                        </h3>

                        <p className="text-xs leading-relaxed text-gray-700 sm:text-sm">
                          {problem.description}
                        </p>

                        {/* Enhanced compact quote design */}
                        <div className="relative rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-md backdrop-blur-md">
                          <div className="absolute -left-1.5 top-4 size-3 rotate-45 border-l border-t border-gray-200 bg-gray-50"></div>
                          <blockquote className="text-xs font-medium italic leading-relaxed text-gray-700 sm:text-sm">
                            {problem.quote}
                          </blockquote>
                          {/* Subtle floating accent */}
                          <div className="absolute -right-2 -top-2 size-2.5 rounded-full bg-gradient-to-br from-nz-blue-400/60 to-purple-400/60 blur-sm"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </AnimatedContent>
        </div>

      </div>
    </section>
  );
};
