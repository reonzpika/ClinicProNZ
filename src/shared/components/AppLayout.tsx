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
  // Footer slot managed via grid row — no dynamic padding needed when using footer row

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
    // On mount, ensure we start at top
    try { el.scrollTop = 0; } catch {}
    return () => el.removeEventListener('scroll', onScroll as any);
  }, [isMobile, isTablet]);

  // Visual viewport awareness for keyboard — expose CSS var (--kb-offset) at documentElement
  useEffect(() => {
    if (!(isMobile || isTablet) || typeof window === 'undefined' || !('visualViewport' in window)) {
      return;
    }
    const vv = (window as any).visualViewport as VisualViewport;
    const apply = () => {
      try {
        const offset = Math.max(0, Math.round((window.innerHeight - vv.height)));
        document.documentElement.style.setProperty('--kb-offset', `${offset}px`);
      } catch {}
    };
    apply();
    vv.addEventListener('resize', apply);
    vv.addEventListener('scroll', apply);
    return () => {
      try {
        vv.removeEventListener('resize', apply);
        vv.removeEventListener('scroll', apply);
      } catch {}
    };
  }, [isMobile, isTablet]);

  return (
    <div className="flex min-h-[100svh] md:min-h-dvh">
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

      {/* Main Content Area (Grid: header spacer, main scroller, footer slot) */}
      <div className={`
        flex-1 transition-all duration-300 ease-in-out
        ${isDesktop ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : 'ml-0'}
        grid min-h-dvh grid-rows-[auto_1fr_auto]
      `}>
        {/* Header spacer to reserve height (constant). Header itself is fixed overlay below. */}
        {(isMobile || isTablet) && <div className="h-14" />}
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

        {/* Page Content (only scroller) */}
        <main ref={mainRef} className="min-h-0 overflow-auto overscroll-y-contain">
          {children}
        </main>

        {/* Footer slot row (outside scroller) - mobile only */}
        <div
          id="app-footer-slot"
          className={`${(isMobile || isTablet) ? 'block' : 'hidden'} sticky bottom-0 border-t border-slate-200 bg-white px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+var(--kb-offset,0px))] shadow-[0_-2px_8px_rgba(0,0,0,0.06)]`}
        />
      </div>
    </div>
  );
};
