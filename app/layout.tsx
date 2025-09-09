import './globals.css';

import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { QueryClientProvider } from '@/src/providers/QueryClientProvider';
import { AppLayoutWrapper } from '@/src/shared/components/AppLayoutWrapper';
import { TestUserProvider } from '@/src/shared/contexts/TestUserContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: 'ClinicPro - AI Medical Scribing for NZ GPs',
  description: 'Finish your consultation notes in under 1 minute. AI-powered medical scribing built specifically for New Zealand general practice.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const AppTree = (
    <QueryClientProvider>
      <TestUserProvider>
        <html lang="en">
          <body className={inter.className}>
            {/* <StagewiseToolbar /> */}
            <AppLayoutWrapper>{children}</AppLayoutWrapper>
            <Analytics />
          </body>
        </html>
      </TestUserProvider>
    </QueryClientProvider>
  );

  return (
    publishableKey ? (
      <ClerkProvider publishableKey={publishableKey}>
        {AppTree}
      </ClerkProvider>
    ) : (
      AppTree
    )
  );
}
