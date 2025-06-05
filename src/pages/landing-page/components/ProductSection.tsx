'use client';

export const ProductSection = () => {
  return (
    <section id="features" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Introducing ClinicalMind AI Scribe
          </h2>
          <p className="text-xl text-gray-600">
            The only AI scribe designed around how real doctors actually work
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <h3 className="mb-8 text-center text-2xl font-bold text-gray-900">How It Works</h3>

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="flex size-8 items-center justify-center rounded-full bg-blue-600 font-bold text-white">1</div>
              <div>
                <h4 className="mb-2 text-lg font-semibold text-gray-900">Record</h4>
                <p className="text-gray-600">Hit one button, have your conversation</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex size-8 items-center justify-center rounded-full bg-blue-600 font-bold text-white">2</div>
              <div>
                <h4 className="mb-2 text-lg font-semibold text-gray-900">Generate</h4>
                <p className="text-gray-600">Get your SOAP note in under 30 seconds</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex size-8 items-center justify-center rounded-full bg-blue-600 font-bold text-white">3</div>
              <div>
                <h4 className="mb-2 text-lg font-semibold text-gray-900">Copy & Paste</h4>
                <p className="text-gray-600">Drop it into your EMR and you're done</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
