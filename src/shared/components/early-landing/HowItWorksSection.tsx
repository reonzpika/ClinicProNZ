import { CheckCircle, Monitor, QrCode, Smartphone } from 'lucide-react';

export const HowItWorksSection = () => {
  const steps = [
    {
      icon: Monitor,
      title: 'Open in Browser',
      description: 'ClinicPro runs entirely in your browser with zero setup',
      color: 'nz-green',
    },
    {
      icon: QrCode,
      title: 'Scan and Record',
      description: 'Scan QR code with your phone to instantly start recording',
      color: 'nz-blue',
    },
    {
      icon: Smartphone,
      title: 'Add Extra Details',
      description: 'Type in exam findings or observations not captured by recording',
      color: 'nz-green',
    },
    {
      icon: CheckCircle,
      title: 'Generate and Review',
      description: 'Clean, NZ-specific clinical notes ready in moments',
      color: 'nz-blue',
    },
  ];

  return (
    <section className="relative bg-gradient-to-br from-gray-50 via-white to-nz-green-50/30 py-16 sm:py-24 lg:py-32">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="to-nz-blue-300/8 absolute -right-40 top-20 size-[500px] rounded-full bg-gradient-to-br from-nz-green-200/10 blur-3xl"></div>
        <div className="from-nz-blue-200/8 absolute -left-60 bottom-32 size-[600px] rounded-full bg-gradient-to-tr to-nz-green-300/10 blur-3xl"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="relative">
            {/* Decorative accent behind title */}
            <div className="absolute -left-4 top-4 h-16 w-1.5 bg-gradient-to-b from-nz-green-500 to-nz-blue-600 sm:h-20 lg:-left-8"></div>

            <h2 className="relative text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="block">How ClinicPro</span>
              <span className="block text-nz-green-600">Works</span>
            </h2>

            {/* Stylish accent elements */}
            <div className="absolute -right-8 top-4 size-3 rounded-full bg-nz-green-400/70 sm:size-4 lg:-right-12"></div>
            <div className="absolute -left-6 top-16 size-2 rounded-full bg-nz-blue-400/60 sm:size-3 lg:-left-10"></div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isGreen = step.color === 'nz-green';

            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/95 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                {/* Visual accent background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  isGreen ? 'from-nz-green-50 via-nz-green-50/50 to-nz-blue-50/30' : 'from-nz-blue-50 via-nz-blue-50/50 to-nz-green-50/30'
                } opacity-50`}
                >
                </div>

                {/* Decorative corner accents */}
                <div className={`absolute -right-6 -top-6 size-12 rounded-full ${
                  isGreen ? 'bg-nz-green-100' : 'bg-nz-blue-100'
                } opacity-30`}
                >
                </div>
                <div className={`absolute -bottom-3 -left-3 size-8 rounded-full ${
                  isGreen ? 'bg-nz-green-100' : 'bg-nz-blue-100'
                } opacity-20`}
                >
                </div>

                <div className="relative z-10 text-center">
                  {/* Step Number */}
                  <div className="mb-4 flex justify-center">
                    <div className={`flex size-8 items-center justify-center rounded-full text-sm font-bold text-white ${
                      isGreen ? 'bg-nz-green-600' : 'bg-nz-blue-600'
                    }`}
                    >
                      {index + 1}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="mb-4 flex justify-center">
                    <div className={`rounded-xl p-3 shadow-lg transition-transform group-hover:scale-105 ${
                      isGreen ? 'bg-nz-green-100' : 'bg-nz-blue-100'
                    }`}
                    >
                      <IconComponent className={`size-8 ${
                        isGreen ? 'text-nz-green-600' : 'text-nz-blue-600'
                      }`}
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="mb-3 text-xl font-bold leading-tight text-gray-900">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-gray-700">
                    {step.description}
                  </p>
                </div>

                {/* Subtle side accent */}
                <div className={`absolute inset-y-6 left-0 w-1 rounded-r-full ${
                  isGreen ? 'bg-gradient-to-b from-nz-green-500 to-nz-green-600' : 'bg-gradient-to-b from-nz-blue-500 to-nz-blue-600'
                }`}
                >
                </div>
              </div>
            );
          })}
        </div>

        {/* Description */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="rounded-2xl border-2 border-nz-blue-200/50 bg-gradient-to-r from-nz-blue-50/80 to-nz-green-50/60 p-6 shadow-lg">
            <p className="text-lg font-medium text-gray-800">
              It captures your consultation speech live, then uses all available data — including your typed notes — to generate a clean, NZ-specific clinical note that's ready for review.
            </p>
            <p className="mt-4 text-base font-semibold text-nz-green-700">
              You stay fully in control: review and edit your notes before saving, ensuring accuracy and privacy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
