import { useCallback, useEffect, useState } from 'react';

import type { Prompt } from '@/types/prompts';

export function usePromptManagement() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/prompts');
      if (!response.ok) {
        throw new Error('Failed to fetch prompts');
      }
      const data = await response.json();
      setPrompts(data);
    } catch (err) {
      setError('Error fetching prompts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const addPrompt = async (newPrompt: Omit<Prompt, 'id'>) => {
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrompt),
      });
      if (!response.ok) {
        throw new Error('Failed to add prompt');
      }
      const addedPrompt = await response.json();
      setPrompts([...prompts, addedPrompt]);
    } catch (err) {
      setError('Error adding prompt');
      console.error(err);
    }
  };

  const editPrompt = async (id: number, updatedPrompt: Omit<Prompt, 'id'>) => {
    try {
      const response = await fetch('/api/prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updatedPrompt }),
      });
      if (!response.ok) {
        throw new Error('Failed to update prompt');
      }
      const editedPrompt = await response.json();
      setPrompts(prompts.map(prompt =>
        prompt.id === id ? editedPrompt : prompt,
      ));
    } catch (err) {
      setError('Error updating prompt');
      console.error(err);
    }
  };

  const deletePrompt = async (id: number) => {
    try {
      const response = await fetch('/api/prompts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete prompt');
      }
      setPrompts(prompts.filter(prompt => prompt.id !== id));
    } catch (err) {
      setError('Error deleting prompt');
      console.error(err);
    }
  };

  return { prompts, isLoading, error, addPrompt, editPrompt, deletePrompt };
}
