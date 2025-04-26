import '@/styles/global.css';

import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { ConsultTimerProvider } from '@/components/ConsultTimerProvider';
import { Header } from '@/components/Header';
import { QueryClientProvider } from '@/components/QueryClientProvider';
import { NotificationProvider } from '@/components/ui/notification';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Template Management System',
  description: 'A system for managing medical note templates',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <QueryClientProvider>
        <ConsultTimerProvider>
          <NotificationProvider>
            <html lang="en">
              <body className="min-h-screen bg-background font-sans text-foreground antialiased">
                <Header />
                <main>{children}</main>
                <Toaster />
              </body>
            </html>
          </NotificationProvider>
        </ConsultTimerProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
