'use client';

import React, { useState } from 'react';

import { Sidebar } from './Sidebar';

type AppLayoutProps = {
  children: React.ReactNode;
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Main Content Area */}
      <div className={`
        flex flex-1 flex-col transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'ml-16' : 'ml-64'}
      `}
      >
        {/* Page Content - Full height now */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
