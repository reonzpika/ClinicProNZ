'use client';

import { Stethoscope } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';

import { ExaminationChecklistModal } from './ExaminationChecklistModal';

type ExaminationChecklistButtonProps = {
  className?: string;
  tabIndex?: number;
};

export const ExaminationChecklistButton: React.FC<ExaminationChecklistButtonProps> = ({
  className,
  tabIndex,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Global keyboard shortcut for Alt+C
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'c' && !isModalOpen) {
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
        title="Examination Checklist (Alt+C)"
      >
        <Stethoscope size={14} />
      </Button>

      <ExaminationChecklistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
