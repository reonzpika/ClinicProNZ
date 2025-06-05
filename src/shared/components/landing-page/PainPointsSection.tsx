'use client';

export const PainPointsSection = () => {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Sound Familiar? You're Not Alone...
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-white p-8 shadow-md">
            <div className="mb-4 text-6xl">😤</div>
            <blockquote className="italic leading-relaxed text-gray-700">
              "I'm so over spending hours charting after work. Between geriatric patients, complex histories,
              and trying to keep up with everything, I'm ready to give AI scribes a shot. But holy cow,
              there are like a million options out there, and I have no idea which ones actually work."
            </blockquote>
          </div>

          <div className="rounded-lg bg-white p-8 shadow-md">
            <div className="mb-4 text-6xl">💸</div>
            <blockquote className="italic leading-relaxed text-gray-700">
              "We use DAX built into Epic and it's like $500 a month... Most of these AI scribes are just
              way too expensive for a private practice. The enterprise solutions are overkill for what we actually need."
            </blockquote>
          </div>

          <div className="rounded-lg bg-white p-8 shadow-md">
            <div className="mb-4 text-6xl">🤦‍♀️</div>
            <blockquote className="italic leading-relaxed text-gray-700">
              "I've tried Freed AI and found I needed to make numerous edits including fixing the misspellings
              of multiple medications and totally fixing the plan section which was not accurate to what we had discussed.
              Sometimes it adds things we didn't talk about in the assessment."
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
};
