import { useEffect, useState } from 'react';

import type { Prompt } from '@/types/prompts';

const STORAGE_KEY = 'userPrompts';

export function usePromptManagement() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    const storedPrompts = localStorage.getItem(STORAGE_KEY);
    if (storedPrompts) {
      setPrompts(JSON.parse(storedPrompts));
    }
  }, []);

  const savePrompts = (updatedPrompts: Prompt[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPrompts));
    setPrompts(updatedPrompts);
  };

  const addPrompt = (newPrompt: Prompt) => {
    const updatedPrompts = [...prompts, newPrompt];
    savePrompts(updatedPrompts);
  };

  const editPrompt = (id: string, updatedPrompt: Prompt) => {
    const updatedPrompts = prompts.map(prompt =>
      prompt.id === id ? updatedPrompt : prompt,
    );
    savePrompts(updatedPrompts);
  };

  const deletePrompt = (id: string) => {
    const updatedPrompts = prompts.filter(prompt => prompt.id !== id);
    savePrompts(updatedPrompts);
  };

  return { prompts, addPrompt, editPrompt, deletePrompt };
}
