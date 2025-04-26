'use client';

import { Maximize2, Minimize2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/utils/ui';

type ExpandableCardProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
  onExpand?: (expanded: boolean) => void;
};

export function ExpandableCard({
  title,
  children,
  className,
  onExpand,
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpand?.(newExpanded);
  };

  return (
    <Card
      className={cn(
        'relative p-3 transition-all duration-200',
        isExpanded && 'fixed right-0 top-0 z-50 h-screen w-1/2 overflow-auto',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExpand}
          className="hover:bg-muted/50"
        >
          {isExpanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </Button>
      </div>
      <div className={cn(
        'mt-2 overflow-y-auto',
        isExpanded ? 'h-[calc(100vh-6rem)]' : 'h-32',
      )}
      >
        {children}
      </div>
    </Card>
  );
}
