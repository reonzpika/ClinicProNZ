import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'ClinicPro Referral Images',
  description: 'Phone to desktop clinical photos in 30 seconds. For NZ GPs.',
  manifest: '/referral-images/manifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Referrals',
  },
  icons: {
    apple: '/icons/referral-icon-180.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#3b82f6',
};

export default function ReferralImagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
