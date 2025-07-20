import { BookOpen, Database, FileSearch, MessageCircle, Zap } from 'lucide-react';

export const FutureIntegrationsSection = () => {
  const integrations = [
    {
      icon: FileSearch,
      title: 'Patient Notes Summary',
      description: 'Instantly summarise relevant patient notes from your PMS',
      color: 'nz-green',
    },
    {
      icon: BookOpen,
      title: 'Clinical Resource Search',
      description: 'Search HealthPathways, BPAC, and NZ Formulary based on what you\'re seeing',
      color: 'nz-blue',
    },
    {
      icon: MessageCircle,
      title: 'Patient Advice Generator',
      description: 'Automatically find and send tailored patient advice',
      color: 'nz-green',
    },
    {
      icon: Database,
      title: 'PMS Integration',
      description: 'Seamless connection with your practice management system',
      color: 'nz-blue',
    },
  ];

  return (
    <section className="relative bg-gradient-to-br from-gray-50 via-white to-nz-blue-50/30 py-16 sm:py-24 lg:py-32">
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
              <span className="block">Future Smart</span>
              <span className="block text-nz-green-600">Integrations</span>
            </h2>

            {/* Stylish accent elements */}
            <div className="absolute -right-8 top-4 size-3 rounded-full bg-nz-green-400/70 sm:size-4 lg:-right-12"></div>
            <div className="absolute -left-6 top-16 size-2 rounded-full bg-nz-blue-400/60 sm:size-3 lg:-left-10"></div>
          </div>
        </div>

        {/* Introduction */}
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <p className="text-lg leading-relaxed text-gray-700 sm:text-xl lg:text-2xl">
            <span className="font-semibold text-nz-green-700">I'm actively working towards partnerships</span>
            {' '}
            to deliver a truly seamless workflow for NZ GPs.
          </p>

          <div className="mt-8 rounded-2xl border-2 border-nz-green-200/50 bg-gradient-to-r from-nz-green-50/80 to-nz-blue-50/60 p-6 shadow-lg">
            <p className="text-lg font-medium text-gray-800">
              Some of the smart workflows I'm prototyping:
            </p>
          </div>
        </div>

        {/* Integration Cards */}
        <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {integrations.map((integration, index) => {
            const IconComponent = integration.icon;
            const isGreen = integration.color === 'nz-green';

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
                  <h3 className="mb-3 text-lg font-bold leading-tight text-gray-900">
                    {integration.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-gray-700">
                    {integration.description}
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

        {/* Vision Statement */}
        <div className="text-center">
          <div className="mx-auto max-w-4xl rounded-2xl border-2 border-nz-blue-200/50 bg-gradient-to-r from-nz-blue-50/80 to-nz-green-50/60 p-8 shadow-lg">
            <p className="mb-4 text-lg font-medium text-gray-800">
              These tools are early-stage — but the vision is clear:
            </p>
            <p className="text-2xl font-bold text-nz-green-700">
              less admin, more clinical clarity.
            </p>

            <div className="mt-8 flex items-center justify-center gap-2">
              <Zap className="size-6 text-nz-green-600" />
              <p className="text-lg font-semibold text-gray-800">
                New features added weekly. Your voice shapes every update.
              </p>
            </div>

            <p className="mt-4 text-base text-gray-600">
              This isn't corporate healthcare tech — it's built by a GP who responds to messages personally.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
