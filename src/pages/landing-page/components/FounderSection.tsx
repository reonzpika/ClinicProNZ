'use client';

export const FounderSection = () => {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-md md:p-12">
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <div className="flex size-24 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-600">
              Dr
            </div>

            <div className="flex-1 text-center md:text-left">
              <blockquote className="mb-4 text-lg italic leading-relaxed text-gray-700">
                "As a GP registrar in New Zealand, I've felt the pain of endless documentation myself.
                That's why we built ClinicalMind differently - start free, prove the value, then upgrade
                when you want the clinical intelligence features that actually help patient care.
                No enterprise complexity, no inflated pricing."
              </blockquote>
              <cite className="font-semibold not-italic text-blue-600">
                - Dr. [Founder Name], Founder & CEO
              </cite>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
