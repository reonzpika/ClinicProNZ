'use client';

import { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/components/ui/dialog';
import { cn } from '@/src/lib/utils';
import { TrafficLightContent } from './TrafficLightContent';

interface TrafficLightModalProps {
  open: boolean;
  onClose: () => void;
  initialSection?: 'green' | 'amber' | 'red' | null;
}

export function TrafficLightModal({
  open,
  onClose,
  initialSection,
}: TrafficLightModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && initialSection && contentRef.current) {
      const timer = setTimeout(() => {
        const element = contentRef.current?.querySelector(`#${initialSection}-zone`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [open, initialSection]);

  const scrollToSection = (section: string) => {
    const element = contentRef.current?.querySelector(`#${section}-zone`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className={cn(
          'flex flex-col p-0 gap-0 max-h-[90vh] h-full md:max-w-5xl',
          'data-[state=open]:slide-in-from-bottom-[48%] data-[state=closed]:slide-out-to-bottom-[48%]'
        )}
      >
        <DialogHeader className="p-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-2xl font-bold text-text-primary">
              Traffic Light Medication Checker
            </DialogTitle>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => scrollToSection('green')}
              className="px-4 py-2 rounded-lg bg-green-100 text-green-800 hover:bg-green-200 transition-colors font-medium"
            >
              GREEN
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('amber')}
              className="px-4 py-2 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors font-medium"
            >
              AMBER
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('red')}
              className="px-4 py-2 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 transition-colors font-medium"
            >
              RED
            </button>
          </div>
        </DialogHeader>
        <div ref={contentRef} className="flex-1 overflow-y-auto p-8">
          <TrafficLightContent key={open ? 'open' : 'closed'} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
