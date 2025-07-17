'use client';

import { Stethoscope } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';

import { ExaminationChecklistModal } from './ExaminationChecklistModal';

type ExaminationChecklistButtonProps = {
  className?: string;
};

export const ExaminationChecklistButton: React.FC<ExaminationChecklistButtonProps> = ({
  className,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        size="sm"
        variant="ghost"
        className={`size-6 p-0 text-slate-500 hover:text-slate-700 ${className || ''}`}
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
