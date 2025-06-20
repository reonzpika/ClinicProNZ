'use client';

import { AlertTriangle, Building2, Clock, FileText, Users } from 'lucide-react';

export const PainPointsSection = () => {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            We Understand Your Day
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            Every challenge you face was felt by the GP who built this solution.
            ClinicPro was designed specifically to tackle these exact issues.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
            <div className="mb-4 flex items-center space-x-3">
              <div className="rounded-lg bg-red-100 p-2">
                <FileText className="size-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Rising Admin Burden</h3>
            </div>
            <p className="leading-relaxed text-gray-600">
              Documentation requirements keep growing while consultation time stays the same.
              You're spending more time writing notes than with patients.
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
            <div className="mb-4 flex items-center space-x-3">
              <div className="rounded-lg bg-orange-100 p-2">
                <Users className="size-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Complex Multi-Morbidity</h3>
            </div>
            <p className="leading-relaxed text-gray-600">
              NZ's aging population means more complex patients with multiple conditions.
              Comprehensive documentation is essential but time-consuming.
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
            <div className="mb-4 flex items-center space-x-3">
              <div className="rounded-lg bg-yellow-100 p-2">
                <AlertTriangle className="size-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Safety-Netting Demands</h3>
            </div>
            <p className="leading-relaxed text-gray-600">
              Robust safety-netting and clear follow-up plans are crucial for patient safety,
              but they require detailed documentation that takes precious time.
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
            <div className="mb-4 flex items-center space-x-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Building2 className="size-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Fragmented Care</h3>
            </div>
            <p className="leading-relaxed text-gray-600">
              With more part-time GPs, patients see different doctors frequently.
              Clear, consistent documentation is vital for continuity of care.
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
            <div className="mb-4 flex items-center space-x-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Clock className="size-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Workforce Pressures</h3>
            </div>
            <p className="leading-relaxed text-gray-600">
              GP shortages mean longer days and heavier workloads.
              Every minute saved on documentation is time back for patient care or life.
            </p>
          </div>

          <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-blue-50 p-6 shadow-lg transition-shadow hover:shadow-xl">
            <div className="mb-4 flex items-center space-x-3">
              <div className="rounded-lg bg-green-100 p-2">
                <FileText className="size-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">The Solution</h3>
            </div>
            <p className="leading-relaxed text-gray-600">
              <span className="font-medium text-green-700">ClinicPro was built by a practicing NZ GP</span>
              {' '}
              who
              experienced these exact challenges and decided to do something about it.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg italic text-gray-600">
            "Every feature in ClinicPro comes from real clinical experience and feedback from practicing NZ GPs."
          </p>
          <p className="mt-2 text-sm text-gray-500">— Dr. Ryo Eguchi, Founder & Practicing GP</p>
        </div>
      </div>
    </section>
  );
};
