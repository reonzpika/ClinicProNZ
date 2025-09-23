'use client';

export const ConclusionSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-black py-20 text-white sm:py-24 lg:py-28">
      {/* soft grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              `radial-gradient(circle at 25% 10%, rgba(99,102,241,0.15) 0, rgba(99,102,241,0) 40%), radial-gradient(circle at 75% 90%, rgba(16,185,129,0.12) 0, rgba(16,185,129,0) 40%)`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Headline */}
        <div className="mb-12 lg:mb-16">
          <h2 className="font-oswald text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            End the 15‑minute compromise.
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-gray-200">
            Structured notes, referral‑ready images, and referenced answers — without breaking eye contact.
          </p>
        </div>

        {/* Essentials inline line */}
        <div className="mb-12 border-y border-white/10 py-6 text-base text-gray-200">
          <span className="font-semibold text-white">AI Scribe</span>
          : quality notes in minutes
          {' '}
          <span className="mx-3 inline-block h-1 w-8 -translate-y-1 align-middle rounded-full bg-gradient-to-r from-nz-green-400 to-nz-blue-400" />
          <span className="font-semibold text-white">Clinical Image</span>
          : snap, auto‑resize
          {' '}
          <span className="mx-3 inline-block h-1 w-8 -translate-y-1 align-middle rounded-full bg-gradient-to-r from-nz-green-400 to-nz-blue-400" />
          <span className="font-semibold text-white">Search & Chat</span>
          : trusted NZ answers fast
        </div>

        {/* 3‑step flow - large numerals */}
        <div className="mb-12 grid gap-8 lg:grid-cols-3">
          {["Hit record (phone or desktop)", "Talk to the patient; type key objectives if needed", "Review a clean note, download resized images, open referenced guidance"].map((step, idx) => (
            <div key={idx} className="relative">
              <div className="pointer-events-none absolute -left-1 -top-2 select-none text-6xl font-black text-white/10">{idx + 1}</div>
              <p className="relative z-10 text-lg text-gray-100">{step}</p>
            </div>
          ))}
        </div>

        {/* Impact bullets */}
        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white/5 p-4 text-center ring-1 ring-white/10">No after‑hours admin</div>
          <div className="rounded-xl bg-white/5 p-4 text-center ring-1 ring-white/10">Notes you’re proud of</div>
          <div className="rounded-xl bg-white/5 p-4 text-center ring-1 ring-white/10">Answers in seconds — NZ sources</div>
        </div>

        {/* Trust & privacy */}
        <div className="mb-12 flex flex-wrap items-center gap-3 text-sm text-gray-300">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Built by a practising NZ GP</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Consent‑first workflow</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Images never saved to your phone</span>
        </div>

        {/* Dual CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="#start"
            className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-6 py-3 text-base font-bold text-white shadow-xl ring-1 ring-orange-500/40 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-orange-700 hover:shadow-orange-500/25"
          >
            Join beta (free)
          </a>
          <a
            href="#ai-scribe"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-base font-bold text-white/90 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-white/10"
          >
            See 60‑sec demo
          </a>
        </div>
      </div>
    </section>
  );
};

export default ConclusionSection;

