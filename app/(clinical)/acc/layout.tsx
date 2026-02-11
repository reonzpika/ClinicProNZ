import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clinicpro.co.nz';
const pageUrl = `${baseUrl}/acc`;

export const metadata: Metadata = {
  title: 'ACC Tools - Employer Lookup & Occupation Codes',
  description:
    'Quick ACC45 utilities for NZ GPs: typo-tolerant employer lookup, occupation code search, and faster claim completion.',
  keywords: [
    'ACC tools',
    'ACC45 employer lookup',
    'ACC occupation codes',
    'ACC claim helper',
    'NZ GP ACC form',
    'ACC form automation',
  ],
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: 'ACC Tools - Employer Lookup & Occupation Codes',
    description: 'Lookup employers, addresses, and occupation codes fast to finish ACC45 forms sooner.',
    type: 'website',
    locale: 'en_NZ',
    siteName: 'ClinicPro',
    url: pageUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ACC Tools - Employer Lookup & Occupation Codes',
    description: 'Quick utilities for ACC45 workflows in New Zealand general practice.',
  },
};

export default function AccLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
