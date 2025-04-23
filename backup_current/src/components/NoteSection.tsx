'use client';

import { Check, Copy, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import { ConsultTimer } from '@/components/ConsultTimer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { NOTE_TEMPLATES } from '@/config/noteTemplates';
import { cn } from '@/utils/ui';

type NoteSectionProps = {
  content: string;
  selectedTemplate: string;
  onChange: (value: string) => void;
  onCorrect: () => void;
  onReset: () => void;
  isCorrecting: boolean;
};

export function NoteSection({
  content,
  selectedTemplate,
  onChange,
  onCorrect,
  onReset,
  isCorrecting,
}: NoteSectionProps) {
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
  };

  return (
    <Card
      className={cn(
        'bg-card transition-all duration-200 flex flex-col',
        isFullscreen ? 'fixed left-0 top-0 z-50 h-screen w-screen bg-background p-6' : 'h-full',
      )}
    >
      <div className="flex shrink-0 items-center justify-between bg-muted px-3 py-2">
        <div className="flex items-center gap-3">
          <span className="font-medium">Note</span>
          <ConsultTimer />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCorrect} disabled={isCorrecting}>
            <Check className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            <Copy className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </Button>
        </div>
      </div>

      <div className="flex grow p-3">
        <Textarea
          placeholder={template?.structure.sections.map(section =>
            `${section.label}:\n${section.prompt}\n`,
          ).join('\n')}
          className={cn(
            'w-full resize-none bg-background text-base leading-relaxed flex-grow',
            'focus:ring-0 focus:ring-offset-0 border-0',
          )}
          value={content}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    </Card>
  );
}
