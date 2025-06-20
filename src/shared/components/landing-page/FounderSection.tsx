'use client';

export const FounderSection = () => {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            A NZ GP Who's Been in Your Shoes
          </h2>
          <p className="text-xl text-gray-600">
            Built by someone who truly understands the daily challenges of NZ general practice.
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-lg">
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <div className="flex size-48 items-center justify-center rounded-full border-4 border-blue-50 bg-gradient-to-br from-blue-100 to-indigo-100">
              <div className="text-center">
                <div className="mb-1 text-4xl font-bold text-blue-600">Dr</div>
                <div className="text-lg text-blue-700">RY</div>
              </div>
            </div>

            <div className="flex-1">
              <blockquote className="mb-6 text-lg leading-relaxed text-gray-700">
                "After 10+ years in healthcare, I was tired of staying late after work to finish my notes.
                The documentation burden was taking time away from patients and from my life.

                <br />
                <br />

                But it wasn't just about saving time — I wanted to create better documentation for continuity of care.
                With more GPs working part-time, patients often see different doctors.
                <span className="font-medium text-gray-900">Clear, comprehensive notes are essential for seamless patient care across providers.</span>

                <br />
                <br />

                I tried every solution out there, but they were either too expensive, too complex, or built for overseas healthcare systems.
                So I decided to build something specifically for NZ GPs, by a NZ GP.

                <br />
                <br />

                <span className="font-medium text-blue-700">ClinicPro isn't just another transcription tool</span>
                {' '}
                — it's designed around how we actually work,
                with NZ medical terminology, local guidelines, and the clinical workflows we use every day."
              </blockquote>

              <div className="border-t pt-6">
                <div className="flex items-start space-x-4">
                  <div>
                    <div className="text-lg font-semibold text-blue-600">
                      Dr. Ryo Eguchi
                    </div>
                    <div className="mb-3 text-gray-600">Founder & Practicing GP</div>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span className="size-2 rounded-full bg-blue-500"></span>
                        <span>4 years as a GP, 10+ years in healthcare</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="size-2 rounded-full bg-blue-500"></span>
                        <span>CEO & Founder, ClinicPro</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="size-2 rounded-full bg-blue-500"></span>
                        <span>Passionate about technology in healthcare</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-100 bg-white p-6 text-center">
            <div className="mb-2 text-3xl font-bold text-blue-600">10+</div>
            <div className="text-sm text-gray-600">Years in NZ healthcare</div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-6 text-center">
            <div className="mb-2 text-3xl font-bold text-green-600">80%</div>
            <div className="text-sm text-gray-600">Less time on notes</div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-6 text-center">
            <div className="mb-2 text-3xl font-bold text-purple-600">100%</div>
            <div className="text-sm text-gray-600">Focused on NZ GP needs</div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center space-y-2 rounded-xl border border-blue-200 bg-blue-50 px-8 py-4">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-blue-600">💡</span>
              <span className="text-sm font-medium text-blue-800">"Every feature comes from real clinical experience"</span>
            </div>
            <span className="text-xs text-blue-600">Help shape the future of NZ clinical documentation</span>
          </div>
        </div>
      </div>
    </section>
  );
};
