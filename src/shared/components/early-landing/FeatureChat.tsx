'use client';

export const FeatureChat = () => {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236b7280' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='30' cy='30' r='1.2'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center lg:mb-16">
          <div className="relative inline-block">
            <div className="absolute -left-6 top-6 h-14 w-1 bg-gradient-to-b from-gray-500 to-gray-700 lg:-left-10 lg:h-16"></div>
            <div className="absolute -right-6 top-10 h-12 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 lg:-right-10 lg:h-14"></div>
            <h2 className="relative text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Chat
            </h2>
          </div>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-700">Ask and get referenced answers fast</p>
        </div>

        {/* Band A: What you can ask (copy left, screenshot right) */}
        <div className="mb-12 grid items-center gap-10 lg:mb-16 lg:grid-cols-2 lg:gap-16">
          <div>
            <h3 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">What you can ask</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• General health/disease questions</li>
              <li>• Referral info (where/when/how)</li>
              <li>• Patient info (Healthify)</li>
              <li>• Drug info (NZ Formulary)</li>
            </ul>
          </div>
          <div>
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-xl">
              <img
                src="https://placehold.co/960x600?text=Chat+with+NZ+resources"
                alt="Chat UI showing an answer with Healthify and NZ Formulary references"
                className="block w-full object-cover"
              />
            </div>
          </div>
        </div>

        

        {/* How it works (slim) */}
        <div className="mb-12 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg lg:mb-16">
          <h4 className="mb-4 text-center text-xl font-semibold text-gray-900">How it works</h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              <span className="font-medium text-gray-900">1.</span>
              {' '}Type a question
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              <span className="font-medium text-gray-900">2.</span>
              {' '}Get a concise answer with NZ resource references
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              <span className="font-medium text-gray-900">3.</span>
              {' '}Open sources in one click
            </div>
          </div>
        </div>

        {/* Guardrails */}
        <div className="mb-12 text-center text-sm text-gray-600 lg:mb-16">
          Not intended for clinical judgement or decision‑making. Verify with the cited sources.
        </div>

        {/* CTA */}
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

export default FeatureChat;

