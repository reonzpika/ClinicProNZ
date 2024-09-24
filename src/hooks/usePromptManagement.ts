import { useState, useEffect } from 'react';

export interface Prompt {
  id: string;
  name: string;
  content: string;
}

const STORAGE_KEY = 'savedPrompts';

export function usePromptManagement() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    // Load prompts from localStorage when the component mounts
    const savedPrompts = localStorage.getItem(STORAGE_KEY);
    if (savedPrompts) {
      setPrompts(JSON.parse(savedPrompts));
    }
  }, []);

  const savePromptsToStorage = (updatedPrompts: Prompt[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPrompts));
  };

  const addPrompt = (newPrompt: Omit<Prompt, 'id'>) => {
    const updatedPrompts = [...prompts, { ...newPrompt, id: Date.now().toString() }];
    setPrompts(updatedPrompts);
    savePromptsToStorage(updatedPrompts);
  };

  const editPrompt = (id: string, updatedPrompt: Omit<Prompt, 'id'>) => {
    const updatedPrompts = prompts.map(prompt => 
      prompt.id === id ? { ...prompt, ...updatedPrompt } : prompt
    );
    setPrompts(updatedPrompts);
    savePromptsToStorage(updatedPrompts);
  };

  const deletePrompt = (id: string) => {
    const updatedPrompts = prompts.filter(prompt => prompt.id !== id);
    setPrompts(updatedPrompts);
    savePromptsToStorage(updatedPrompts);
  };

  return { prompts, addPrompt, editPrompt, deletePrompt };
}
