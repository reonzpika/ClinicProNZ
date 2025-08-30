'use client';

import React, { useState } from 'react';

import { MessagesView } from './MessagesView';

type AdminView = 'overview' | 'messages' | 'analytics';

export const AdminDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminView>('overview');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'messages':
        return <MessagesView />;
      case 'analytics':
        return (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Analytics</h2>
            <p className="text-gray-600">Analytics dashboard coming soon...</p>
          </div>
        );
      default:
        return (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Dashboard Overview</h2>
            <p className="text-gray-600">Select an option from the sidebar to get started.</p>
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
              <li>
                <button
                  onClick={() => setCurrentView('messages')}
                  className={`w-full rounded-lg px-4 py-2 text-left transition-colors ${
                    currentView === 'messages'
                      ? 'border border-blue-200 bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span>📧</span>
                    <span>Messages</span>
                  </div>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('analytics')}
                  className={`w-full rounded-lg px-4 py-2 text-left transition-colors ${
                    currentView === 'analytics'
                      ? 'border border-blue-200 bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span>📊</span>
                    <span>Analytics</span>
                  </div>
                </button>
              </li>
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
