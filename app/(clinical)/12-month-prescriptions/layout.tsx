import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clinicpro.co.nz';
const pageUrl = `${baseUrl}/12-month-prescriptions`;
const ogImageUrl = `${baseUrl}/images/12-month-prescriptions/12-month-prescriptions-illustration.png`;

export const metadata: Metadata = {
  title: '12-Month Prescriptions – Clinical Decision Tool | ClinicPro',
  description:
    'Interactive decision tool and medication guide for NZ GPs. Assess patient suitability for 12-month prescriptions from 1 February 2026.',
  keywords:
    '12-month prescriptions, NZ GP, prescribing, medication guide, clinical decision tool, repeat prescriptions',
  openGraph: {
    title: '12-Month Prescriptions – Clinical Decision Tool | ClinicPro',
    description:
      'Interactive decision tool and medication guide for NZ GPs. Assess patient suitability for 12-month prescriptions from 1 February 2026.',
    type: 'website',
    locale: 'en_NZ',
    url: pageUrl,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: '12-Month Prescriptions – Clinical decision tool for NZ GPs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '12-Month Prescriptions – Clinical Decision Tool | ClinicPro',
    description:
      'Interactive decision tool and medication guide for NZ GPs. Assess patient suitability for 12-month prescriptions from 1 February 2026.',
    images: [ogImageUrl],
  },
};

export default function TwelveMonthPrescriptionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
