'use client';

import { useAuth } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';

import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { Button } from '@/src/shared/components/ui/button';
import { TranscriptionControls } from './TranscriptionControls';
// import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';

export function GeneratedNotes({ onGenerate, onFinish, loading, isNoteFocused: _isNoteFocused, isDocumentationMode: _isDocumentationMode, isFinishing, mobileMode = false }: { onGenerate?: () => void; onFinish?: () => void; loading?: boolean; isNoteFocused?: boolean; isDocumentationMode?: boolean; isFinishing?: boolean; mobileMode?: boolean }) {
  const { isSignedIn } = useAuth();
  const {
    generatedNotes,
    error,
    transcription,
    resetConsultation,
    lastGeneratedTranscription: _lastGeneratedTranscription,
    lastGeneratedTypedInput: _lastGeneratedTypedInput,
    lastGeneratedCompiledConsultationText: _lastGeneratedCompiledConsultationText,
    lastGeneratedTemplateId: _lastGeneratedTemplateId,
    setGeneratedNotes,
    consentObtained,
    inputMode,
    typedInput,
    getCompiledConsultationText: _getCompiledConsultationText,
    saveNotesToCurrentSession,
    saveTypedInputToCurrentSession,
    createPatientSession,
    switchToPatientSession,
    // Per-section fields
    problemsText,
    objectiveText,
    assessmentText,
    planText,
  } = useConsultationStores();

  // Local UI state
  const [copySuccess, setCopySuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastSavedNotes, setLastSavedNotes] = useState('');
  const [_saveStatus, setSaveStatus] = useState('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [canCreateSession, setCanCreateSession] = useState<boolean>(true);
  const [isCreatingNewSession, setIsCreatingNewSession] = useState<boolean>(false);

  // Consent statement to append when consent was obtained
  const CONSENT_STATEMENT = '\n\nPatient informed and consented verbally to the use of digital documentation assistance during this consultation, in line with NZ Health Information Privacy Principles. The patient retains the right to pause or stop the recording at any time.';

  // Dynamic placeholder text based on processing status
  const getPlaceholderText = () => {
    if (loading) {
      return 'Processing...';
    }
    return 'Clinical documentation will appear here...';
  };

  // Computed value: generated notes with consent statement appended if consent was obtained
  const displayNotes = React.useMemo(() => {
    if (!generatedNotes) {
      return '';
    }
    if (!consentObtained) {
      return generatedNotes;
    }

    // Check if consent statement is already included to avoid duplication
    if (generatedNotes.includes('Patient informed and consented verbally to the use of a digital assistant')) {
      return generatedNotes;
    }

    return generatedNotes + CONSENT_STATEMENT;
  }, [generatedNotes, consentObtained]);

  // Check authentication status
  useEffect(() => {
    // Only authenticated users can create sessions
    setCanCreateSession(!!isSignedIn);
  }, [isSignedIn]);

  // Core user-entered content (exclude generated notes)
  const hasUserContent = React.useMemo(() => {
    const hasTranscript = !!(transcription.transcript && transcription.transcript.trim() !== '');
    const hasTyped = !!(typedInput && typedInput.trim() !== '');
    const hasPerSection = [problemsText, objectiveText, assessmentText, planText].some(s => s && s.trim() !== '');
    return hasTranscript || hasTyped || hasPerSection;
  }, [transcription.transcript, typedInput, problemsText, objectiveText, assessmentText, planText]);

  // Enable Process Notes if any user content exists
  const canGenerate = React.useMemo(() => {
    if (!hasUserContent) {
      return false;
    }
    if (!isSignedIn && !canCreateSession) {
      return false;
    }
    return true;
  }, [hasUserContent, isSignedIn, canCreateSession]);

  const hasContent = !!(displayNotes && displayNotes.trim() !== '');

  const hasAnyState = hasContent
    || (inputMode === 'typed' && typedInput && typedInput.trim() !== '')
    || (inputMode === 'audio' && (transcription.transcript && transcription.transcript.trim() !== ''))
    || [problemsText, objectiveText, assessmentText, planText].some(s => s && s.trim() !== '');

  // Determine if we should show minimal or expanded view
  const shouldShowMinimal = !isExpanded && !hasContent && !loading;

  // Expand when generation starts or when there are notes
  useEffect(() => {
    if (loading || hasContent) {
      setIsExpanded(true);
    }
  }, [loading, hasContent]);

  // Reset to minimal when content is cleared
  useEffect(() => {
    if (!hasAnyState && !loading) {
      setIsExpanded(false);
    }
  }, [hasAnyState, loading]);

  // Track the source of notes changes to avoid auto-saving when loading from sessions
  const [isManualEdit, setIsManualEdit] = useState(false);

  // Sync lastSavedNotes when notes are loaded (from generation or session switching)
  useEffect(() => {
    if (generatedNotes && !isManualEdit) {
      setLastSavedNotes(generatedNotes);
    }
  }, [generatedNotes, isManualEdit]);

  // Save notes on blur (when user finishes editing)
  const handleNotesBlur = async () => {
    if (isManualEdit && generatedNotes && generatedNotes !== lastSavedNotes && generatedNotes.trim() !== '') {
      try {
        const success = await saveNotesToCurrentSession(generatedNotes);
        if (success) {
          setLastSavedNotes(generatedNotes);
          setIsManualEdit(false); // Reset manual edit flag after saving
          setSaveStatus('saved');
          setLastSavedAt(new Date());
        }
      } catch (error) {
        console.error('Failed to save notes:', error);
        setSaveStatus('error');
      }
    }
  };

  // Copy to clipboard logic - use displayNotes which includes consent statement
  const handleCopy = async () => {
    if (!displayNotes) {
      return;
    }
    try {
      await navigator.clipboard.writeText(displayNotes);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    } catch {
      setCopySuccess(false);
    }
  };

  // Handle textarea changes - update the raw generated notes (without consent statement)
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Remove consent statement if user manually edits it out
    const cleanedValue = value.replace(CONSENT_STATEMENT, '');
    setGeneratedNotes(cleanedValue);
    setIsManualEdit(true); // Mark as manually edited
  };

  // Enhanced generate handler that expands the interface
  const handleGenerate = () => {
    setIsExpanded(true);
    if (onGenerate) {
      onGenerate();
    }
  };

  // Finish handler: delegate to parent and return to minimal state
  const handleFinish = () => {
    setIsExpanded(false);
    setLastSavedNotes('');
    setIsManualEdit(false);
    if (onFinish) {
      onFinish();
    }
  };

  // New Patient handler: save current notes, create new session, clear data
  const handleNewPatient = async () => {
    setIsCreatingNewSession(true);
    try {
      // 1. Save all current data to current session if they exist
      const savePromises = [];

      if (generatedNotes && generatedNotes.trim() !== '') {
        savePromises.push(saveNotesToCurrentSession(generatedNotes));
      }

      if (typedInput && typedInput.trim() !== '') {
        savePromises.push(saveTypedInputToCurrentSession(typedInput));
      }

      // Additional note sections are saved from their own UI; no JSON saves here

      // Wait for all saves to complete
      if (savePromises.length > 0) {
        const saveResults = await Promise.all(savePromises);
        const failedSaves = saveResults.filter(result => !result);
        if (failedSaves.length > 0) {
          console.warn(`${failedSaves.length} save operations failed, but continuing with new patient creation`);
        }
      }

      // 2. Create new patient session with auto-generated name
      const patientName = 'Patient';

      const newSession = await createPatientSession(patientName);
      if (!newSession) {
        throw new Error('Failed to create new patient session');
      }

      // 3. Switch to new session
      switchToPatientSession(newSession.id);

      // 4. Clear all consultation data and reset to standard mode
      resetConsultation();
      setIsExpanded(false);
      setLastSavedNotes('');
      setIsManualEdit(false); // Reset manual edit flag

      // Note: Don't call onClearAll here as it would clear the NEW session's data
      // We already saved the previous session data and resetConsultation clears the UI
    } catch (error) {
      console.error('Error creating new patient session:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsCreatingNewSession(false);
    }
  };

  // Determine when to show New Patient button (only for authenticated users with content)
  const showNewPatientButton = isSignedIn; // Show New Session even in default view

  // Minimal state - just the generate button (mobile: fixed footer with record + process)
  if (shouldShowMinimal) {
    return (
      <div className="flex flex-col gap-2">
        {isCreatingNewSession && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20">
            <div className="flex items-center gap-3 rounded-md bg-white px-4 py-3 shadow">
              <svg className="size-4 animate-spin text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span className="text-sm text-slate-700">Creating new session...</span>
            </div>
          </div>
        )}
        {/* Footer fixed bar on mobile */}
        {mobileMode
          ? (
              <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-3">
                  <TranscriptionControls
                    collapsed={false}
                    isMinimized={false}
                    enableRemoteMobile={false}
                    showRecordingMethodToggle={false}
                    mobileMode
                    footerMode
                  />
                  <Button
                    type="button"
                    variant="default"
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="h-12 flex-1 rounded-full bg-slate-700 px-4 text-base text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                    title={!isSignedIn && !canCreateSession ? 'Session limit reached - see Usage Dashboard for upgrade options' : ''}
                  >
                    Process Notes
                  </Button>
                </div>
              </div>
            )
          : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="default"
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className="h-10 flex-1 bg-slate-600 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                  title={!isSignedIn && !canCreateSession ? 'Session limit reached - see Usage Dashboard for upgrade options' : ''}
                >
                  Process Notes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFinish}
                  disabled={isFinishing || !hasUserContent}
                  className="h-10 border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  title="Delete this session"
                  aria-label="Delete this session"
                >
                  {isFinishing ? 'Deleting…' : 'Delete'}
                </Button>
                {showNewPatientButton && (
                  <Button
                    type="button"
                    variant="default"
                    onClick={handleNewPatient}
                    disabled={!canCreateSession || isCreatingNewSession || !hasUserContent}
                    className="h-10 bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    title="Create a new session"
                    aria-label="Create a new session"
                  >
                    New Session
                  </Button>
                )}
              </div>
            )}
        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}
      </div>
    );
  }

  // Expanded state - full interface
  return (
    <div className="flex h-full flex-col">
      {isCreatingNewSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20">
          <div className="flex items-center gap-3 rounded-md bg-white px-4 py-3 shadow">
            <svg className="size-4 animate-spin text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="text-sm text-slate-700">Creating new session...</span>
          </div>
        </div>
      )}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {mobileMode && (
        <div className="mb-2 rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-800">
          Record key points, then tap Process to draft your note. You can edit before finishing.
        </div>
      )}
      <div className="flex flex-1 flex-col space-y-3">
        {/* Mobile: compact copy button above note after generation */}
        {mobileMode && hasContent && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCopy}
              disabled={!hasContent || loading}
              className="h-8 border-slate-300 px-3 text-xs text-slate-600 hover:bg-slate-50"
            >
              {copySuccess ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        )}
        <textarea
          value={displayNotes || ''}
          onChange={handleNotesChange}
          onBlur={handleNotesBlur}
          className={`min-h-[200px] w-full flex-1 resize-none overflow-y-auto rounded border border-slate-200 bg-white p-3 ${mobileMode ? 'text-base leading-relaxed' : 'text-sm leading-relaxed'} text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-slate-400`}
          placeholder={getPlaceholderText()}
          disabled={loading}
          spellCheck={false}
        />
        <div className="flex items-center justify-between">
          {hasContent && (
            <div className="text-[11px] text-slate-500">
              {lastSavedAt ? `Saved • ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
            </div>
          )}
        </div>
        <div className={`${mobileMode ? 'fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]' : ''} flex items-center space-x-2`}>
          {mobileMode && (
            <TranscriptionControls
              collapsed={false}
              isMinimized={false}
              enableRemoteMobile={false}
              showRecordingMethodToggle={false}
              mobileMode
              footerMode
            />
          )}
          {/* Desktop/tablet full action row */}
          {!mobileMode && (
            <>
              <Button
                type="button"
                variant="default"
                onClick={handleGenerate}
                disabled={!canGenerate || loading}
                className="h-9 bg-slate-600 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                title={!isSignedIn && !canCreateSession ? 'Session limit reached - see Usage Dashboard for upgrade options' : ''}
              >
                {loading && (
                  <svg className="mr-2 size-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {loading ? 'Processing...' : 'Process Notes'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCopy}
                disabled={!hasContent || loading}
                className="h-9 border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleFinish}
                disabled={isFinishing || !hasUserContent}
                className="h-9 border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                title="Delete this session"
                aria-label="Delete this session"
              >
                {isFinishing ? 'Deleting…' : 'Delete'}
              </Button>
              {showNewPatientButton && (
                <Button
                  type="button"
                  variant="default"
                  onClick={handleNewPatient}
                  disabled={!canCreateSession || isCreatingNewSession || !hasUserContent}
                  className="h-9 bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  title="Create a new session"
                  aria-label="Create a new session"
                >
                  New Session
                </Button>
              )}
            </>
          )}

          {/* Mobile pre-generation: only Process CTA */}
          {mobileMode && !hasContent && (
            <Button
              type="button"
              variant="default"
              onClick={handleGenerate}
              disabled={!canGenerate || loading}
              className="h-12 w-full rounded-full bg-slate-700 px-4 text-base text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              title={!isSignedIn && !canCreateSession ? 'Session limit reached - see Usage Dashboard for upgrade options' : ''}
            >
              {loading ? 'Processing...' : 'Process Notes'}
            </Button>
          )}

          {/* Mobile post-generation: only Finish + New Session */}
          {mobileMode && hasContent && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleFinish}
                disabled={isFinishing}
                className="h-12 flex-1 rounded-full border-red-300 text-base text-red-600 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                title="Finish this session"
                aria-label="Finish this session"
              >
                {isFinishing ? 'Finishing…' : 'Finish'}
              </Button>
              {showNewPatientButton && (
                <Button
                  type="button"
                  variant="default"
                  onClick={handleNewPatient}
                  disabled={!canCreateSession || isCreatingNewSession}
                  className="h-12 flex-1 rounded-full bg-blue-600 text-base text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  title="Create a new session"
                  aria-label="Create a new session"
                >
                  New Session
                </Button>
              )}
            </>
          )}
        </div>

        {/* Warning message */}
        {hasContent && (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-800">
            <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.19-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span>Review your note before use to ensure it accurately represents the visit</span>
          </div>
        )}
      </div>
    </div>
  );
}
