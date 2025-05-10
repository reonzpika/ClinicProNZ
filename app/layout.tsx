import './globals.css';

import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ConsultationProvider } from '@/shared/ConsultationContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ConsultAI NZ',
  description: 'AI-powered medical consultation platform for New Zealand healthcare professionals',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ConsultationProvider>
        <html lang="en">
          <body className={inter.className}>{children}</body>
        </html>
      </ConsultationProvider>
    </ClerkProvider>
  );
}
