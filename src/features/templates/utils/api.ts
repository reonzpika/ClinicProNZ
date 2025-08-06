import { createAuthHeadersWithGuest } from '@/src/shared/utils';

import type { Template } from '../types';

export async function fetchTemplates(
  userId?: string | null,
  userTier?: string,
  guestToken?: string | null,
): Promise<Template[]> {
  const res = await fetch('/api/templates', {
    headers: createAuthHeadersWithGuest(userId, userTier, guestToken),
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
  guestToken?: string | null,
): Promise<Template> {
  const res = await fetch('/api/templates', {
    method: 'POST',
    headers: createAuthHeadersWithGuest(userId, userTier, guestToken),
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
  guestToken?: string | null,
): Promise<Template> {
  const res = await fetch(`/api/templates/${id}`, {
    method: 'PATCH',
    headers: createAuthHeadersWithGuest(userId, userTier, guestToken),
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
  guestToken?: string | null,
): Promise<void> {
  const res = await fetch(`/api/templates/${id}`, {
    method: 'DELETE',
    headers: createAuthHeadersWithGuest(userId, userTier, guestToken),
  });
  if (!res.ok) {
    throw new Error('Failed to delete template');
  }
}
