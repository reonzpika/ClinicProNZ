'use client';

import { useState } from 'react';

import { CostTab } from '../cost-tracking/components/CostTab';
import { AnalyticsView } from './AnalyticsView';
import { MessagesView } from './MessagesView';

type AdminView = 'overview' | 'messages' | 'analytics' | 'costs';

export const AdminDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminView>('overview');

  const navItems: { id: AdminView; label: string; icon: string }[] = [
    { id: 'messages', label: 'Messages', icon: '📧' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'costs', label: 'Cost Tracking', icon: '💰' },
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'messages':
        return <MessagesView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'costs':
        return <CostTab />;
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
              <p className="mt-2 text-gray-600">
                Welcome to the admin dashboard
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <p className="text-gray-600">Select an option from the sidebar to get started.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Left Sidebar */}
        <div className="min-h-screen w-64 border-r border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-6">
            <h1 className="text-xl font-bold text-gray-900">Admin</h1>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full rounded-lg px-4 py-2 text-left transition-colors ${
                      currentView === item.id
                        ? 'bg-blue-100 font-medium text-blue-900'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
};
