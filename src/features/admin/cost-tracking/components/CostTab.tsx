'use client';

/**
 * Main cost tracking tab component
 */

import React, { useEffect, useState } from 'react';

import { useCostSummary, useUserCostSummaries } from '../hooks/useCostTracking';
import { CostBreakdown } from './CostBreakdown';
import { CostMetrics } from './CostMetrics';
import { UserCostTable } from './UserCostTable';
import { Button } from '@/src/shared/components/ui/button';

type CostView = 'overview' | 'users' | 'sessions';

export const CostTab: React.FC = () => {
  const [currentView, setCurrentView] = useState<CostView>('overview');

  const {
    data: summary,
    isLoading: summaryLoading,
    isFetching: summaryFetching,
    error: summaryError,
    refetch: refetchSummary,
  } = useCostSummary();
  const {
    data: userSummaries,
    isLoading: usersLoading,
    isFetching: usersFetching,
    refetch: refetchUsers,
  } = useUserCostSummaries();

  // Ensure fresh data on mount similar to Messages/Analytics views
  useEffect(() => {
    refetchSummary();
    refetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const viewOptions = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'users' as const, label: 'By Users' },
    { id: 'sessions' as const, label: 'By Sessions' },
  ];

  if (summaryError) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Cost Tracking</h2>
          <p className="mt-2 text-gray-600">Monitor API usage costs across the platform</p>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading cost data</h3>
              <div className="mt-2 text-sm text-red-700">
                {summaryError instanceof Error ? summaryError.message : 'Unknown error occurred'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'users':
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Cost by User</h3>
              <UserCostTable users={userSummaries || []} loading={usersLoading} />
            </div>
          </div>
        );

      case 'sessions':
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Cost by Session</h3>
              <p className="text-gray-600">Session-level cost analysis coming soon...</p>
            </div>
          </div>
        );

      case 'overview':
      default:
        return (
          <div className="space-y-6">
            {/* Cost Metrics */}
            <CostMetrics summary={summary!} loading={summaryLoading || summaryFetching} />

            {/* Cost Breakdown */}
            <CostBreakdown summary={summary!} loading={summaryLoading || summaryFetching} />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cost Tracking</h2>
          <p className="mt-2 text-gray-600">Monitor API usage costs across the platform</p>
        </div>
        <div className="flex items-center space-x-2">
          {(summaryFetching || usersFetching) && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" aria-label="Refreshing" />
          )}
          <Button
            onClick={() => { refetchSummary(); refetchUsers(); }}
            variant="outline"
            size="sm"
            disabled={summaryFetching || usersFetching}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* View Selector */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {viewOptions.map(view => (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id)}
              className={`whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium ${
                currentView === view.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {view.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {currentView === 'users' ? (
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Cost by User</h3>
            <UserCostTable users={userSummaries || []} loading={usersLoading || usersFetching} />
          </div>
        </div>
      ) : (
        renderCurrentView()
      )}
    </div>
  );
};
