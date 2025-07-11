import { Edit2, FileText } from 'lucide-react';

import { Badge } from '@/src/shared/components/ui/badge';
import { Button } from '@/src/shared/components/ui/button';
import { ScrollArea } from '@/src/shared/components/ui/scroll-area';

import type { Template } from '../types';

type TemplatePreviewProps = {
  template: Template;
  onEdit?: (template: Template) => void;
};

export function TemplatePreview({ template, onEdit }: TemplatePreviewProps) {
  // Analyze template content
  const placeholders = template.templateBody.match(/\[([^\]]+)\]/g) || [];
  const hasInstructions = template.templateBody.includes('(') && template.templateBody.includes(')');

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{template.name || 'Untitled Template'}</h3>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {placeholders.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {placeholders.length}
                  {' '}
                  placeholder
                  {placeholders.length !== 1 ? 's' : ''}
                </Badge>
              )}
              {hasInstructions && (
                <Badge variant="default" className="text-xs">Protected</Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {template.type === 'default' ? 'Default' : 'Custom'}
              </Badge>
            </div>
            {onEdit && template.type !== 'default' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(template)}
                className="h-8 px-3 text-xs"
              >
                <Edit2 className="mr-1 size-3" />
                Edit
              </Button>
            )}
          </div>
        </div>
        {template.description && (
          <p className="text-sm text-slate-600">
            {template.description}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <div className="space-y-6 p-4">
            {/* Template Structure View */}
            {template.templateBody.trim()
              ? (
                  <>
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                        <FileText className="size-4" />
                        Template Structure
                      </h4>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-700">
                          {template.templateBody}
                        </pre>
                      </div>
                    </div>

                    {/* Placeholder Analysis */}
                    {placeholders.length > 0 && (
                      <div>
                        <h4 className="mb-3 text-sm font-medium text-slate-700">Detected Placeholders</h4>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {placeholders.slice(0, 10).map((placeholder, index) => (
                            <div key={index} className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 font-mono text-xs text-blue-800">
                              {placeholder}
                            </div>
                          ))}
                        </div>
                        {placeholders.length > 10 && (
                          <div className="mt-2 text-xs italic text-slate-500">
                            ... and
                            {' '}
                            {placeholders.length - 10}
                            {' '}
                            more placeholder
                            {placeholders.length - 10 !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Template Usage Tips */}
                    <div>
                      <h4 className="mb-3 text-sm font-medium text-slate-700">Usage Information</h4>
                      <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">Character count:</span>
                          <span className="font-medium text-slate-700">{template.templateBody.length.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">Line count:</span>
                          <span className="font-medium text-slate-700">{template.templateBody.split('\n').length.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">Dynamic fields:</span>
                          <span className="font-medium text-slate-700">{placeholders.length}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )
              : (
                  <div className="py-12 text-center text-slate-500">
                    <FileText className="mx-auto mb-4 size-12 opacity-30" />
                    <h4 className="mb-2 text-lg font-medium text-slate-600">Empty Template</h4>
                    <p className="text-sm">This template doesn't contain any content yet.</p>
                    {onEdit && template.type !== 'default' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(template)}
                        className="mt-4"
                      >
                        <Edit2 className="mr-2 size-4" />
                        Add Content
                      </Button>
                    )}
                  </div>
                )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
