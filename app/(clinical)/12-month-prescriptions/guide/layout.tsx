import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clinicpro.co.nz';
const pageUrl = `${baseUrl}/12-month-prescriptions/guide`;

export const metadata: Metadata = {
  title: '12-Month Prescription Comprehensive Guide',
  description:
    'Full NZ GP reference: legal framework, RNZCGP standards, medication categories, and equity considerations for the 12-month prescription policy.',
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: '12-Month Prescription Comprehensive Guide for NZ GPs',
    description:
      'Legal basis, medication categories, professional standards, and equity considerations for the 12-month prescription rules.',
    type: 'article',
    locale: 'en_NZ',
    siteName: 'ClinicPro',
    url: pageUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: '12-Month Prescription Comprehensive Guide',
    description: 'NZ GP-focused reference for the Medicines Regulations 2025 update.',
  },
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
