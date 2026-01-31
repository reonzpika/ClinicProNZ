'use client';

import { usePathname } from 'next/navigation';

import { AppLayout } from './AppLayout';

type AppLayoutWrapperProps = {
  children: React.ReactNode;
};

// Only show the left bar (AppLayout with sidebar) on AI scribe app pages
const SIDEBAR_ALLOWED_PATTERNS = [
  /^\/ai-scribe\/(consultation|image|templates)(\/|$)/,
];

export const AppLayoutWrapper: React.FC<AppLayoutWrapperProps> = ({ children }) => {
  const pathname = usePathname();

  const showSidebar = SIDEBAR_ALLOWED_PATTERNS.some(pattern => pattern.test(pathname));

  if (!showSidebar) {
    return children;
  }

  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
};
