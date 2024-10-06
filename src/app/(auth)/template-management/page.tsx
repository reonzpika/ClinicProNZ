'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { TemplateManagementInterface } from '@/components/TemplateManagementInterface';
import { Button } from '@/components/ui/button';
import { useTemplateManagement } from '@/hooks/useTemplateManagement';

export default function TemplateManagementPage() {
  const { templates, addTemplate, editTemplate, deleteTemplate } = useTemplateManagement();
  const router = useRouter();

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Template Management</h1>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 size-4" />
          {' '}
          Go Back
        </Button>
      </div>
      <TemplateManagementInterface
        templates={templates}
        addTemplate={addTemplate}
        editTemplate={editTemplate}
        deleteTemplate={deleteTemplate}
      />
    </div>
  );
}
