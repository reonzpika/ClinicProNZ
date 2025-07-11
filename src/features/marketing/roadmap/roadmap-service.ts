import type { Feature, FeatureRequest } from './types';

export async function getFeatures(): Promise<{
  planned: Feature[];
  in_progress: Feature[];
  completed: Feature[];
}> {
  const res = await fetch('/api/roadmap/features');
  if (!res.ok) {
    throw new Error('Failed to fetch features');
  }
  return res.json();
}

export async function voteForFeature(feature_id: number): Promise<{ success: boolean; message?: string }> {
  const res = await fetch('/api/roadmap/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feature_id }),
  });
  return res.json();
}

export async function submitFeatureRequest(data: Omit<FeatureRequest, 'id' | 'created_at' | 'ip_address'>): Promise<{ success: boolean; message?: string }> {
  const res = await fetch('/api/roadmap/feature-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
