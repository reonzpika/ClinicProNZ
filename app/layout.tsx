import './globals.css';

import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { Inter, Open_Sans, Oswald } from 'next/font/google';
import Script from 'next/script';

import { QueryClientProvider } from '@/src/providers/QueryClientProvider';
import { AppLayoutWrapper } from '@/src/shared/components/AppLayoutWrapper';
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

export const metadata: Metadata = {
  title: 'ClinicPro - AI Medical Scribing for NZ GPs',
  description: 'Finish your consultation notes in under 1 minute. AI-powered medical scribing built specifically for New Zealand general practice.',
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
