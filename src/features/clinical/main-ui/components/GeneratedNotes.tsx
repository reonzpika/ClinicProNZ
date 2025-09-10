'use client';

import { useAuth } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';

import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { FeatureFeedbackButton } from '@/src/shared/components/FeatureFeedbackButton';
import { Button } from '@/src/shared/components/ui/button';
// import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';

export function GeneratedNotes({ onGenerate, onClearAll, loading, isNoteFocused: _isNoteFocused, isDocumentationMode: _isDocumentationMode }: { onGenerate?: () => void; onClearAll?: () => void; loading?: boolean; isNoteFocused?: boolean; isDocumentationMode?: boolean }) {
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
    templateId,
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
  const [canCreateSession, setCanCreateSession] = useState<boolean>(true);

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

  // Button enable logic - enable for any non-empty input
  const canGenerate = React.useMemo(() => {
    const hasInput = inputMode === 'typed'
      ? (typedInput && typedInput.trim() !== '')
      : (transcription.transcript && transcription.transcript.trim() !== '');

    if (!hasInput) {
      return false;
    }

    // Authentication required
    if (!isSignedIn && !canCreateSession) {
      return false;
    }

    // Enable for any non-empty input (removed "changed since last generation" requirement)
    return true;
  }, [
    inputMode,
    typedInput,
    transcription.transcript,
    isSignedIn,
    canCreateSession,
  ]);

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

  // Clear all handler: reset consultation context and return to minimal state
  const handleClearAll = () => {
    resetConsultation(); // Clears all consultation data including transcript
    setIsExpanded(false);
    setLastSavedNotes(''); // Reset saved notes tracking
    setIsManualEdit(false); // Reset manual edit flag
    if (onClearAll) {
      onClearAll();
    }
  };

  // New Patient handler: save current notes, create new session, clear data
  const handleNewPatient = async () => {
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
    }
  };

  // Determine when to show New Patient button (only for authenticated users with content)
  const showNewPatientButton = isSignedIn && hasContent;

  // Minimal state - just the generate button
  if (shouldShowMinimal) {
    return (
      <div className="flex flex-col gap-2">
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
            onClick={handleClearAll}
            disabled={!hasAnyState}
            className="h-10 border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            title="Clear all consultation data"
            aria-label="Clear all consultation data"
          >
            Clear All
          </Button>
          {showNewPatientButton && (
            <Button
              type="button"
              variant="outline"
              onClick={handleNewPatient}
              disabled={!hasAnyState}
              className="h-10 border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              title="Save notes and start new patient session"
              aria-label="Save notes and start new patient session"
            >
              New Patient
            </Button>
          )}
        </div>
        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}
      </div>
    );
  }

  // Expanded state - full interface
  return (
    <div className="flex h-full flex-col">
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="flex flex-1 flex-col space-y-3">
        <textarea
          value={displayNotes || ''}
          onChange={handleNotesChange}
          onBlur={handleNotesBlur}
          className="min-h-[200px] w-full flex-1 resize-none overflow-y-auto rounded border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 focus:border-slate-400 focus:ring-2 focus:ring-slate-400"
          placeholder={getPlaceholderText()}
          disabled={loading}
          spellCheck={false}
        />
        <div className="flex space-x-2">
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
          {hasContent && !loading && (
            <FeatureFeedbackButton
              feature="notes"
              context={`Template: ${templateId}, Notes length: ${displayNotes?.length || 0} chars`}
              variant="text"
            />
          )}
          <Button
            type="button"
            variant="outline"
            onClick={handleClearAll}
            disabled={!hasAnyState}
            className="h-9 border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            title="Clear all consultation data"
            aria-label="Clear all consultation data"
          >
            Clear All
          </Button>
          {showNewPatientButton && (
            <Button
              type="button"
              variant="outline"
              onClick={handleNewPatient}
              disabled={!hasAnyState}
              className="h-9 border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              title="Save notes and start new patient session"
              aria-label="Save notes and start new patient session"
            >
              New Patient
            </Button>
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
