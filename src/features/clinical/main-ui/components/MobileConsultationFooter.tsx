'use client';
// no-op: bump build

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { Button } from '@/src/shared/components/ui/button';
import { TranscriptionControls } from './TranscriptionControls';

export const MobileConsultationFooter: React.FC = () => {
  const {
    generatedNotes,
    transcription,
    typedInput,
    problemsText,
    objectiveText,
    assessmentText,
    planText,
  } = useConsultationStores() as any;
  const [mounted, setMounted] = useState(false);
  const [footerRoot, setFooterRoot] = useState<HTMLElement | null>(null);
  // Must be declared before any early return to preserve hook order
  const [forcePostGen, setForcePostGen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tryAttach = () => {
      const el = document.getElementById('app-footer-slot');
      if (el && el !== footerRoot) setFooterRoot(el);
    };
    tryAttach();
    const id = window.setInterval(tryAttach, 300);
    return () => window.clearInterval(id);
  }, [footerRoot]);

  const hasGenerated = useMemo(() => !!(generatedNotes && generatedNotes.trim().length > 0), [generatedNotes]);
  const hasUserContent = useMemo(() => {
    const t = (transcription?.transcript || '').trim();
    const ti = (typedInput || '').trim();
    const anySoap = [problemsText, objectiveText, assessmentText, planText].some((s: string) => !!(s && s.trim()));
    return !!(t || ti || anySoap);
  }, [transcription?.transcript, typedInput, problemsText, objectiveText, assessmentText, planText]);

  if (!mounted || !footerRoot) return null;

  const onProcess = () => {
    setForcePostGen(true);
    window.dispatchEvent(new CustomEvent('footer:process'));
  };
  const onFinish = () => {
    setForcePostGen(false);
    window.dispatchEvent(new CustomEvent('footer:finish'));
  };
  const onNew = () => {
    setForcePostGen(false);
    window.dispatchEvent(new CustomEvent('footer:new'));
  };

  const showPostGen = forcePostGen || hasGenerated;

  return createPortal(
    <div className="flex items-center gap-3">
      {/* Recording control visible only pre-generation */}
      {!showPostGen && (
        <TranscriptionControls
          collapsed={false}
          isMinimized={false}
          enableRemoteMobile={false}
          showRecordingMethodToggle={false}
          mobileMode
          footerMode
        />
      )}

      {/* CTAs */}
      {!showPostGen && (
        <Button
          type="button"
          variant="default"
          onClick={onProcess}
          disabled={!hasUserContent}
          className="h-11 flex-1 rounded-full bg-slate-700 px-4 text-base text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          Process
        </Button>
      )}

      {showPostGen && (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onFinish}
            className="h-11 flex-1 rounded-full border-red-300 text-base text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Finish
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={onNew}
            className="h-11 flex-1 rounded-full bg-blue-600 text-base text-white hover:bg-blue-700"
          >
            New
          </Button>
        </>
      )}
    </div>,
    footerRoot,
  );
};
