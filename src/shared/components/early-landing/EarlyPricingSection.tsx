import { Award, Clock, Sparkles, User, Zap } from 'lucide-react';

import AnimatedContent from '@/src/shared/components/AnimatedContent';

export const EarlyPricingSection = () => {
  const visionItems = [
    {
      icon: Clock,
      title: 'You Are On Time',
      description: 'Start and finish each consult on schedule, making every 15-minute slot count without feeling rushed.',
      color: 'green',
      size: 'large',
      highlight: 'Never run late again',
    },
    {
      icon: Zap,
      title: 'You Finish Energised, Not Drained',
      description: 'Reduced cognitive load, less stress, and the energy to focus on patients and your life outside work.',
      color: 'blue',
      size: 'large',
      highlight: 'Reclaim your energy',
    },
    {
      icon: Award,
      title: 'Accurate Notes, No Guesswork',
      description: 'Write precise consult notes automatically; no more relying on memory or scribbled post-it reminders.',
      color: 'green',
      size: 'compact',
      highlight: 'Perfect documentation',
    },
    {
      icon: User,
      title: 'Hidden Time-Stealers, Eliminated',
      description: 'Those countless small tasks that pile up between patients (clicks, searches, and admin bits); all handled automatically.',
      color: 'blue',
      size: 'compact',
      highlight: 'Administrative freedom',
    },
  ];

  return (
    <section className="relative bg-gray-900 py-16 sm:py-20 lg:py-24">

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Modern Section Header */}
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <div className="relative">
            {/* Decorative accent behind title */}
            <div className="absolute -left-4 top-4 h-20 w-1.5 bg-gradient-to-b from-nz-green-500 to-nz-blue-600 lg:-left-8"></div>

            <div className="mb-4 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 ring-1 ring-white/20 backdrop-blur-sm">
              <Sparkles className="size-4 text-nz-green-400" />
              The Future of General Practice
            </div>

                          <h2 className="relative mb-6 font-oswald text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
                <span className="block">IMAGINE A CONSULT</span>
                <span className="block text-nz-green-400">
                  WHERE...
                </span>
                          </h2>

          </div>
        </div>

        {/* Modern Vision Grid */}
        <div className="mb-16">
          <div className="grid gap-6 lg:grid-cols-2">
            {visionItems.map((item, index) => {
              const IconComponent = item.icon;

              return (
                <AnimatedContent
                  key={index}
                  distance={40}
                  direction="vertical"
                  duration={0.4}
                  ease="power3.out"
                  threshold={0.1}
                  delay={index * 0.1}
                >
                  <div className="group relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg shadow-gray-900/5 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-gray-900/10 motion-reduce:transform-none motion-reduce:transition-none">
                    {/* Enhanced accent line */}
                    <div className="absolute left-0 top-8 h-16 w-2 rounded-r-full bg-gradient-to-r from-nz-green-500 to-nz-blue-500 shadow-lg"></div>

                    <div className="relative space-y-8">
                      {/* Header with icon and badge */}
                      <div className="flex items-start justify-between">
                        <div className="rounded-2xl border border-nz-green-200 bg-nz-green-100 p-4 shadow-md backdrop-blur-sm transition-all duration-300 group-hover:rotate-2 group-hover:scale-105">
                          <IconComponent className="size-7 text-nz-green-600" />
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm ${
                          item.highlight === 'Never run late again'
? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                          : item.highlight === 'Reclaim your energy'
? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                          : item.highlight === 'Perfect documentation'
? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                          : item.highlight === 'Administrative freedom'
? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'border border-nz-green-200 bg-nz-green-100 text-nz-green-700'
                        }`}
                        >
                          {item.highlight}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="space-y-6">
                        <h3 className="font-open-sans text-lg font-black leading-tight text-gray-900">
                          {index + 1}
.
{item.title}
                        </h3>
                        <p className="text-xs leading-relaxed text-gray-700 sm:text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </AnimatedContent>
              );
            })}
          </div>
        </div>

        {/* Enhanced Call to Action Section */}
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl border-2 border-orange-300 bg-orange-500 p-6 shadow-2xl shadow-orange-900/20 sm:p-8 lg:p-10">
            {/* Distinctive accent line */}
            <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-yellow-400 via-orange-400 to-red-500"></div>

            <div className="relative text-center">
              <h3 className="mb-6 font-open-sans text-2xl font-black text-white sm:text-3xl">
                ClinicPro: Work Smarter, Not Longer
              </h3>

              <div className="mt-6 flex justify-center">
                <div className="h-1.5 w-32 rounded-full bg-gradient-to-r from-nz-green-500 via-emerald-500 to-nz-blue-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
