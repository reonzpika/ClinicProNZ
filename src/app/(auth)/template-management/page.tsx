'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { TemplateManagementInterface } from '@/components/TemplateManagementInterface';
import { Button } from '@/components/ui/button';
import type { Template } from '@/types/templates';

export default function TemplateManagementPage() {
  const [initialTemplates, setInitialTemplates] = useState<Template[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch('/api/templates');
        if (!response.ok) throw new Error('Failed to fetch templates');
        const templates = await response.json();
        setInitialTemplates(templates);
      } catch (error) {
        console.error('Error fetching templates:', error);
        // Handle error (e.g., show error message to user)
      }
    }
    fetchTemplates();
  }, []);

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
      <TemplateManagementInterface initialTemplates={initialTemplates} />
    </div>
  );
}
