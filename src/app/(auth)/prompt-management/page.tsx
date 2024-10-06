'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { PromptManagementInterface } from '@/components/PromptManagementInterface';
import { Button } from '@/components/ui/button';
import { usePromptManagement } from '@/hooks/usePromptManagement';

export default function PromptManagementPage() {
  const { prompts, addPrompt, editPrompt, deletePrompt } = usePromptManagement();
  const router = useRouter();

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
      <PromptManagementInterface
        prompts={prompts}
        addPrompt={addPrompt}
        editPrompt={editPrompt}
        deletePrompt={deletePrompt}
      />
    </div>
  );
}
