import { createAuthHeaders } from '@/src/shared/utils';

import type { Template } from '../types';

export async function fetchTemplates(
  userId?: string | null,
  userTier?: string,
): Promise<Template[]> {
  const res = await fetch('/api/templates', {
    headers: createAuthHeaders(userId, userTier),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch templates');
  }
  const data = await res.json();
  return data.templates;
}

export async function createTemplate(
  template: Omit<Template, 'id'>,
  userId?: string | null,
  userTier?: string,
): Promise<Template> {
  const res = await fetch('/api/templates', {
    method: 'POST',
    headers: createAuthHeaders(userId, userTier),
    body: JSON.stringify(template),
  });
  if (!res.ok) {
    throw new Error('Failed to create template');
  }
  return res.json();
}

export async function updateTemplate(
  id: string,
  template: Partial<Template>,
  userId?: string | null,
  userTier?: string,
): Promise<Template> {
  const res = await fetch(`/api/templates/${id}`, {
    method: 'PATCH',
    headers: createAuthHeaders(userId, userTier),
    body: JSON.stringify(template),
  });
  if (!res.ok) {
    throw new Error('Failed to update template');
  }
  return res.json();
}

export async function deleteTemplate(
  id: string,
  userId?: string | null,
  userTier?: string,
): Promise<void> {
  const res = await fetch(`/api/templates/${id}`, {
    method: 'DELETE',
    headers: createAuthHeaders(userId, userTier),
  });
  if (!res.ok) {
    throw new Error('Failed to delete template');
  }
}
