import Image from 'next/image';

export const PersonalStorySection = () => {
  return (
    <section className="relative bg-white py-16 sm:py-24 lg:py-32">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="from-nz-blue-200/8 absolute -left-40 top-20 size-[400px] rounded-full bg-gradient-to-br to-nz-green-200/10 blur-3xl"></div>
        <div className="from-nz-green-200/8 absolute -right-60 bottom-32 size-[500px] rounded-full bg-gradient-to-tr to-nz-blue-300/10 blur-3xl"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text Content */}
          <div className="flex flex-col justify-center">
            <div className="relative">
              {/* Decorative accent behind title */}
              <div className="absolute -left-4 top-4 h-20 w-1.5 bg-gradient-to-b from-nz-green-500 to-nz-blue-600 lg:-left-8"></div>

              <h2 className="relative mb-6 text-3xl font-extrabold leading-normal tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                <span className="block">Thank you for</span>
                <span className="block text-nz-green-600">stopping by.</span>
              </h2>

              {/* Stylish accent elements */}
              <div className="absolute -right-8 top-6 size-4 rounded-full bg-nz-green-400/60 lg:-right-12"></div>
              <div className="absolute -left-6 top-16 size-3 rounded-full bg-nz-blue-400/70 lg:-left-10"></div>
            </div>

            <div className="space-y-6 text-lg leading-relaxed text-gray-700">
              <p>
                I'm
                {' '}
                <span className="font-semibold text-gray-900">Dr Ryo Eguchi</span>
                , a practising GP in Auckland and the creator of ClinicPro.
              </p>

              <p>
                I know firsthand how overwhelming administrative work can be, and how disconnected healthcare information slows us down. ClinicPro was built to solve those problems and give GPs back their time.
              </p>

              {/* Statistics Box */}
              <div className="rounded-2xl border-2 border-red-200/50 bg-gradient-to-r from-red-50/80 to-orange-50/60 p-6 shadow-lg">
                <p className="text-xl font-bold text-red-700">
                  <span className="text-2xl">79%</span>
                  {' '}
                  of NZ GPs report burnout
                </p>
                <p className="mt-2 text-base text-red-600">
                  according to the
                  {' '}
                  <a
                    href="https://www.rnzcgp.org.nz/our-voice/workforce-survey/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-red-700 underline transition-colors duration-200 hover:text-red-800"
                  >
                    RNZCGP Workforce Survey
                  </a>
                  . It's a challenge we must face together.
                </p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative">
              {/* Decorative background elements */}
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-nz-green-100/50 to-nz-blue-100/30 blur-lg"></div>

              <div className="relative size-80 overflow-hidden rounded-2xl border-4 border-white shadow-2xl sm:size-96">
                <Image
                  src="/images/landing-page/DrRyoEguchiProfilePicMain.jpg"
                  alt="Dr. Ryo Eguchi - Founder of ClinicPro"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Floating accent elements */}
              <div className="absolute -bottom-4 -right-4 size-8 rounded-full bg-nz-green-400/60"></div>
              <div className="absolute -left-4 -top-4 size-6 rounded-full bg-nz-blue-400/50"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
