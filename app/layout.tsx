import './globals.css';

import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { Inter, Open_Sans, Oswald } from 'next/font/google';

import { QueryClientProvider } from '@/src/providers/QueryClientProvider';
import { AppLayoutWrapper } from '@/src/shared/components/AppLayoutWrapper';
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <QueryClientProvider>
        <TestUserProvider>
          <html lang="en">
            <body className={`${inter.variable} ${oswald.variable} ${openSans.variable} ${inter.className}`}>
              {/* <StagewiseToolbar /> */}
              <AppLayoutWrapper>{children}</AppLayoutWrapper>
              <Analytics />
            </body>
          </html>
        </TestUserProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
