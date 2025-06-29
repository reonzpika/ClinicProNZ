'use client';

import { X } from 'lucide-react';
import React from 'react';

import { Button } from '@/shared/components/ui/button';

import RightPanelFeatures from './RightPanelFeatures';

type MobileRightPanelOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const MobileRightPanelOverlay: React.FC<MobileRightPanelOverlayProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close clinical tools panel"
      />

      {/* Overlay Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-80 max-w-[90vw] bg-white shadow-xl lg:hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Clinical Tools</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 hover:bg-slate-100"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-65px)] overflow-auto p-1">
          <RightPanelFeatures />
        </div>
      </div>
    </>
  );
};
