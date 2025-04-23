'use client';

import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, List, Search } from 'lucide-react';
import type { FC } from 'react';
import { useCallback, useState } from 'react';

import { fetchTemplates } from '@/actions/template-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDebounce } from '@/hooks/useDebounce';
import type { Template, TemplateType } from '@/types/templates';
import { cn } from '@/utils/ui';

// Types
type TemplateBrowserProps = {
  className?: string;
  onTemplateSelect?: (template: Template) => void;
};

type ViewMode = 'grid' | 'list';

// Constants
const TEMPLATE_TYPES: TemplateType[] = [
  'multi-problem',
  'specialized',
  'follow-up',
  'assessment',
];

// Helper function to format template preview
const formatTemplatePreview = (template: Template) => {
  const sections = template.sections?.length
    ? `\n\nSections:\n${template.sections.map(s => `• ${s.title}`).join('\n')}`
    : '';

  const variableCount = Object.keys(template.variables || {}).length;
  const variablesInfo = variableCount > 0
    ? `\n\nVariables: ${variableCount}`
    : '';

  return `${template.description || 'No description'}${sections}${variablesInfo}`;
};

// Main Component
export const TemplateBrowser: FC<TemplateBrowserProps> = ({
  className,
  onTemplateSelect,
}) => {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TemplateType | 'all'>('all');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates', debouncedSearch, selectedType],
    queryFn: async () => {
      const allTemplates = await fetchTemplates('current'); // TODO: Get actual user ID
      return allTemplates.filter((template) => {
        const matchesSearch = debouncedSearch
          ? template.name.toLowerCase().includes(debouncedSearch.toLowerCase())
          || template.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
          : true;
        const matchesType = selectedType === 'all' ? true : template.type === selectedType;
        return matchesSearch && matchesType;
      });
    },
  });

  // Event Handlers
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleTypeChange = useCallback((value: string) => {
    setSelectedType(value as TemplateType | 'all');
  }, []);

  const handleViewModeToggle = useCallback(() => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  }, []);

  // Render helpers
  const renderTemplateCard = (template: Template) => (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            key={template.id}
            className="group relative cursor-pointer rounded-lg border p-4 transition-colors hover:border-primary"
            onClick={() => onTemplateSelect?.(template)}
          >
            <h3 className="text-lg font-semibold">{template.name}</h3>
            {template.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {template.description}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                {template.type}
              </span>
              {template.isSystem && (
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                  System
                </span>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-sm">
          <div className="text-sm">
            {formatTemplatePreview(template)}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const renderTemplateListItem = (template: Template) => (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            key={template.id}
            className="group flex cursor-pointer items-center gap-4 rounded-md p-3 hover:bg-accent"
            onClick={() => onTemplateSelect?.(template)}
          >
            <div className="flex-1">
              <h3 className="font-medium">{template.name}</h3>
              {template.description && (
                <p className="line-clamp-1 text-sm text-muted-foreground">
                  {template.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                {template.type}
              </span>
              {template.isSystem && (
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                  System
                </span>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-sm">
          <div className="text-sm">
            {formatTemplatePreview(template)}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-9"
          />
        </div>
        <Select
          value={selectedType}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {TEMPLATE_TYPES.map(type => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={handleViewModeToggle}
          title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
        >
          {viewMode === 'grid' ? <List className="size-4" /> : <LayoutGrid className="size-4" />}
        </Button>
      </div>

      {/* Templates */}
      {isLoading
        ? (
            <div className="py-8 text-center">Loading templates...</div>
          )
        : templates.length === 0
          ? (
              <div className="py-8 text-center text-muted-foreground">
                No templates found
              </div>
            )
          : (
              <div className={cn(
                'grid gap-4',
                viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : '',
              )}
              >
                {templates.map(template =>
                  viewMode === 'grid'
                    ? renderTemplateCard(template)
                    : renderTemplateListItem(template),
                )}
              </div>
            )}
    </div>
  );
};

export default TemplateBrowser;
