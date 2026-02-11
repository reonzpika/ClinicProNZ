import './globals.css';

import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { Inter, Open_Sans, Oswald } from 'next/font/google';
import Script from 'next/script';

import { QueryClientProvider } from '@/src/providers/QueryClientProvider';
import { AppLayoutWrapper } from '@/src/shared/components/AppLayoutWrapper';
import { JsonLdScript } from '@/src/shared/components/seo/JsonLdScript';
import { ToastProvider } from '@/src/shared/components/ui/toast';
import { TestUserProvider } from '@/src/shared/contexts/TestUserContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  variable: '--font-inter',
});

const oswald = Oswald({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  variable: '--font-oswald',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  variable: '--font-open-sans',
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clinicpro.co.nz';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'ClinicPro - Practical Tools for NZ GPs',
    template: '%s | ClinicPro',
  },
  description:
    'Free clinical tools for New Zealand general practice: 12-month prescription decision support, referral image transfer, AI scribe, and ACC claim helpers. Built by a practising GP.',
  keywords: [
    'ClinicPro',
    'NZ GP tools',
    'New Zealand general practice',
    'clinical decision support',
    '12-month prescriptions',
    'AI medical scribe NZ',
    'referral images',
    'ACC tools',
  ],
  openGraph: {
    title: 'ClinicPro - Practical Tools for NZ GPs',
    description:
      '12-month prescription decision tools, referral image transfer, AI scribe, and ACC utilities built for New Zealand general practice.',
    type: 'website',
    locale: 'en_NZ',
    siteName: 'ClinicPro',
    url: baseUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClinicPro - Practical Tools for NZ GPs',
    description: 'Free, GP-built tools for New Zealand clinics.',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ClinicPro',
  url: baseUrl,
  description: 'Practical clinical tools for New Zealand general practice.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Auckland',
    addressCountry: 'NZ',
  },
};

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!publishableKey) {
    return (
      <html lang="en">
        <body className={`${inter.variable} ${oswald.variable} ${openSans.variable} ${inter.className}`}>
          <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 480, margin: '40px auto' }}>
            <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Clerk not configured</h1>
            <p style={{ color: '#666', margin: 0 }}>
              Add <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: 4 }}>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> to <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: 4 }}>.env.local</code> and restart the dev server.
            </p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <QueryClientProvider>
        <TestUserProvider>
          <html lang="en">
            <head>
              {/* DNS prefetch for Google OAuth and reCAPTCHA domains */}
              <link rel="dns-prefetch" href="//accounts.google.com" />
              <link rel="dns-prefetch" href="//www.google.com" />
              <link rel="dns-prefetch" href="//www.gstatic.com" />
              <link rel="dns-prefetch" href="//apis.google.com" />
              <link rel="dns-prefetch" href="//ssl.gstatic.com" />

              {/* Preconnect to speed up OAuth flow */}
              <link rel="preconnect" href="https://accounts.google.com" />
              <link rel="preconnect" href="https://www.google.com" />
              <link rel="preconnect" href="https://www.gstatic.com" crossOrigin="anonymous" />
              <Script src="https://www.googletagmanager.com/gtag/js?id=G-S52BKYBFY9" strategy="afterInteractive" />
              <Script id="gtag-init" strategy="afterInteractive">
                {`window.dataLayer = window.dataLayer || [];
                 function gtag(){dataLayer.push(arguments);}
                 gtag('js', new Date());
                 gtag('config', 'G-S52BKYBFY9');`}
              </Script>
              <JsonLdScript data={organizationSchema} />
            </head>
            <body className={`${inter.variable} ${oswald.variable} ${openSans.variable} ${inter.className}`}>
              {/* <StagewiseToolbar /> */}
              <ToastProvider>
                <AppLayoutWrapper>{children}</AppLayoutWrapper>
              </ToastProvider>
              <Analytics />
            </body>
          </html>
        </TestUserProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
