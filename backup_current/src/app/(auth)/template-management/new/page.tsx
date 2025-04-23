'use client';

import { useRouter } from 'next/navigation';

import { TemplateEditor } from '@/components/template-editor/TemplateEditor';
import { useNotification } from '@/components/ui/notification';
import { TemplateService } from '@/services/template.service';
import type { NewTemplate } from '@/types/templates';

export default function NewTemplatePage() {
  const router = useRouter();
  const { showNotification } = useNotification();

  const handleSave = async (template: NewTemplate) => {
    try {
      await TemplateService.create(template);
      showNotification('success', 'Template created successfully');
      router.push('/template-management');
    } catch (error) {
      console.error('Failed to create template:', error);
      showNotification('error', 'Failed to create template. Please try again.');
    }
  };

  return (
    <div className="container space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Template</h1>
        <p className="mt-2 text-muted-foreground">
          Create a new template for generating notes.
        </p>
      </div>

      <TemplateEditor
        isNew
        onSave={handleSave}
      />
    </div>
  );
}
