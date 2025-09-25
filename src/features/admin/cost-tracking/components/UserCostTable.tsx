/**
 * User cost table component
 */

import React from 'react';

import type { UserCostSummary } from '../hooks/useCostTracking';
import { formatCost } from '../services/costCalculator';

type UserCostTableProps = {
  users: UserCostSummary[];
  loading?: boolean;
};

export const UserCostTable: React.FC<UserCostTableProps> = ({ users, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="h-4 rounded bg-gray-200"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mb-4 text-4xl text-gray-400">📊</div>
        <h3 className="text-lg font-medium text-gray-900">No cost data yet</h3>
        <p className="text-gray-600">Cost tracking data will appear here once users start using the platform.</p>
      </div>
    );
  }

  // Sort users by total cost (descending)
  const sortedUsers = [...users].sort((a, b) => b.totalCost - a.totalCost);

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Total Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Sessions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Requests
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Top Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Top Function
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sortedUsers.map((user) => {
              // Find top provider and function
              const topProvider = Object.entries(user.byProvider).reduce((a, b) =>
                user.byProvider[a[0] as keyof typeof user.byProvider] > user.byProvider[b[0] as keyof typeof user.byProvider] ? a : b,
              );

              const topFunction = Object.entries(user.byFunction).reduce((a, b) =>
                user.byFunction[a[0] as keyof typeof user.byFunction] > user.byFunction[b[0] as keyof typeof user.byFunction] ? a : b,
              );

              const providerIcons = {
                deepgram: '🎙️',
                openai: '🤖',
                perplexity: '🔍',
              };

              const functionIcons = {
                transcription: '📝',
                note_generation: '📄',
                chat: '💬',
              };

              return (
                <tr key={user.userId} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.email || user.userId}
                      </div>
                      {user.email && (
                        <div className="font-mono text-sm text-gray-500">
                          {user.userId.substring(0, 8)}
...
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCost(user.totalCost)}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {user.sessionCount.toLocaleString()}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {user.requestCount.toLocaleString()}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <span className="mr-2">
                        {providerIcons[topProvider[0] as keyof typeof providerIcons]}
                      </span>
                      <span className="capitalize">{topProvider[0]}</span>
                      <span className="ml-2 text-gray-500">
                        (
{formatCost(topProvider[1])}
)
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <span className="mr-2">
                        {functionIcons[topFunction[0] as keyof typeof functionIcons]}
                      </span>
                      <span className="capitalize">{topFunction[0].replace('_', ' ')}</span>
                      <span className="ml-2 text-gray-500">
                        (
{formatCost(topFunction[1])}
)
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
