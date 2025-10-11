'use client';

import { Menu } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { useResponsive } from '@/src/shared/hooks/useResponsive';

import { Sidebar } from './Sidebar';
import { Button } from './ui/button';

type AppLayoutProps = {
  children: React.ReactNode;
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const mainRef = useRef<HTMLDivElement | null>(null);
  const lastScrollTopRef = useRef(0);

  const toggleSidebar = () => {
    if (isMobile || isTablet) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  // Hide header on scroll down, show on scroll up (mobile/tablet)
  useEffect(() => {
    const el = mainRef.current;
    if (!el || !(isMobile || isTablet)) {
      setHeaderHidden(false);
      return;
    }
    const onScroll = () => {
      const st = el.scrollTop;
      const last = lastScrollTopRef.current;
      const delta = st - last;
      // Always show near top
      if (st < 24) {
        setHeaderHidden(false);
      } else if (delta > 6) {
        // scrolling down
        setHeaderHidden(true);
      } else if (delta < -6) {
        // scrolling up
        setHeaderHidden(false);
      }
      lastScrollTopRef.current = st;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll as any);
  }, [isMobile, isTablet]);

  return (
    <div className="flex h-screen">
      {/* Mobile/Tablet Overlay Backdrop */}
      {(isMobile || isTablet) && mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={closeMobileSidebar}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              closeMobileSidebar();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isDesktop ? sidebarCollapsed : false}
        onToggle={toggleSidebar}
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
        isDesktop={isDesktop}
      />

      {/* Main Content Area */}
      <div className={`
        flex flex-1 flex-col transition-all duration-300 ease-in-out
        ${isDesktop
      ? (sidebarCollapsed ? 'ml-16' : 'ml-64')
      : 'ml-0'
    }
      `}
      >
        {/* Mobile Header with Menu Button */}
        {(isMobile || isTablet) && (
          <div className={`fixed top-0 left-0 right-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 transition-transform duration-200 will-change-transform ${headerHidden ? '-translate-y-full' : 'translate-y-0'}`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-2"
            >
              <Menu size={20} />
            </Button>
            <h1 className="text-lg font-semibold text-slate-900">ClinicPro for GP</h1>
            <div className="w-10" />
            {' '}
            {/* Spacer for centering */}
          </div>
        )}

        {/* Page Content */}
        <main ref={mainRef} className={`flex-1 overflow-auto overscroll-y-contain ${(isMobile || isTablet) ? (headerHidden ? '' : 'pt-14') : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};
