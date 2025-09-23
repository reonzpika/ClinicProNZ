'use client';

export const ConclusionSection = () => {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%233b82f6' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='30' cy='30' r='1.2'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mb-12 lg:mb-16">
          <div className="relative inline-block">
            <div className="absolute -left-6 top-4 h-14 w-1 bg-gradient-to-b from-nz-green-500 to-nz-blue-600 lg:-left-10 lg:h-16"></div>
            <h2 className="relative text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              In summary
            </h2>
          </div>
        </div>

        {/* Feature summary */}
        <div className="mb-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-xl font-bold text-gray-900">AI Scribe</h3>
            <p className="text-gray-700">Capture the consult efficiently. Structured notes fast. Audio for subjective, optional typed objectives — you’re in charge.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-xl font-bold text-gray-900">Clinical Image</h3>
            <p className="text-gray-700">Snap on mobile, auto‑resize, download on desktop. Keeps images off personal phones; referral‑friendly sizes.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-xl font-bold text-gray-900">Search & Chat</h3>
            <p className="text-gray-700">Search NZ resources in one place — like Google, for GPs. Referenced answers fast; open sources in one click.</p>
          </div>
        </div>

        {/* Key phrases */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
            <h4 className="mb-2 text-lg font-semibold text-gray-900">Does this sound familiar?</h4>
            <p className="text-gray-700">Back‑to‑back patients, notes slipping after hours, and admin piling up.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
            <h4 className="mb-2 text-lg font-semibold text-gray-900">Imagine a consult where…</h4>
            <p className="text-gray-700">You stay present, capture what matters, and finish on time — every day.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
            <h4 className="mb-2 text-lg font-semibold text-gray-900">How ClinicPro makes it possible</h4>
            <p className="text-gray-700">AI Scribe, Clinical Image, and Search & Chat working together — less admin, better notes.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a
            href="#start"
            className="inline-block rounded-xl bg-orange-600 px-6 py-3 text-base font-bold text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-orange-700 hover:shadow-orange-500/25"
          >
            Get more done in 15 min
          </a>
        </div>
      </div>
    </section>
  );
};

export default ConclusionSection;

