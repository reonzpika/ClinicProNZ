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
    window.dispatchEvent(new CustomEvent('footer:process'));
  };
  const onFinish = () => {
    window.dispatchEvent(new CustomEvent('footer:finish'));
  };
  const onNew = () => {
    window.dispatchEvent(new CustomEvent('footer:new'));
  };
  const onCopy = () => {
    window.dispatchEvent(new CustomEvent('footer:copy'));
  };

  return createPortal(
    <div className="flex items-center gap-3">
      <TranscriptionControls
        collapsed={false}
        isMinimized={false}
        enableRemoteMobile={false}
        showRecordingMethodToggle={false}
        mobileMode
        footerMode
      />

      {/* CTAs */}
      {!hasGenerated && (
        <Button
          type="button"
          variant="default"
          onClick={onProcess}
          disabled={!hasUserContent}
          className="h-12 flex-1 rounded-full bg-slate-700 px-4 text-base text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          Process Notes
        </Button>
      )}

      {hasGenerated && (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onFinish}
            className="h-12 flex-1 rounded-full border-red-300 text-base text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Finish
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCopy}
            className="h-12 flex-1 rounded-full border-slate-300 text-base text-slate-700 hover:bg-slate-50"
          >
            Copy
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={onNew}
            className="h-12 flex-1 rounded-full bg-blue-600 text-base text-white hover:bg-blue-700"
          >
            New Session
          </Button>
        </>
      )}
    </div>,
    footerRoot,
  );
};
