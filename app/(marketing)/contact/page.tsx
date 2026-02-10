import Link from 'next/link';

import { Container } from '@/src/shared/components/layout/Container';
import { Button } from '@/src/shared/components/ui/button';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-white">
        <Container size="md">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="text-xl font-bold text-text-primary">
              ClinicPro
            </Link>
          </div>
        </Container>
      </header>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <div className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="mx-auto max-w-4xl">
              <h1 className="mb-8 text-4xl font-bold text-gray-900">Contact Us</h1>

              <div>
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">Get in Touch</h2>
                <p className="mb-6 text-gray-600">
                  Have questions about ClinicPro? We'd love to hear from you. Email us and we'll
                  respond as soon as possible.
                </p>

                <div className="space-y-4">
                  <p className="text-gray-600">
                    Click below to open your preferred email client and send a message.
                  </p>
                  <Button asChild>
                    <a href="mailto:ryo@clinicpro.co.nz">Email ryo@clinicpro.co.nz</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - matches homepage */}
        <footer className="bg-background py-12 text-center">
          <Container size="md">
            <p className="mb-2 font-medium text-text-primary">Questions?</p>
            <a
              href="mailto:ryo@clinicpro.co.nz"
              className="font-medium text-primary hover:underline focus:rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              ryo@clinicpro.co.nz
            </a>
            <div className="mt-6 text-sm text-text-secondary">
              <Link href="/contact" className="transition-colors hover:text-text-primary">
                Work with me
              </Link>
              <span className="mx-2">|</span>
              <Link href="/terms" className="transition-colors hover:text-text-primary">
                Terms
              </Link>
              <span className="mx-2">|</span>
              <Link href="/privacy" className="transition-colors hover:text-text-primary">
                Privacy
              </Link>
            </div>
            <p className="mt-4 text-sm text-text-secondary">
              Built in Auckland, NZ
              <br />
              © 2026 ClinicPro
            </p>
          </Container>
        </footer>
      </div>
    </div>
  );
}
