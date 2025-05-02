import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import type { Template } from '../types';

const API_BASE = '/api/templates';

// Fetch all templates
async function fetchTemplates(): Promise<Template[]> {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    throw new Error('Failed to fetch templates');
  }
  const data = await response.json();
  return data.templates;
}

// Create a new template
async function createTemplate(template: Omit<Template, 'id'>): Promise<Template> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(template),
  });
  if (!response.ok) {
    throw new Error('Failed to create template');
  }
  return response.json();
}

// Update an existing template
async function updateTemplate(id: string, template: Partial<Template>): Promise<Template> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(template),
  });
  if (!response.ok) {
    throw new Error('Failed to update template');
  }
  return response.json();
}

// Delete a template
async function deleteTemplate(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete template');
  }
}

export function useTemplates() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Query for templates list
  const {
    data: templates,
    isLoading: isLoadingTemplates,
    error: fetchError,
  } = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
  });

  // Create template mutation
  const createMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Update template mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, template }: { id: string; template: Partial<Template> }) =>
      updateTemplate(id, template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Get a specific template
  const getTemplate = useCallback(
    (id: string) => {
      return templates?.find(template => template.id === id);
    },
    [templates],
  );

  return {
    templates,
    isLoading: isLoadingTemplates,
    error: error || (fetchError as Error)?.message || null,
    createTemplate: createMutation.mutate,
    updateTemplate: updateMutation.mutate,
    deleteTemplate: deleteMutation.mutate,
    getTemplate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
