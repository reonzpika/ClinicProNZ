'use client';

import type { AnalysisResult } from '@/types';
import { cn } from '@/utils/ui';

type ConsultRemindersProps = {
  findings: AnalysisResult;
};

export function ConsultReminders({ findings }: ConsultRemindersProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Patient Agenda */}
      <div className="space-y-1.5">
        <h3 className="font-medium">Patient Agenda</h3>
        <div className="grid gap-1">
          {findings.patientAgenda.map((item, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center justify-between rounded-md px-2 py-1 text-sm',
                item.priority === 'urgent'
                  ? 'bg-red-50 text-red-900 dark:bg-red-900/10 dark:text-red-200'
                  : 'bg-slate-50 text-slate-900 dark:bg-slate-900/10 dark:text-slate-200',
              )}
            >
              <span className="flex items-center gap-1.5">
                {item.type === 'request' && '📝'}
                {item.type === 'symptom' && '🔴'}
                {item.type === 'other' && '📌'}
                {item.description}
              </span>
              {item.priority === 'urgent' && (
                <span className="shrink-0 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-300">
                  !
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Red Flags */}
      {findings.redFlags?.length > 0 && (
        <div className="space-y-1.5">
          <h3 className="font-medium text-red-600">Red Flags 🚩</h3>
          <div className="grid gap-1">
            {findings.redFlags.map((flag, index) => (
              <div
                key={index}
                className="rounded-md bg-red-50 px-2 py-1.5 text-red-900 dark:bg-red-900/10 dark:text-red-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{flag.symptom}</span>
                  <span className="shrink-0 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-300">
                    {flag.urgency === 'immediate' ? '!!' : '!'}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-red-700/90 dark:text-red-300/90">
                  {flag.reasoning}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Significant Points */}
      {findings.significantPoints?.length > 0 && (
        <div className="space-y-1.5 md:col-span-2">
          <h3 className="font-medium">Important Points</h3>
          <div className="grid gap-1">
            {findings.significantPoints.map((point, index) => (
              <div
                key={index}
                className="rounded-md bg-blue-50 px-2 py-1 text-blue-900 dark:bg-blue-900/10 dark:text-blue-200"
              >
                <span className="font-medium uppercase text-blue-700 dark:text-blue-300">
                  {point.type === 'pmhx' ? 'PMHx' : point.type}
                </span>
                {': '}
                {point.description}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
