import type { Template } from '../types';
import { createAuthHeadersWithGuest } from '@/src/shared/utils';

export async function fetchTemplates(): Promise<Template[]> {
  const res = await fetch('/api/templates');
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

export async function deleteTemplate(id: string): Promise<void> {
  const res = await fetch(`/api/templates/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to delete template');
  }
}
