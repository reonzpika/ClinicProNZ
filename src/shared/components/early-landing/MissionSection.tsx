'use client';

export const MissionSection = () => {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236366f1' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='30' cy='30' r='1.2'/%3E%3C/g%3E%3C/svg%3E")` }} />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="relative inline-block">
            <div className="absolute -left-6 top-4 h-14 w-1 bg-gradient-to-b from-nz-green-500 to-nz-blue-600 lg:-left-10 lg:h-16"></div>
            <h2 className="relative text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Mission: Help GPs leave work on time
            </h2>
          </div>
        </div>

        <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-700 sm:text-xl">
          ClinicPro empowers New Zealand GPs to reclaim time and clinical focus by automating notes, simplifying referrals and surfacing trusted NZ guidance; all while keeping clinicians in control.
        </p>
      </div>
    </section>
  );
};

export default MissionSection;
