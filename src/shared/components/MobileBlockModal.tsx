'use client';

import { ArrowLeft, Monitor, Smartphone } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/components/ui/dialog';

interface MobileBlockModalProps {
  isOpen: boolean;
}

export const MobileBlockModal = ({ isOpen }: MobileBlockModalProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent 
        className="max-w-md [&>button]:hidden" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-100">
            <Monitor className="size-8 text-blue-600" />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Desktop Required
          </DialogTitle>
          <DialogDescription className="mt-4 space-y-4 text-left">
            <p className="text-gray-600">
              ClinicPro's consultation features are optimised for desktop use to ensure the best clinical documentation experience. Please visit{' '}
              <span className="font-medium text-blue-600">clinicpro.co.nz</span> on your desktop or laptop computer.
            </p>
            <div className="rounded-lg bg-blue-50 p-3">
              <div className="flex items-center gap-2">
                <Smartphone className="size-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Mobile support is coming soon!
                </span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        {/* Back link positioned at bottom left */}
        <div className="mt-6">
          <Link 
            href="/early" 
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 