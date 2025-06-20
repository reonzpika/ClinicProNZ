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
];

const EXCLUDED_ROUTE_PATTERNS = [
  /^\/login/, // Auth pages
  /^\/register/, // Auth pages
];

export const AppLayoutWrapper: React.FC<AppLayoutWrapperProps> = ({ children }) => {
  const pathname = usePathname();

  // Check if current route should be excluded from AppLayout
  const shouldExclude = EXCLUDED_ROUTES.includes(pathname)
    || EXCLUDED_ROUTE_PATTERNS.some(pattern => pattern.test(pathname));

  if (shouldExclude) {
    return <>{children}</>;
  }

  return <AppLayout>{children}</AppLayout>;
};
