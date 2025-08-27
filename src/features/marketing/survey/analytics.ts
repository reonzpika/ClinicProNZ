import type { AnalyticsEvent } from './types';

export async function emitAnalytics(event: AnalyticsEvent) {
  try {
    // Attempt client-side send; server has fallback logging
    await fetch('/api/surveys/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true,
    });
  } catch {}
}

