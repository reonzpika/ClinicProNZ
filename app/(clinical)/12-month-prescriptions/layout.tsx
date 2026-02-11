import type { Metadata } from 'next';

import { JsonLdScript } from '@/src/shared/components/seo/JsonLdScript';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clinicpro.co.nz';
const pageUrl = `${baseUrl}/12-month-prescriptions`;
const ogImageUrl = `${baseUrl}/images/12-month-prescriptions/12-month-prescriptions-illustration.png`;

export const metadata: Metadata = {
  title: '12-Month Prescription Decision Tool for NZ GPs',
  description:
    'Interactive decision support for NZ GPs: traffic light medication checker, controlled drug limits, and policy guidance for the 12-month prescription rules.',
  keywords: [
    '12 month prescription',
    '12-month prescription tool',
    '12 month prescription NZ',
    'repeat prescriptions NZ',
    'Medicines Regulations 2025',
    'GP prescribing tool',
    'controlled drugs NZ',
    'medication suitability checker',
  ],
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: '12-Month Prescription Decision Tool for NZ GPs',
    description:
      'Interactive medication suitability checker, controlled drug limits, and eligibility guidance for extended prescriptions in New Zealand.',
    type: 'website',
    locale: 'en_NZ',
    siteName: 'ClinicPro',
    url: pageUrl,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: '12-Month Prescription Decision Tool for NZ GPs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '12-Month Prescription Decision Tool for NZ GPs',
    description:
      'Interactive tool for checking medication suitability, controlled drug rules, and patient eligibility for 12-month prescriptions.',
    images: [ogImageUrl],
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Which medications can be prescribed for 12 months in NZ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most non-controlled medications can be prescribed for up to 12 months at prescriber discretion. Controlled drugs are excluded: Class B (e.g. morphine, methylphenidate) maximum 1 month, Class C (e.g. tramadol, benzodiazepines) maximum 3 months. Medications requiring regular monitoring (warfarin, lithium, methotrexate, etc.) are generally unsuitable. Statins, inhaled corticosteroids, beta blockers, and oral contraceptives are generally suitable for stable patients.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are there mandatory patient eligibility criteria for 12-month prescriptions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. The Medicines Regulations 2025 grant prescribers full clinical discretion. There are no mandatory patient eligibility criteria in law. The widely referenced "6 months stable" criterion in RNZCGP materials is professional guidance, not a legal requirement.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can patients collect 12 months of medication at once?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Pharmacies can only dispense a maximum of 3 months supply per occasion (6 months for oral contraceptives). Patients collect repeats every 3 months from the same pharmacy and pay a single $5 co-payment when first collecting.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I have to issue 12-month prescriptions if patients ask?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. The law permits up to 12 months but does not require it. You have full discretion to issue 3, 6, 9, or 12 month prescriptions based on clinical judgement. RNZCGP recommended 6 months as safer in their October 2024 submission.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the controlled drug prescription limits in NZ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Controlled drugs are excluded from 12-month prescriptions. Class B drugs (morphine, oxycodone, fentanyl, methylphenidate, dexamphetamine) have a maximum of 1 month. Class C drugs (tramadol, codeine combinations, benzodiazepines, zopiclone, zolpidem) have a maximum of 3 months.',
      },
    },
  ],
};

const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '12-Month Prescription Decision Tool',
  description:
    'Interactive clinical decision support tool for NZ GPs navigating the 12-month prescription policy.',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Web browser',
  url: pageUrl,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'NZD',
  },
  author: {
    '@type': 'Organization',
    name: 'ClinicPro',
    url: baseUrl,
  },
};

export default function TwelveMonthPrescriptionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <JsonLdScript data={faqSchema} />
      <JsonLdScript data={webApplicationSchema} />
    </>
  );
}
