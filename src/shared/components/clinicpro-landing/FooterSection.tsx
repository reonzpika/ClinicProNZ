'use client';

import { ArrowRight, FileText, Mail, Phone, Shield } from 'lucide-react';
import { useState } from 'react';

import { First30Modal } from '@/shared/components/First30Modal';
import { Button } from '@/shared/components/ui/button';

export const FooterSection = () => {
  const [showFirst30Modal, setShowFirst30Modal] = useState(false);

  return (
    <>
      <footer className="relative bg-gradient-to-br from-nz-green-900 to-nz-blue-900 py-16 sm:py-24 lg:py-32">
        {/* Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="to-nz-blue-400/8 absolute -left-40 top-20 size-[500px] rounded-full bg-gradient-to-br from-nz-green-400/10 blur-3xl"></div>
          <div className="from-nz-blue-400/8 absolute -right-60 bottom-32 size-[600px] rounded-full bg-gradient-to-tr to-nz-green-400/10 blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Closing CTA Section */}
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Ready to Reclaim Your Time?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-nz-green-100 sm:text-xl">
              Join the first 30 NZ GPs who are transforming their practice with ClinicPro.
              Your time with family and patients matters more than paperwork.
            </p>

            {/* CTA Button */}
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-nz-green-400/30 to-nz-blue-400/30 blur-lg sm:-inset-2 sm:rounded-2xl"></div>
                <Button
                  size="lg"
                  onClick={() => setShowFirst30Modal(true)}
                  className="relative bg-gradient-to-r from-nz-green-500 to-nz-blue-500 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:from-nz-green-400 hover:to-nz-blue-400 hover:shadow-2xl sm:px-10 sm:py-5 sm:text-xl"
                >
                  Join First 30 GPs at NZ$ 30/mo (60% off)
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </div>
            </div>

            <p className="text-sm text-nz-green-200">
              Limited spots • No payment required now • 12-month price guarantee
            </p>
          </div>

          {/* Footer Links Section */}
          <div className="border-t border-nz-green-800/50 pt-12">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Company Info */}
              <div className="lg:col-span-2">
                <h3 className="mb-4 text-xl font-bold text-white">ClinicPro</h3>
                <p className="mb-4 text-nz-green-100">
                  AI-powered medical scribing built specifically for New Zealand general practice.
                  Created by a GP, for GPs.
                </p>
                <p className="text-sm text-nz-green-200">
                  Built with ❤️ in Auckland, New Zealand
                </p>
              </div>

              {/* Support Links */}
              <div>
                <h4 className="mb-4 text-lg font-semibold text-white">Support</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a
                      href="mailto:ryo@clinicpro.nz"
                      className="flex items-center gap-2 text-nz-green-100 transition-colors hover:text-white"
                    >
                      <Mail className="size-4" />
                      ryo@clinicpro.nz
                    </a>
                  </li>
                  <li>
                    <a
                      href="tel:+64-9-xxx-xxxx"
                      className="flex items-center gap-2 text-nz-green-100 transition-colors hover:text-white"
                    >
                      <Phone className="size-4" />
                      Support Line
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal Links */}
              <div>
                <h4 className="mb-4 text-lg font-semibold text-white">Legal</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a
                      href="/privacy"
                      className="flex items-center gap-2 text-nz-green-100 transition-colors hover:text-white"
                    >
                      <Shield className="size-4" />
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="/privacy-info"
                      className="flex items-center gap-2 text-nz-green-100 transition-colors hover:text-white"
                    >
                      <FileText className="size-4" />
                      DPA Details
                    </a>
                  </li>
                  <li>
                    <a
                      href="/terms"
                      className="flex items-center gap-2 text-nz-green-100 transition-colors hover:text-white"
                    >
                      <FileText className="size-4" />
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-12 border-t border-nz-green-800/50 pt-8 text-center">
              <p className="text-sm text-nz-green-200">
                © 2025 ClinicPro. All rights reserved.
              </p>
              <p className="mt-2 text-xs text-nz-green-300">
                Proudly serving New Zealand healthcare professionals
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal */}
      <First30Modal
        isOpen={showFirst30Modal}
        onClose={() => setShowFirst30Modal(false)}
      />
    </>
  );
};
