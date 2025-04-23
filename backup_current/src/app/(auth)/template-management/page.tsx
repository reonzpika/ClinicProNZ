'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { TemplateBrowser } from '@/components/template-management/TemplateBrowser';
import { Button } from '@/components/ui/button';
import type { Template } from '@/types/templates';

export default function TemplateManagementPage() {
  const router = useRouter();

  const handleTemplateSelect = (template: Template) => {
    router.push(`/template-management/edit/${template.id}`);
  };

  const handleCreateNew = () => {
    router.push('/template-management/new');
  };

  return (
    <div className="container space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template Management</h1>
          <p className="mt-2 text-muted-foreground">
            Browse, create, and manage your note templates.
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 size-4" />
          Create New Template
        </Button>
      </div>

      <TemplateBrowser onTemplateSelect={handleTemplateSelect} />
    </div>
  );
}
