/**
 * Cost metrics display component
 */

import type { CostSummary } from '../hooks/useCostTracking';
import { formatCost } from '../services/costCalculator';

type CostMetricsProps = {
  summary: CostSummary;
  loading?: boolean;
};

export const CostMetrics: React.FC<CostMetricsProps> = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="animate-pulse">
              <div className="h-4 w-16 rounded bg-gray-200"></div>
              <div className="mt-2 h-8 w-24 rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Cost */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center">
          <div className="shrink-0">
            <div className="flex size-8 items-center justify-center rounded-md bg-green-500 text-white">
              💰
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="truncate text-sm font-medium text-gray-500">Total Cost</dt>
              <dd className="text-lg font-medium text-gray-900">{formatCost(summary.totalCost)}</dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Total Users */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center">
          <div className="shrink-0">
            <div className="flex size-8 items-center justify-center rounded-md bg-blue-500 text-white">
              👥
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="truncate text-sm font-medium text-gray-500">Active Users</dt>
              <dd className="text-lg font-medium text-gray-900">{summary.totalUsers.toLocaleString()}</dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Total Sessions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center">
          <div className="shrink-0">
            <div className="flex size-8 items-center justify-center rounded-md bg-purple-500 text-white">
              📋
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="truncate text-sm font-medium text-gray-500">Sessions</dt>
              <dd className="text-lg font-medium text-gray-900">{summary.totalSessions.toLocaleString()}</dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Total Requests */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center">
          <div className="shrink-0">
            <div className="flex size-8 items-center justify-center rounded-md bg-orange-500 text-white">
              🔄
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="truncate text-sm font-medium text-gray-500">API Requests</dt>
              <dd className="text-lg font-medium text-gray-900">{summary.totalRequests.toLocaleString()}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};
