'use client';

import { Menu } from 'lucide-react';
import React, { useState } from 'react';

import { useResponsive } from '@/shared/hooks/useResponsive';

import { Sidebar } from './Sidebar';
import { Button } from './ui/button';

type AppLayoutProps = {
  children: React.ReactNode;
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isMobile, isTablet, isDesktop } = useResponsive();

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
          <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-2"
            >
              <Menu size={20} />
            </Button>
            <h1 className="text-lg font-semibold text-slate-900">MedScribe NZ</h1>
            <div className="w-10" />
            {' '}
            {/* Spacer for centering */}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
