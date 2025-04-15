'use client';

import { cn } from '@/lib/utils';

interface FindingProps {
  type: 'symptom' | 'duration' | 'risk' | 'vital' | 'medication';
  importance: 'high' | 'medium' | 'low';
  text: string;
}

export function ClinicalFinding({ type, importance, text }: FindingProps) {
  return (
    <div className={cn(
      'flex items-center gap-2 rounded-md p-2 text-sm transition-colors',
      importance === 'high' && 'bg-red-100/80 text-red-900 dark:bg-red-900/20 dark:text-red-300',
      importance === 'medium' && 'bg-yellow-100/80 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-300',
      importance === 'low' && 'bg-blue-100/80 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300'
    )}>
      <span className="shrink-0">
        {type === 'symptom' && '🔴'}
        {type === 'duration' && '⏱️'}
        {type === 'risk' && '⚠️'}
        {type === 'vital' && '💓'}
        {type === 'medication' && '💊'}
      </span>
      <span className="line-clamp-2">{text}</span>
    </div>
  );
} 