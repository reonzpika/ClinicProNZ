'use client';

export const FeatureAiscribe = () => {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] will-change-[transform]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%233b82f6' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='30' cy='30' r='1.2'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 lg:mb-16">
          <div className="relative inline-block">
            <div className="absolute -left-6 top-4 h-14 w-1 bg-gradient-to-b from-nz-green-500 to-nz-blue-600 lg:-left-10 lg:h-16"></div>
            <h2 className="relative text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              AI Scribe
            </h2>
          </div>
          <p className="mt-4 text-lg text-gray-700">Capture the consult efficiently. Get structured notes fast</p>
        </div>

        {/* Band A: Consultation (copy left, screenshot right) */}
        <div className="mb-16 grid items-center gap-10 lg:mb-20 lg:grid-cols-2 lg:gap-16">
          <div>
            <h3 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">End the Speed vs Quality Dilemma</h3>
            <p className="mb-4 text-lg leading-relaxed text-gray-700">Most GPs battle speed versus quality: detailed notes take longer; brief notes keep you on time but miss key information. ClinicPro ends this dilemma — clear, structured notes without after‑hours admin.</p>
            <p className="mb-6 text-lg leading-relaxed text-gray-700">ClinicPro's audio recording captures the subjective; spoken objectives are included. Type objective findings (exam, assessment/Dx, plan) as needed for more control and accuracy — you’re in charge.</p>
            <ul className="space-y-2 text-gray-700">
              <li>• Record on mobile or desktop</li>
              <li>• Mark problems as you go (multi‑problem ready)</li>
              <li>• Switch templates anytime</li>
            </ul>
          </div>
          <div className="[content-visibility:auto] [contain:layout_paint_style]">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-md h-[380px] sm:h-[480px] lg:h-[620px]">
              <img
                src="/images/landing-page/ClinicProConsultation.jpg"
                alt="Consultation screen showing recording, additional note input, and template switcher"
                loading="lazy"
                decoding="async"
                className="block w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Band B: Generated note (screenshot left, copy right) */}
        <div className="mb-12 grid items-center gap-10 lg:mb-16 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 [content-visibility:auto] [contain:layout_paint_style] lg:order-1">
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-md h-[380px] sm:h-[480px] lg:h-[620px]">
              <img
                src="/images/landing-page/ClinicProGenerateNote.jpg"
                alt="Generated note with editable sections"
                loading="lazy"
                decoding="async"
                className="block w-full object-cover"
              />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h3 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">Review and edit your note</h3>
            <p className="mb-6 text-lg leading-relaxed text-gray-700">Clean, structured note — you are in charge. Review and edit quickly.</p>
            <ul className="space-y-2 text-gray-700">
              <li>• Default template handles most consults; multi‑problem ready</li>
              <li>• Switch output style (template) when needed</li>
              <li>• Highly customisable templates: NZTA driver licence (NZTA‑aligned), ACC consult, 6‑week baby check</li>
            </ul>
          </div>
        </div>

        {/* How it works (slim) */}
        <div className="mb-12 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg lg:mb-16">
          <h4 className="mb-4 text-center text-xl font-semibold text-gray-900">How it works</h4>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              <span className="font-medium text-gray-900">1.</span>
              {' '}Start recording (mobile or desktop)
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              <span className="font-medium text-gray-900">2.</span>
              {' '}Speak naturally; focus on the patient and history
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              <span className="font-medium text-gray-900">3.</span>
              {' '}Dictate or type in objectives (problems, exam findings, assessment, plan, etc)
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              <span className="font-medium text-gray-900">4.</span>
              {' '}Review structured draft, make quick edits, finish
            </div>
          </div>
        </div>

        {/* CTA row (compact) */}
        <div className="text-center">
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

export default FeatureAiscribe;

