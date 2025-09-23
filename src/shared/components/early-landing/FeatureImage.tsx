'use client';

export const FeatureImage = () => {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%230ea5e9' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='30' cy='30' r='1.2'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center lg:mb-16">
          <div className="relative inline-block">
            <div className="absolute -left-6 top-6 h-14 w-1 bg-gradient-to-b from-cyan-500 to-blue-600 lg:-left-10 lg:h-16"></div>
            <div className="absolute -right-6 top-10 h-12 w-1 bg-gradient-to-b from-emerald-500 to-teal-600 lg:-right-10 lg:h-14"></div>
            <h2 className="relative text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              FeatureImage — images that fit your referral workflow
            </h2>
          </div>
        </div>

        {/* Mobile upload band (copy left, screenshot right) */}
        <div className="mb-12 grid items-center gap-10 lg:mb-16 lg:grid-cols-2 lg:gap-16">
          <div>
            <h3 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">Snap on mobile. Resize automatically.</h3>
            <p className="mb-6 text-lg leading-relaxed text-gray-700">
              Upload from your phone without saving to your personal gallery. Images are auto‑resized for referrals and ready on your desktop.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Upload from mobile via QR or link</li>
              <li>• Not saved on GP’s personal phone</li>
              <li>• Auto‑resize to referral‑friendly size</li>
              <li>• Ready to download on desktop and attach to PMS/referral</li>
              <li>• Also supports desktop upload when you’re at your computer</li>
            </ul>
          </div>
          <div>
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-xl">
              <img
                src="https://placehold.co/960x600?text=Mobile+Upload+%2B+Auto-Resize"
                alt="Mobile upload with auto-resize and desktop availability"
                className="block w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Why this matters */}
        <div className="mb-12 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg lg:mb-16">
          <h4 className="mb-2 text-xl font-semibold text-gray-900">Why this matters</h4>
          <p className="text-gray-700">
            Today, many GPs use personal phones to capture clinical images and send them via email or messenger to admin for the PMS — images are often too large for referrals. ClinicPro Image auto‑resizes, keeps images off personal phones, and gets them into PMS/referrals cleanly.
          </p>
        </div>

        {/* How it works (slim) */}
        <div className="mb-12 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg lg:mb-16">
          <h4 className="mb-4 text-center text-xl font-semibold text-gray-900">How it works</h4>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              <span className="font-medium text-gray-900">1.</span>
              {' '}Open on mobile via QR (or on desktop)
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              <span className="font-medium text-gray-900">2.</span>
              {' '}Take or upload a photo
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              <span className="font-medium text-gray-900">3.</span>
              {' '}Auto‑resized to referral‑friendly size
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              <span className="font-medium text-gray-900">4.</span>
              {' '}Download on desktop and attach to PMS/referral
            </div>
          </div>
        </div>

        {/* Privacy note */}
        <div className="mb-12 text-center text-sm text-gray-600 lg:mb-16">
          Images aren’t saved to your personal phone. Processing is transient for resizing, then delivered to you.
        </div>

        {/* CTA */}
        <div className="text-center">
          <h4 className="mb-4 text-2xl font-bold text-gray-900">Referral‑ready images in seconds</h4>
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

export default FeatureImage;

