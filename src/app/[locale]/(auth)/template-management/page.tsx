'use client';

import { useTemplateManagement } from '@/hooks/useTemplateManagement';
import { TemplateManagementInterface } from '@/components/TemplateManagementInterface';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function TemplateManagementPage() {
  const { templates, addTemplate, editTemplate, deleteTemplate } = useTemplateManagement();
  const router = useRouter();

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Template Management</h1>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
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