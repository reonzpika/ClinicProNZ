import { Copy, Download, Printer } from 'lucide-react';
import type { FC } from 'react';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/utils/ui';

type FormattedNoteSection = {
  title: string;
  content: string;
  key?: string;
};

type FormattedNoteProps = {
  title: string;
  metadata: {
    generatedAt: Date;
    templateName: string;
    analysisLevel: string;
    conciseLevel: string;
  };
  sections: FormattedNoteSection[];
  className?: string;
};

export const FormattedNote: FC<FormattedNoteProps> = ({
  title,
  metadata,
  sections,
  className,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleCopyToClipboard = async () => {
    if (!contentRef.current) {
      return;
    }

    try {
      const content = contentRef.current.innerText;
      await navigator.clipboard.writeText(content);
      toast({
        title: 'Copied to Clipboard',
        description: 'Note content has been copied to your clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy content to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    toast({
      title: 'Coming Soon',
      description: 'PDF export will be available in a future update.',
    });
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Actions */}
      <div className="flex justify-end gap-2 print:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyToClipboard}
        >
          <Copy className="mr-2 size-4" />
          Copy
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
        >
          <Printer className="mr-2 size-4" />
          Print
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPDF}
        >
          <Download className="mr-2 size-4" />
          Export PDF
        </Button>
      </div>

      {/* Note Content */}
      <Card className="@container/note p-8">
        <div ref={contentRef}>
          {/* Header */}
          <div className="mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold">{title}</h1>
            <div className="@lg/note:grid-cols-4 mt-2 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Generated:</span>
                {' '}
                {metadata.generatedAt.toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Template:</span>
                {' '}
                {metadata.templateName}
              </div>
              <div>
                <span className="font-medium">Analysis:</span>
                {' '}
                {metadata.analysisLevel}
              </div>
              <div>
                <span className="font-medium">Conciseness:</span>
                {' '}
                {metadata.conciseLevel}
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <section key={section.key ?? index} className="break-inside-avoid">
                <h2 className="mb-3 text-xl font-semibold">{section.title}</h2>
                <div className="whitespace-pre-wrap">{section.content}</div>
              </section>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
