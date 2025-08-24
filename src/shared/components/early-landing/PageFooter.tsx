import { Mail } from 'lucide-react';

export const PageFooter = () => {
  return (
    <footer className="bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-oswald text-2xl font-bold text-nz-green-600">ClinicPro</span>
            </div>
            <p className="text-gray-600">
              Smart tools for NZ GPs to manage 15-minute consults and leave work on time.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Built by a practicing GP</span>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-open-sans font-semibold text-gray-900">Get in Touch</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-nz-green-600" />
                <a href="mailto:ryo@clinicpro.co.nz" className="hover:text-nz-green-600">
                  ryo@clinicpro.co.nz
                </a>
              </div>
              <p>Direct line to Dr. Ryo Eguchi</p>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-open-sans font-semibold text-gray-900">Legal & Privacy</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div>Privacy Act 2020 compliant</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-gray-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-500 sm:flex-row">
            <div>
              ©
{' '}
{new Date().getFullYear()}
{' '}
ClinicPro. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <a href="/terms" className="hover:text-nz-green-600">Terms of Service</a>
              <a href="/privacy" className="hover:text-nz-green-600">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
