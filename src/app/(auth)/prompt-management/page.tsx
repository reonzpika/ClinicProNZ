'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PromptManagementInterface } from '@/components/PromptManagementInterface';
import { Button } from '@/components/ui/button';
import type { Prompt } from '@/types/prompts';

export default function PromptManagementPage() {
  const [initialPrompts, setInitialPrompts] = useState<Prompt[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchPrompts() {
      try {
        const response = await fetch('/api/prompts');
        if (!response.ok) {
          throw new Error('Failed to fetch prompts');
        }
        const prompts = await response.json();
        setInitialPrompts(prompts);
      } catch (error) {
        console.error('Error fetching prompts:', error);
        // Handle error (e.g., show error message to user)
      }
    }
    fetchPrompts();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Prompt Management</h1>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 size-4" />
          {' '}
          Go Back
        </Button>
      </div>
      <PromptManagementInterface initialPrompts={initialPrompts} />
    </div>
  );
}
