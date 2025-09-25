/**
 * Cost breakdown display component
 */

import React from 'react';

import type { CostSummary } from '../hooks/useCostTracking';
import { formatCost } from '../services/costCalculator';

type CostBreakdownProps = {
  summary: CostSummary;
  loading?: boolean;
};

export const CostBreakdown: React.FC<CostBreakdownProps> = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="animate-pulse">
              <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <div className="h-4 w-20 rounded bg-gray-200"></div>
                    <div className="h-4 w-16 rounded bg-gray-200"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const providerData = [
    { name: 'Deepgram', value: summary.byProvider.deepgram, icon: '🎙️', color: 'bg-blue-500' },
    { name: 'OpenAI', value: summary.byProvider.openai, icon: '🤖', color: 'bg-green-500' },
    { name: 'Perplexity', value: summary.byProvider.perplexity, icon: '🔍', color: 'bg-purple-500' },
  ];

  const functionData = [
    { name: 'Transcription', value: summary.byFunction.transcription, icon: '📝', color: 'bg-indigo-500' },
    { name: 'Note Generation', value: summary.byFunction.note_generation, icon: '📄', color: 'bg-orange-500' },
    { name: 'Chat', value: summary.byFunction.chat, icon: '💬', color: 'bg-pink-500' },
  ];

  const BreakdownCard: React.FC<{
    title: string;
    data: Array<{ name: string; value: number; icon: string; color: string }>;
  }> = ({ title, data }) => (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-medium text-gray-900">{title}</h3>
      <div className="space-y-4">
        {data.map((item) => {
          const percentage = summary.totalCost > 0 ? (item.value / summary.totalCost) * 100 : 0;

          return (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`flex size-8 items-center justify-center rounded-md ${item.color} text-sm text-white`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">
{percentage.toFixed(1)}
% of total
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{formatCost(item.value)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bars */}
      <div className="mt-4 space-y-2">
        {data.map((item) => {
          const percentage = summary.totalCost > 0 ? (item.value / summary.totalCost) * 100 : 0;

          return (
            <div key={`${item.name}-bar`} className="flex items-center space-x-3">
              <div className="w-20 text-xs text-gray-500">{item.name}</div>
              <div className="h-2 flex-1 rounded-full bg-gray-200">
                <div
                  className={`h-2 rounded-full ${item.color}`}
                  style={{ width: `${Math.max(percentage, 2)}%` }} // Minimum 2% for visibility
                />
              </div>
              <div className="w-12 text-right text-xs text-gray-500">
                {percentage.toFixed(1)}
%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <BreakdownCard title="By API Provider" data={providerData} />
      <BreakdownCard title="By Function" data={functionData} />
    </div>
  );
};
