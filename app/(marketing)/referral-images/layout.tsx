import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clinicpro.co.nz';
const pageUrl = `${baseUrl}/referral-images`;
const ogImageUrl = `${baseUrl}/images/referral-images/referral_images_hero_image_2.png`;

export const metadata: Metadata = {
  title: 'Referral Images - Photo to Desktop in 30 Seconds',
  description:
    'Stop emailing clinical photos to yourself. Take photo, instant desktop transfer, auto-sized JPEG, attach to e-referral. Saves over 10 minutes per referral. Free for NZ GPs.',
  keywords: [
    'referral images',
    'clinical photo transfer',
    'e-referral NZ',
    'GP referral images',
    'HealthLink referral attachments',
    'photo to desktop',
    'clinical images GP',
  ],
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: 'Referral Images - Photo to Desktop in 30 Seconds',
    description:
      'Clinical photo transfer for NZ GPs. Take photo, instant desktop transfer, auto-sized JPEG ready for e-referrals.',
    type: 'website',
    locale: 'en_NZ',
    siteName: 'ClinicPro',
    url: pageUrl,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'Referral Images workflow illustration',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Referral Images - Photo to Desktop in 30 Seconds',
    description:
      'Take a clinical photo, get it on your desktop in 30 seconds. Auto-sized JPEG, ready for e-referrals.',
    images: [ogImageUrl],
  },
};

export default function ReferralImagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
