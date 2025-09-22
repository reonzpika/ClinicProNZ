'use client';

import { Headphones, Mic, ShieldCheck, Sparkles, Smartphone } from 'lucide-react';

export const AiScribe = () => {
  const features = [
    {
      icon: Headphones,
      title: 'Audio to text transcription',
      description: 'Accurate speech-to-text optimised for NZ accents and clinical language.',
      color: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200',
    },
    {
      icon: Smartphone,
      title: 'Record on mobile or desktop',
      description: 'Start recording from your phone or computer — no special setup.',
      color: 'from-green-50 to-teal-50',
      border: 'border-green-200',
    },
    {
      icon: ShieldCheck,
      title: 'Easy consent process',
      description: 'Simple, clear prompts to capture verbal consent and keep records tidy.',
      color: 'from-amber-50 to-orange-50',
      border: 'border-amber-200',
    },
    {
      icon: Sparkles,
      title: 'Easy to add additional information',
      description: 'Append extra notes, clarify problems, and tweak content live.',
      color: 'from-purple-50 to-pink-50',
      border: 'border-purple-200',
    },
    {
      icon: Mic,
      title: 'Customisable note structure',
      description: 'Templates tuned for NZ GP workflows — adjust headings to your style.',
      color: 'from-cyan-50 to-blue-50',
      border: 'border-cyan-200',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%233b82f6' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='30' cy='30' r='1.2'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center lg:mb-16">
          <div className="relative inline-block">
            <div className="absolute -left-6 top-6 h-14 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 lg:-left-10 lg:h-16"></div>
            <div className="absolute -right-6 top-10 h-12 w-1 bg-gradient-to-b from-green-500 to-teal-600 lg:-right-10 lg:h-14"></div>
            <h2 className="relative text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              AI Scribe Built for NZ GPs
            </h2>
          </div>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Capture the consult naturally. Your notes, structured and ready to file.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className={`group relative overflow-hidden rounded-2xl border ${feature.border} bg-gradient-to-br ${feature.color} p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/20 opacity-40"></div>
                <div className="relative z-10">
                  <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-white/70 p-3 shadow-md">
                    <Icon className="size-6 text-gray-800" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-700">{feature.description}</p>
                </div>
                <div className="absolute -right-4 -top-4 size-10 rounded-full bg-white/30"></div>
                <div className="absolute -left-3 -bottom-3 size-8 rounded-full bg-white/20"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AiScribe;

