'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { TemplateService } from '@/services/template.service';
import type { Template } from '@/types/templates';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadTemplates = async () => {
    try {
      setLoading(true);
      // TODO: Add method to TemplateService to get system/default templates
      const templates = await TemplateService.getAllByUserId('system');
      setTemplates(templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Templates Library</h1>
        <Link
          href="/auth/login"
          className="text-blue-500 hover:text-blue-600"
        >
          Sign in to manage templates
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border px-4 py-2"
        />
      </div>

      {/* Template List */}
      <div className="grid gap-4">
        {filteredTemplates.length === 0
          ? (
              <div className="py-8 text-center text-gray-500">
                No templates found
              </div>
            )
          : (
              filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="rounded-lg border p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">{template.name}</h2>
                      {template.description && (
                        <p className="mt-1 text-gray-600">{template.description}</p>
                      )}
                    </div>
                    <Link
                      href={`/templates/${template.id}`}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            )}
      </div>
    </div>
  );
}
