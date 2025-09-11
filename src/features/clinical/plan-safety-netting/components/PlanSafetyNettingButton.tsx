'use client';

import { ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';

import { PlanSafetyNettingModal } from './PlanSafetyNettingModal';

type PlanSafetyNettingButtonProps = {
  className?: string;
  tabIndex?: number;
};

export const PlanSafetyNettingButton: React.FC<PlanSafetyNettingButtonProps> = ({
  className,
  tabIndex,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Global keyboard shortcut for Alt+P (Plan)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'p' && !isModalOpen) {
        e.preventDefault();
        setIsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        size="sm"
        variant="ghost"
        className={`size-6 p-0 text-slate-500 hover:text-slate-700 ${className || ''}`}
        tabIndex={tabIndex}
        title="Plan & Safety-Netting (Alt+P)"
      >
        <ClipboardList size={14} />
      </Button>

      <PlanSafetyNettingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
