'use client';

import { ChevronDown, ChevronUp, Copy, Maximize2, Minimize2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { NOTE_TEMPLATES } from '@/config/noteTemplates';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  content: string;
  selectedTemplate: string;
  onChange: (value: string) => void;
}

export function CollapsibleSection({
  title,
  content,
  selectedTemplate,
  onChange,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();
  const template = NOTE_TEMPLATES.find(t => t.id === selectedTemplate);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast({
      description: 'Copied to clipboard',
    });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setIsOpen(true); // Always open when going fullscreen
  };

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen}
      className={cn(
        isFullscreen && 'fixed inset-4 z-50 bg-background p-6 shadow-lg rounded-lg'
      )}
    >
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            {title}
          </Button>
        </CollapsibleTrigger>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            <Copy className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </Button>
        </div>
      </div>

      <CollapsibleContent className="mt-2">
        <Textarea
          placeholder={template?.structure.sections.map(section => 
            `${section.label}:\n${section.prompt}\n`
          ).join('\n')}
          className={cn(
            "w-full resize-none bg-background text-sm placeholder:text-muted-foreground/50",
            isFullscreen ? "h-[calc(100vh-10rem)]" : "h-[20vh] md:h-[30vh] lg:h-[40vh]"
          )}
          value={content}
          onChange={e => onChange(e.target.value)}
        />
      </CollapsibleContent>
    </Collapsible>
  );
} 