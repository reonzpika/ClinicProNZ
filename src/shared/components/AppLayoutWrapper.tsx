'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

import { AppLayout } from './AppLayout';

type AppLayoutWrapperProps = {
  children: React.ReactNode;
};

const EXCLUDED_ROUTES = [
  '/', // Root welcome page for unauthenticated users
  '/landing-page', // Landing page should not have sidebar
  '/clinicpro', // ClinicPro landing page should not have sidebar
  '/early', // Early access landing page should not have sidebar
  '/about', // About page should not have sidebar
  '/ai-scribing', // AI scribing page should not have sidebar
  '/contact', // Contact page should not have sidebar
  '/roadmap', // Roadmap page should not have sidebar
  '/thank-you', // Thank you page should not have sidebar
  '/mobile', // Mobile recording page should not have sidebar
];

const EXCLUDED_ROUTE_PATTERNS = [
  /^\/auth\/login/, // Auth pages
  /^\/auth\/register/, // Auth pages
];

export const AppLayoutWrapper: React.FC<AppLayoutWrapperProps> = ({ children }) => {
  const pathname = usePathname();

  // Check if current route should be excluded from AppLayout
  const shouldExclude = EXCLUDED_ROUTES.includes(pathname)
    || EXCLUDED_ROUTE_PATTERNS.some(pattern => pattern.test(pathname));

  if (shouldExclude) {
    return children;
  }

  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
};
