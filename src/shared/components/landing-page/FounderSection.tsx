'use client';

export const FounderSection = () => {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Built by a Doctor Who Gets It
          </h2>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-lg">
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <div className="flex size-48 items-center justify-center rounded-full bg-gray-200">
              <span className="text-lg text-gray-500">Photo</span>
            </div>

            <div className="flex-1">
              <blockquote className="mb-6 text-lg leading-relaxed text-gray-700">
                "I'm Dr. [Name], a practicing GP who was fed up with spending hours on documentation every night.
                After trying every AI scribe on the market and finding them either too expensive, too complex,
                or just plain inaccurate, I decided to build something that actually works for real doctors.

                ClinicalMind isn't just another transcription tool - it's designed around how GPs actually think
                and work. Every feature comes from real clinical experience and feedback from practicing physicians."
              </blockquote>

              <div className="font-semibold text-blue-600">
                Dr. [Name], MBBS, FRACGP
                <div className="font-normal text-gray-600">Founder & Practicing GP</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
