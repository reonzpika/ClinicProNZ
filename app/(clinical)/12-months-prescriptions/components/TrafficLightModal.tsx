'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/components/ui/dialog';
import { TRAFFIC_LIGHT_CONTENT } from '../data/traffic-light-checker';
import { cn } from '@/src/lib/utils';

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

  const amberCountRef = useRef(0);

  useEffect(() => {
    if (open && initialSection) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`${initialSection}-zone`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open, initialSection]);

  useEffect(() => {
    if (open) amberCountRef.current = 0;
  }, [open]);

  const scrollToSection = (section: string) => {
    document.getElementById(`${section}-zone`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const components: Components = {
    h2: ({ node, children, ...props }) => {
      const text = String(children);
      let id: string | undefined;
      if (/GREEN/i.test(text)) {
        id = 'green-zone';
      } else if (/AMBER/i.test(text)) {
        amberCountRef.current += 1;
        id = amberCountRef.current === 1 ? 'amber-zone' : 'amber-zone-detail';
      } else if (/RED/i.test(text)) {
        id = 'red-zone';
      }
      return (
        <h2
          id={id}
          className="text-2xl font-bold mt-12 mb-4 text-text-primary first:mt-0"
          {...props}
        >
          {children}
        </h2>
      );
    },
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-6">
        <table
          className="min-w-full border border-border divide-y divide-border"
          {...props}
        />
      </div>
    ),
    th: ({ node, ...props }) => (
      <th
        className="px-4 py-2 text-left text-sm font-semibold text-text-primary bg-surface"
        {...props}
      />
    ),
    td: ({ node, ...props }) => (
      <td className="px-4 py-2 text-sm text-text-secondary border-b border-border" {...props} />
    ),
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
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto p-8 prose prose-lg max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-strong:text-text-primary"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {TRAFFIC_LIGHT_CONTENT}
          </ReactMarkdown>
        </div>
      </DialogContent>
    </Dialog>
  );
}
