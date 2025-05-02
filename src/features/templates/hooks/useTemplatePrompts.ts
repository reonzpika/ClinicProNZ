import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Template } from '../types';

const API_BASE = '/api/templates';

// Get template prompts
async function getTemplatePrompts(templateId: string): Promise<Template['prompts']> {
  const response = await fetch(`${API_BASE}/${templateId}/prompts`);
  if (!response.ok) {
    throw new Error('Failed to fetch template prompts');
  }
  const data = await response.json();
  return data.prompts;
}

// Update template prompts
async function updateTemplatePrompts(
  templateId: string,
  prompts: Partial<Template['prompts']>,
): Promise<Template['prompts']> {
  const response = await fetch(`${API_BASE}/${templateId}/prompts`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(prompts),
  });
  if (!response.ok) {
    throw new Error('Failed to update template prompts');
  }
  return response.json();
}

export function useTemplatePrompts(templateId: string) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Query for template prompts
  const {
    data: prompts,
    isLoading: isLoadingPrompts,
    error: fetchError,
  } = useQuery({
    queryKey: ['templatePrompts', templateId],
    queryFn: () => getTemplatePrompts(templateId),
    enabled: !!templateId,
  });

  // Update prompts mutation
  const updateMutation = useMutation({
    mutationFn: (newPrompts: Partial<Template['prompts']>) =>
      updateTemplatePrompts(templateId, newPrompts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templatePrompts', templateId] });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  return {
    prompts,
    isLoading: isLoadingPrompts,
    error: error || (fetchError as Error)?.message || null,
    updatePrompts: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
} 