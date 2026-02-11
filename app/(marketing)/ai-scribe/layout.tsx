import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clinicpro.co.nz';
const pageUrl = `${baseUrl}/ai-scribe`;

export const metadata: Metadata = {
  title: 'AI Medical Scribe for NZ GPs',
  description:
    'Finish on time. Capture the consult and get a clean draft note fast. AI scribe for NZ GPs with NZ data sovereignty, consistent structure, and low cognitive load.',
  keywords: [
    'AI medical scribe',
    'New Zealand GP',
    'consultation notes',
    'clinical documentation NZ',
    'GP scribe',
    'AI clinical documentation',
    'NZ Formulary integration',
  ],
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: 'AI Medical Scribe for NZ GPs',
    description:
      'AI consultation note assistant built by a practising GP. Faster notes, less cognitive load, NZ data sovereignty.',
    type: 'website',
    locale: 'en_NZ',
    siteName: 'ClinicPro',
    url: pageUrl,
    images: [
      {
        url: `${baseUrl}/images/landing-page/hero-image.png`,
        width: 1200,
        height: 630,
        alt: 'ClinicPro AI Medical Scribe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Medical Scribe for NZ GPs',
    description: 'Capture consults, get structured notes fast. Built for New Zealand general practice.',
    images: [`${baseUrl}/images/landing-page/hero-image.png`],
  },
};

export default function AiScribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
