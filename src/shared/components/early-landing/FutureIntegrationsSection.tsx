import { Brain, Camera, CheckCircle, Mic, Settings, Timer, Wrench, Zap } from 'lucide-react';

import AnimatedContent from '@/src/shared/components/AnimatedContent';

export const FutureIntegrationsSection = () => {
  const heroFeatures = [
    {
      icon: Mic,
      title: '1. Write perfect notes while talking to patients',
      description: 'Real-time transcription and structured note generation',
      items: [
        'Transcribe and summarise consults automatically',
        'Auto-generate structured notes into NZ-specific templates',
        'Save ~45 minutes daily on documentation',
      ],
      color: 'green',
      category: 'Core AI',
      timeSaved: '45 min/day',
      highlight: 'Most Popular',
    },
    {
      icon: Settings,
      title: '2. Never touch another ACC form',
      description: 'Eliminate repetitive administrative tasks',
      sections: [
        {
          subtitle: 'ACC Forms & Coding',
          items: [
            'Draft injury descriptions and suggest correct ACC Read codes',
            'Instant employer lookup with correct names and addresses',
          ],
        },
        {
          subtitle: 'Referrals & Messaging',
          items: [
            'Generate specialist-ready referral letters from consult data',
            'Auto-create patient-friendly result messages with lifestyle advice',
          ],
        },
      ],
      color: 'blue',
      category: 'Automation',
      timeSaved: '30 min/day',
      highlight: 'Time Saver',
    },
  ];

  const supportingFeatures = [
    {
      icon: Brain,
      title: '3. Get guidelines in seconds, not minutes',
      items: [
        'Search NZ guidelines, PDFs, and HealthPathways simultaneously',
        'Get referenced answers in ~10 seconds',
        'Reduce cognitive load with instant clinical support',
      ],
      color: 'green',
      category: 'Decision Support',
      timeSaved: '15 min/day',
    },
    {
      icon: Camera,
      title: '4. Secure Clinical Photos',
      items: [
        'Capture via secure web interface — never on personal devices',
        'Auto-resize, label, and attach directly to PMS',
        'Maintain privacy while saving time',
      ],
      color: 'blue',
      category: 'Documentation',
      timeSaved: '10 min/day',
    },
    {
      icon: Wrench,
      title: '5. and more...',
      items: [
        'Custom SOAP note templates tailored to your practice style',
        'Automated patient recall systems and follow-up workflows',
        'Integration with your existing PMS and third-party tools',
        'Bespoke admin automation - from idea to live tool in days',
        'White-label solutions for your practice group or PHO',
      ],
      color: 'green',
      category: 'Customisation',
      timeSaved: 'Unlimited',
    },
  ];

  const getColorClasses = (color: string) => {
    return color === 'green'
      ? {
          gradient: 'from-white to-gray-50',
          icon: 'bg-nz-green-100 border-nz-green-200',
          iconColor: 'text-nz-green-600',
          accent: 'bg-gradient-to-br from-nz-green-500 to-emerald-600',
          border: 'border-nz-green-200',
          highlight: 'bg-nz-green-100 text-nz-green-700 border-nz-green-200',
          category: 'bg-nz-green-100 text-nz-green-700 border-nz-green-200',
          timeBadge: 'bg-nz-green-500 text-white',
        }
      : {
          gradient: 'from-white to-gray-50',
          icon: 'bg-nz-blue-100 border-nz-blue-200',
          iconColor: 'text-nz-blue-600',
          accent: 'bg-gradient-to-br from-nz-blue-500 to-cyan-600',
          border: 'border-nz-blue-200',
          highlight: 'bg-nz-blue-100 text-nz-blue-700 border-nz-blue-200',
          category: 'bg-nz-blue-100 text-nz-blue-700 border-nz-blue-200',
          timeBadge: 'bg-nz-blue-500 text-white',
        };
  };

  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-24">

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Modern Section Header */}
        <AnimatedContent
          distance={60}
          direction="vertical"
          duration={0.8}
          ease="power3.out"
          threshold={0.1}
        >
          <div className="mx-auto mb-16 max-w-5xl text-center">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-nz-blue-50/50 px-5 py-2.5 text-sm font-semibold text-nz-green-700 ring-1 ring-nz-green-200/40 backdrop-blur-sm">
              <Zap className="size-4 text-nz-green-600" />
              Smart Technology Integration
            </div>

            <h2 className="mb-6 font-oswald text-3xl font-black leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-5xl xl:text-6xl">
              HOW CLINICPRO MAKES
              <span className="block text-nz-green-600">
                IT POSSIBLE
              </span>
            </h2>

          </div>
        </AnimatedContent>

        {/* Hero Features - Asymmetric 2-Column Layout */}
        <div className="mb-16 space-y-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {heroFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
              const colors = getColorClasses(feature.color);

            return (
              <AnimatedContent
                key={feature.title}
                distance={80}
                direction="horizontal"
                reverse={index % 2 === 1}
                duration={0.8}
                ease="power3.out"
                threshold={0.1}
                delay={0.2 + index * 0.2}
              >
                <div
                  className={`group relative overflow-hidden rounded-3xl border ${colors.border} bg-gradient-to-br ${colors.gradient} p-8 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-gray-900/10 sm:p-10`}
                >
                  {/* Modern accent elements */}
                  <div className={`absolute left-0 top-0 h-28 w-2 rounded-r-full ${colors.accent}`}></div>
                  <div className={`absolute -right-8 -top-8 size-32 rounded-full ${colors.accent} opacity-5`}></div>

                  <div className="relative space-y-8">
                    {/* Header with badges */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className={`rounded-2xl border ${colors.icon} p-4 shadow-lg transition-transform group-hover:scale-105`}>
                          <IconComponent className={`size-8 ${colors.iconColor}`} />
                        </div>
                        <div className="space-y-1">

                        </div>
                      </div>

                      <div className={`flex items-center gap-2 rounded-full px-4 py-2 shadow-sm ${colors.timeBadge}`}>
                        <Timer className="size-4" />
                        <span className="text-sm font-bold">
Saves
{feature.timeSaved}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <div>
                                                <h3 className="mb-2 font-open-sans text-xl font-black leading-tight text-gray-900 sm:text-2xl">
                          {feature.title}
                                                </h3>
                        <p className="text-sm font-medium leading-relaxed text-gray-700 sm:text-base">
                          {feature.description}
                        </p>
                      </div>

                      {/* Feature items */}
                    {feature.items && (
                      <ul className="space-y-3">
                        {feature.items.map(item => (
                          <li key={`${feature.title}-${item.substring(0, 20)}`} className="flex items-start gap-3">
                              <CheckCircle className={`mt-0.5 size-5 shrink-0 ${colors.iconColor}`} />
                              <span className="text-sm leading-relaxed text-gray-700 sm:text-base">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                      {/* Feature sections for complex features */}
                    {feature.sections && (
                        <div className="space-y-5">
                        {feature.sections.map(section => (
                            <div key={section.subtitle} className="rounded-2xl bg-white/60 p-4 backdrop-blur-sm">
                              <h4 className={`mb-3 font-open-sans text-lg font-black ${colors.iconColor.replace('text-', 'text-').replace('-600', '-700')}`}>
                              {section.subtitle}
                              </h4>
                            <ul className="space-y-2">
                              {section.items.map(item => (
                                <li key={`${section.subtitle}-${item.substring(0, 20)}`} className="flex items-start gap-3">
                                    <div className={`mt-1.5 size-2 shrink-0 rounded-full ${colors.iconColor.replace('text-', 'bg-')}`}></div>
                                    <span className="text-sm leading-relaxed text-gray-700">{item}</span>
                                </li>
                              ))}
                            </ul>
                            </div>
                        ))}
                        </div>
                    )}
                    </div>
                  </div>
                </div>
              </AnimatedContent>
            );
          })}
          </div>
        </div>

        {/* Supporting Features - 3-Column Grid */}
        <div className="mb-16">

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {supportingFeatures.map((feature) => {
              const IconComponent = feature.icon;
              const colors = getColorClasses(feature.color);

              return (
                <div
                  key={feature.title}
                  className={`group relative overflow-hidden rounded-3xl border ${colors.border} bg-gradient-to-br ${colors.gradient} p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-gray-900/10 sm:p-8`}
                >
                  {/* Modern accent */}
                  <div className={`absolute left-0 top-0 h-20 w-1.5 rounded-r-full ${colors.accent}`}></div>

                  <div className="relative space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className={`rounded-xl border ${colors.icon} p-3 shadow-lg transition-transform group-hover:scale-105`}>
                        <IconComponent className={`size-6 ${colors.iconColor}`} />
                      </div>
                      <div className="text-right">

                        <div className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${colors.timeBadge}`}>
                          <Timer className="size-3" />
                          +
{feature.timeSaved}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <h4 className="font-open-sans text-lg font-black leading-tight text-gray-900 sm:text-xl">
                        {feature.title}
                      </h4>

                      <ul className="space-y-3">
                        {feature.items.map(item => (
                          <li key={`${feature.title}-${item.substring(0, 20)}`} className="flex items-start gap-2">
                            <CheckCircle className={`mt-0.5 size-4 shrink-0 ${colors.iconColor}`} />
                            <span className="text-sm leading-relaxed text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Summary Section */}

      </div>
    </section>
  );
};
