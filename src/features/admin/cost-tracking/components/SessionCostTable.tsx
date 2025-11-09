/**
 * Session cost table component
 */

import React from 'react';

import type { SessionCostDetail } from '../hooks/useCostTracking';
import { formatCost } from '../services/costCalculator';

type SessionCostTableProps = {
  sessions: SessionCostDetail[];
  loading?: boolean;
};

export const SessionCostTable: React.FC<SessionCostTableProps> = ({ sessions, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-4 h-6 w-40 rounded bg-gray-200"></div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
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

  if (sessions.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mb-4 text-4xl text-gray-400">🗂️</div>
        <h3 className="text-lg font-medium text-gray-900">No session cost data yet</h3>
        <p className="text-gray-600">Costs will appear once sessions accrue API usage.</p>
      </div>
    );
  }

  const sorted = [...sessions].sort((a, b) => b.totalCost - a.totalCost);

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Session</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Total Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Requests</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Top Provider</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Top Function</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sorted.map((s) => {
              const topProvider = Object.entries(s.byProvider).reduce((a, b) => s.byProvider[a[0] as keyof typeof s.byProvider] > s.byProvider[b[0] as keyof typeof s.byProvider] ? a : b);
              const topFunction = Object.entries(s.byFunction).reduce((a, b) => s.byFunction[a[0] as keyof typeof s.byFunction] > s.byFunction[b[0] as keyof typeof s.byFunction] ? a : b);

              const providerIcons = { deepgram: '🎙️', openai: '🤖', perplexity: '🔍' } as const;
              const functionIcons = { transcription: '📝', note_generation: '📄', chat: '💬' } as const;

              return (
                <tr key={s.sessionId} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-mono text-sm text-gray-700">
{s.sessionId.substring(0, 8)}
…
                    </div>
                    <div className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleString()}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">{s.patientName}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{formatCost(s.totalCost)}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">{s.requestCount.toLocaleString()}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <span className="mr-2">{providerIcons[topProvider[0] as keyof typeof providerIcons]}</span>
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
                      <span className="mr-2">{functionIcons[topFunction[0] as keyof typeof functionIcons]}</span>
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
