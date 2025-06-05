'use client';

export const SolutionSection = () => {
  return (
    <section className="bg-blue-600 py-20 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-8 text-4xl font-bold">
            What If Documentation Actually Worked For You?
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mb-6 text-6xl">🏃‍♂️</div>
            <h3 className="mb-4 text-xl font-semibold">Leave on Time</h3>
            <p className="leading-relaxed text-blue-100">
              Walk out on time every day, knowing your notes are complete and accurate
            </p>
          </div>

          <div className="text-center">
            <div className="mb-6 text-6xl">👩‍⚕️</div>
            <h3 className="mb-4 text-xl font-semibold">Focus on Patients</h3>
            <p className="leading-relaxed text-blue-100">
              Focus entirely on your patients during visits, not scrambling to remember details
            </p>
          </div>

          <div className="text-center">
            <div className="mb-6 text-6xl">💰</div>
            <h3 className="mb-4 text-xl font-semibold">Start Free</h3>
            <p className="leading-relaxed text-blue-100">
              Start with completely free reliable notes, upgrade only when you want clinical intelligence
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
