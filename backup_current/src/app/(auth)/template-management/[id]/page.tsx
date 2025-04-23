'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { TemplateEditor } from '@/components/template-editor/TemplateEditor';
import { Button } from '@/components/ui/button';
import { useNotification } from '@/components/ui/notification-context';
import { TemplateService } from '@/services/template.service';
import type { TemplateWithSections } from '@/types/templates';

export default function EditTemplatePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [template, setTemplate] = useState<TemplateWithSections | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const template = await TemplateService.getWithSections(Number.parseInt(params.id));
      if (!template) {
        showNotification('error', 'Template not found');
        router.push('/template-management');
        return;
      }
      setTemplate(template);
    } catch (error) {
      console.error('Failed to load template:', error);
      showNotification('error', 'Failed to load template. Please try again.');
      router.push('/template-management');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplate();
  }, [params.id]);

  const handleSave = async (updatedTemplate: TemplateWithSections) => {
    try {
      await TemplateService.update(Number.parseInt(params.id), updatedTemplate);
      showNotification('success', 'Template updated successfully');
      router.push('/template-management');
    } catch (error) {
      console.error('Failed to save template:', error);
      showNotification('error', 'Failed to save template. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container space-y-6 py-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/template-management')}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Template</h1>
          <p className="mt-2 text-muted-foreground">
            Make changes to your template.
          </p>
        </div>
      </div>

      <TemplateEditor
        template={template ?? undefined}
        onSave={handleSave}
        onCancel={() => router.push('/template-management')}
      />
    </div>
  );
}
