'use client';

import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { Crown, Stethoscope } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { AdditionalNotes } from '@/src/features/clinical/main-ui/components/AdditionalNotes';
import { DocumentationSettingsBadge } from '@/src/features/clinical/main-ui/components/DocumentationSettingsBadge';
import { GeneratedNotes } from '@/src/features/clinical/main-ui/components/GeneratedNotes';
import { TranscriptionControls } from '@/src/features/clinical/main-ui/components/TranscriptionControls';
// Removed TranscriptProcessingStatus import - no longer needed in single-pass architecture
import { TypedInput } from '@/src/features/clinical/main-ui/components/TypedInput';
import { MobileRightPanelOverlay } from '@/src/features/clinical/mobile/components/MobileRightPanelOverlay';
import { useSimpleAbly } from '@/src/features/clinical/mobile/hooks/useSimpleAbly';
import RightPanelFeatures from '@/src/features/clinical/right-sidebar/components/RightPanelFeatures';
import UsageDashboard from '@/src/features/clinical/right-sidebar/components/UsageDashboard';
import { WorkflowInstructions } from '@/src/features/clinical/right-sidebar/components/WorkflowInstructions';
import { PatientSessionManager } from '@/src/features/clinical/session-management/components/PatientSessionManager';
import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { ContactLink } from '@/src/shared/components/ContactLink';
import { FloatingFeedbackButton } from '@/src/shared/components/FloatingFeedbackButton';
import { Container } from '@/src/shared/components/layout/Container';
import { Stack } from '@/src/shared/components/layout/Stack';
import { MobileBlockModal } from '@/src/shared/components/MobileBlockModal';
import { RateLimitModal } from '@/src/shared/components/RateLimitModal';
import { Button } from '@/src/shared/components/ui/button';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { useResponsive } from '@/src/shared/hooks/useResponsive';
import { createAuthHeaders } from '@/src/shared/utils';

export default function ConsultationPage() {
  const queryClient = useQueryClient();
  const {
    setError,
    setStatus,
    mobileV2 = { isEnabled: false, token: null, tokenData: null, isConnected: false },
    currentPatientSessionId,
    inputMode,
    typedInput,
    transcription,
    appendTranscription,
    appendTranscriptionEnhanced,
    setTranscription,
    setTypedInput,
    generatedNotes,
    setGeneratedNotes,
    consultationNotes,
    setConsultationNotes,
    consultationItems,
    getCompiledConsultationText,
    templateId,
    setLastGeneratedInput,

    setMobileV2IsConnected, // NEW: Connection status bridge
    enableMobileV2,
    setMobileV2TokenData,
    saveNotesToCurrentSession, // For saving generated notes
    saveTypedInputToCurrentSession: _saveTypedInputToCurrentSession, // For clearing typed input (unused)
    saveConsultationNotesToCurrentSession: _saveConsultationNotesToCurrentSession, // For clearing consultation notes (unused)
    ensureActiveSession, // For ensuring session exists before note generation
    resetLastGeneratedInput, // For resetting generation tracking
  } = useConsultationStores();
  const { isSignedIn: _isSignedIn, userId } = useAuth();
  const { getUserTier, user } = useClerkMetadata();
  const userTier = getUserTier();
  const [loading, setLoading] = useState(false);
  const [isNoteFocused, setIsNoteFocused] = useState(false);
  const [isDocumentationMode, setIsDocumentationMode] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(true);
  const [rateLimitModalOpen, setRateLimitModalOpen] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<{ limit: number; resetIn: number; message: string } | null>(null);
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();
  // Guard to prevent doc-mode auto-toggle during clear-all flow
  const isClearingRef = useRef(false);
  // Abort controller for in-flight note generation requests
  const genAbortRef = useRef<AbortController | null>(null);

  // Mobile block modal - prevent mobile access to consultation
  const showMobileBlock = isMobile;

  // Removed admin preview mode state - no longer needed in single-pass architecture

  // Check for upgrade redirect
  const [showUpgradeNotification, setShowUpgradeNotification] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  // Mobile recording status
  const [mobileIsRecording, setMobileIsRecording] = useState(false);

  useEffect(() => {
    // Check URL parameters for upgrade redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('showUpgrade') === 'true') {
      setShowUpgradeNotification(true);
      // Remove the parameter from URL without reload
      urlParams.delete('showUpgrade');
      const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
      window.history.replaceState(null, '', newUrl);
    }
  }, []);

  // Direct upgrade handler
  const handleDirectUpgrade = async () => {
    setUpgradeLoading(true);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.primaryEmailAddress?.emailAddress,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        console.error('Failed to create checkout session');
        setUpgradeLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setUpgradeLoading(false);
    }
  };

  // Admin preview approval handler
  // Removed admin approval handler - no longer needed in single-pass architecture

  // Usage dashboard refresh ref
  const usageDashboardRef = useRef<{ refresh: () => void } | null>(null);

  // Session limits are now handled contextually when users try to perform actions
  // The UsageDashboard will show the current status and the modal will appear on 429 errors

  // Auto-enable/disable documentation mode based on generated notes or loading state
  useEffect(() => {
    // Suppress doc-mode while clearing to ensure we return to default view immediately
    if (isClearingRef.current) {
      if (isDocumentationMode) {
        setIsDocumentationMode(false);
      }
      return;
    }

    if ((generatedNotes && generatedNotes.trim()) || loading) {
      if (!isDocumentationMode) {
        setIsDocumentationMode(true);
      }
    } else if ((!generatedNotes || !generatedNotes.trim()) && !loading && isDocumentationMode) {
      setIsDocumentationMode(false);
    }
  }, [generatedNotes, loading, isDocumentationMode]);

  // Ensure inputs are expanded by default when switching/creating a new session
  // Fix: after generating notes then creating a new session, inputs were shown collapsed
  // because isNoteFocused remained true from the previous session
  useEffect(() => {
    setIsNoteFocused(false);
  }, [currentPatientSessionId]);

  const handleError = useCallback((error: string) => {
    // Suppress Ably/auth noise and clear mobile state on auth failures
    const isAblyNoise = /Failed to publish|Connection closed|Ably/i.test(error);
    const isAuthInvalid = /Authentication failed|Token expired or invalid/i.test(error);

    if (isAblyNoise || isAuthInvalid) {
      if (isAuthInvalid) {
        try {
                  // Always trust server: clear local mobile state/cache and show disconnected UI
        setMobileV2TokenData(null);
        enableMobileV2(false);
        setMobileV2IsConnected(false);
        } catch {}
      }
      console.warn('[Ably]', error);
      return;
    }
    setError(error);
  }, [setError, setMobileV2TokenData, enableMobileV2, setMobileV2IsConnected]);

  // 🛡️ PHASE 1 FIX: Reset mobile recording status when connection drops
  useEffect(() => {
    if (!mobileV2.isConnected && mobileIsRecording) {
      setMobileIsRecording(false);
    }
    // Removed sessionSynced logic - no longer needed in simplified architecture
  }, [mobileV2.isConnected, mobileIsRecording]);

  // Simple Ably sync implementation - always connected when token exists
  const { sendRecordingControl } = useSimpleAbly({
    tokenId: mobileV2?.token || null, // Always connect when token available
    onTranscriptReceived: (transcript: string, enhancedData?: any) => {
      // Always append to current session - no session matching needed
      if (currentPatientSessionId) {
        if (enhancedData && (enhancedData.confidence !== undefined || (enhancedData.words?.length || 0) > 0)) {
          appendTranscriptionEnhanced(
            transcript,
            true,
            'mobile',
            undefined, // deviceId
            undefined, // diarizedTranscript
            undefined, // utterances
            enhancedData.confidence,
            enhancedData.words,
            enhancedData.paragraphs,
          );
        } else {
          appendTranscription(transcript, true, 'mobile');
        }
      }
    },
    onRecordingStatusChanged: (isRecording: boolean) => {
      setMobileIsRecording(isRecording);
    },
    onError: handleError,
    onConnectionStatusChanged: setMobileV2IsConnected,
    isMobile: false,
  });

  // Expose sendRecordingControl to global for remote control
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).ablySyncHook = {
        sendRecordingControl: (action: 'start' | 'stop') => (sendRecordingControl ? sendRecordingControl(action) : false),
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).ablySyncHook;
      }
    };
  }, [sendRecordingControl]);

  // Removed session sync logic - no longer needed in simplified architecture

  // Ensure desktop Ably connects without opening the QR modal by loading active token
  useEffect(() => {
    const loadActiveToken = async () => {
      try {
        if (!userId) {
          return;
        }
        const res = await fetch('/api/mobile/active-token', {
          method: 'GET',
          headers: createAuthHeaders(userId, userTier),
        });
        if (res.ok) {
          const tokenData = await res.json();
          if (tokenData?.token) {
            setMobileV2TokenData(tokenData);
            enableMobileV2(true);
            return;
          }
        }
        // Always trust server: clear local cache/state if no active token
        setMobileV2TokenData(null);
        enableMobileV2(false);
        setMobileV2IsConnected(false);
      } catch {
        // best-effort, ignore
      }
    };
    loadActiveToken();
  }, [userId, userTier, enableMobileV2, setMobileV2TokenData, setMobileV2IsConnected]);

  // On mount, sync current session from server (server truth)
  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        if (!userId) {
          return;
        }
        const res = await fetch('/api/current-session', { method: 'GET', headers: createAuthHeaders(userId, userTier) });
        if (res.ok) {
          const data = await res.json();
          const sessionId = data?.currentSessionId;
          if (sessionId) {
            // broadcast via server-event publisher on switch actions only; here just local hydration best-effort
            // leave Ably broadcast to server on future switch
          }
        }
      } catch {}
    };
    fetchCurrent();
  }, [userId, userTier]);

  // REMOVED: Redundant session broadcasting - now handled by ConsultationContext only
  // This eliminates dual broadcasting sources and race conditions

  const handleClearAll = async () => {
    isClearingRef.current = true;
    // Abort any in-flight note generation to prevent stream from repopulating notes
    if (genAbortRef.current) {
      try {
 genAbortRef.current.abort();
} catch { /* ignore */ }
      genAbortRef.current = null;
    }
    // Clear UI state immediately
    setLoading(false);
    setIsNoteFocused(false);
    setIsDocumentationMode(false);
    setGeneratedNotes('');
    setStatus('idle');
    setError(null);

    // Clear local store state
    setConsultationNotes('');
    setTypedInput('');
    setTranscription('', false);
    resetLastGeneratedInput();

    // Clear server-side session data atomically
    try {
      if (currentPatientSessionId) {
        // Set a brief global suppression window to prevent hydration re-population
        try {
 (window as any).__clinicproJustClearedUntil = Date.now() + 800;
} catch {}
        await fetch('/api/patient-sessions/clear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...createAuthHeaders(userId, userTier) },
          body: JSON.stringify({ sessionId: currentPatientSessionId }),
        });
      }

      // Optimistically update React Query caches for current session
      if (currentPatientSessionId) {
        // Update sessions list cache
        queryClient.setQueryData<any>(
          ['consultation', 'sessions'],
          (old: any) => {
            if (!Array.isArray(old)) {
              return old;
            }
            return old.map((s: any) => (s.id === currentPatientSessionId
              ? { ...s, notes: '', typedInput: '', consultationNotes: '', transcriptions: [] }
              : s));
          },
        );
        // Update individual session cache
        queryClient.setQueryData<any>(
          ['consultation', 'session', currentPatientSessionId],
          (old: any) => {
            if (!old) {
              return old;
            }
            return { ...old, notes: '', typedInput: '', consultationNotes: '', transcriptions: [] };
          },
        );
        // Pull fresh server state to remove any stale rehydration edge cases
        try {
          await queryClient.invalidateQueries({ queryKey: ['consultation', 'session', currentPatientSessionId] });
        } catch {}
      }

      // Re-enforce local clears in case of any async rehydration
      setGeneratedNotes('');
      setTypedInput('');
      setConsultationNotes('');
      setTranscription('', false);
    } catch (error) {
      console.error('Error clearing server data:', error);
      // Continue anyway - UI is already cleared
    } finally {
      // Release guard after state has settled and a tick has elapsed to avoid flash
      requestAnimationFrame(() => {
        isClearingRef.current = false;
      });
    }
  };

  const handleGenerateNotes = async () => {
    setIsNoteFocused(true);
    setIsDocumentationMode(true);
    setLoading(true);
    setError(null);

    try {
      // Ensure we have an active session before generating notes
      const sessionId = await ensureActiveSession();
      if (!sessionId) {
        throw new Error('Failed to create or ensure active session');
      }

      // Single-pass: Combine raw consultation data and send directly to notes API
      const mainContent = inputMode === 'audio' ? transcription.transcript : typedInput;
      const additionalContent = getCompiledConsultationText();

      // Combine main content with additional notes as raw consultation data
      const rawConsultationData = additionalContent && additionalContent.trim()
        ? `${mainContent}\n\nADDITIONAL NOTES:\n${additionalContent}`
        : mainContent;

      // Direct single-pass note generation
      setStatus('processing');

      const requestBody = {
        rawConsultationData,
        templateId,
      };
      // Create and store abort controller for this request
      const controller = new AbortController();
      genAbortRef.current = controller;
      const res = await fetch('/api/consultation/notes', {
        method: 'POST',
        headers: createAuthHeaders(userId, userTier),
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      // Check for rate limit error
      if (res.status === 429) {
        const errorData = await res.json();
        // Map server response format to UI format
        const resetTime = errorData.resetTime ? new Date(errorData.resetTime) : new Date();
        const resetIn = Math.max(0, Math.floor((resetTime.getTime() - Date.now()) / 1000));
        setRateLimitError({
          limit: errorData.remaining || 0, // Use remaining count from server
          resetIn,
          message: errorData.message || 'Rate limit exceeded',
        });
        setRateLimitModalOpen(true);
        setStatus('idle');
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        setError(errorData.error || errorData.message || 'Failed to generate notes');
        setStatus('idle');
        return;
      }

      if (!res.body) {
        setError('No response body');
        setStatus('idle');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let notes = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        notes += decoder.decode(value, { stream: true });
        setGeneratedNotes(notes);
      }

      // Track the original inputs for UI purposes
      setLastGeneratedInput(
        inputMode === 'audio' ? transcription.transcript : '',
        inputMode === 'typed' ? typedInput : '',
        getCompiledConsultationText(),
        templateId,
      );

      // Save the generated notes to the current session
      await saveNotesToCurrentSession(notes);

      // Set status to completed
      setStatus('completed');

      // Refresh usage dashboard after successful notes generation
      if (usageDashboardRef.current?.refresh) {
        usageDashboardRef.current.refresh();
      }
    } catch (err) {
      // Swallow abort errors triggered by Clear All
      if ((err as any)?.name !== 'AbortError') {
        setError(err instanceof Error ? err.message : 'Failed to generate notes');
      }
      setStatus('idle');
    } finally {
      setLoading(false);
      // Clear abort ref if it belongs to this invocation
      if (genAbortRef.current) {
        genAbortRef.current = null;
      }
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Right Panel Sidebar (Desktop Only) */}
      {isDesktop && (
        <div className={`
          fixed right-0 top-0 z-30 h-[calc(100vh-80px)] border-l border-slate-200 bg-white transition-all duration-300 ease-in-out
          ${rightPanelCollapsed ? 'w-12' : 'w-80'}
        `}
        >
          <RightPanelFeatures
            isCollapsed={rightPanelCollapsed}
            onToggle={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          />
        </div>
      )}

      <div className={`
        flex h-screen flex-col transition-all duration-300 ease-in-out
        ${isDesktop
      ? (rightPanelCollapsed ? 'mr-12' : 'mr-80')
      : 'mr-0'
    }
      `}
      >
        <Container size="fluid" className="h-full">
          <div className={`flex h-full flex-col ${(isMobile || isTablet) ? 'py-4' : 'py-6'}`}>
            {/* Mobile Tools Button */}
            {isTablet && (
              <div className="mb-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRightPanelOpen(true)}
                  className="bg-white shadow-sm"
                >
                  <Stethoscope size={16} className="mr-2" />
                  Clinical Tools
                </Button>
              </div>
            )}

            {/* Upgrade Notification for users redirected from registration */}
            {showUpgradeNotification && (
              <div className="mb-4 rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-blue-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className="size-6 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Welcome! Ready to upgrade?</h3>
                      <p className="text-sm text-gray-600">
                        Get unlimited access for just $30/month (first 15 GPs only!)
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowUpgradeNotification(false)}
                    >
                      Later
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleDirectUpgrade}
                      disabled={upgradeLoading}
                    >
                      {upgradeLoading ? 'Loading...' : 'Upgrade Now'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Main Clinical Documentation Area */}
            <div className="h-full flex-1">
              {/* Large Desktop Dual-Column Layout */}
              {isLargeDesktop
                ? (
                    <div className="flex h-full gap-6">
                      {/* Left Column - Supporting Information (30-35%) */}
                      <div className="h-full w-1/3 space-y-4">
                        {/* Patient Session Manager - V2 Feature */}
                        <PatientSessionManager />

                        {/* Documentation Settings Badge - Always visible below session bar */}
                        <DocumentationSettingsBadge />

                        {/* Usage Dashboard - Shows tier limits and usage */}
                        <div data-component="usage-dashboard">
                          <UsageDashboard ref={usageDashboardRef} />
                        </div>

                        {/* Workflow Instructions - Only visible on large desktop */}
                        <WorkflowInstructions />

                        {/* Contact Link - Fixed at bottom of left column */}
                        <div className="mt-auto">
                          <ContactLink />
                        </div>

                        {/* Minimized Components in Documentation Mode */}
                        {isDocumentationMode && (
                          <div className="space-y-2">
                            <div className="mb-2 border-b border-slate-200 pb-1 text-xs font-medium text-slate-600">
                              Input Sources
                            </div>
                            <div className="space-y-2">
                              {/* Show audio transcription if it has content */}
                              {transcription.transcript && transcription.transcript.trim() !== '' && (
                                <TranscriptionControls
                                  collapsed={false}
                                  onExpand={() => setIsNoteFocused(false)}
                                  isMinimized
                                  mobileIsRecording={mobileIsRecording}
                                />
                              )}

                              {/* Show typed input if it has content */}
                              {typedInput && typedInput.trim() !== '' && (
                                <TypedInput
                                  collapsed={false}
                                  onExpand={() => setIsNoteFocused(false)}
                                  isMinimized
                                />
                              )}

                              {/* Show separator only if we have input sources above */}
                              {((transcription.transcript && transcription.transcript.trim() !== '')
                                || (typedInput && typedInput.trim() !== '')) && (
                                <div className="border-t border-slate-200" />
                              )}

                              <AdditionalNotes
                                items={consultationItems}
                                onNotesChange={setConsultationNotes}
                                notes={consultationNotes}
                                placeholder="Additional information gathered during consultation..."
                                isMinimized
                                defaultExpanded={inputMode === 'audio'}
                                expandedSize={inputMode === 'audio' ? 'large' : 'normal'}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Vertical Divider */}
                      <div className="w-px bg-slate-200" />

                      {/* Right Column - Main Workflow (65-70%) */}
                      <div className="h-full flex-1 space-y-4">
                        {/* Conditional Layout Based on Documentation Mode */}
                        {isDocumentationMode
                          ? (
                              <>
                                {/* Clinical Documentation - Top Priority */}
                                <div className="flex h-full flex-col">
                                  {/* Removed TranscriptProcessingStatus - no longer needed in single-pass */}
                                  <GeneratedNotes
                                    onGenerate={handleGenerateNotes}
                                    onClearAll={handleClearAll}
                                    loading={loading}
                                    isNoteFocused={isNoteFocused}
                                    isDocumentationMode={isDocumentationMode}
                                  />
                                </div>
                              </>
                            )
                          : (
                              <div className="flex h-full flex-col space-y-4">
                                {/* Input Components */}
                                <div className="flex flex-1 flex-col space-y-4">
                                  {inputMode === 'audio'
                                    ? (
                                        <TranscriptionControls
                                          collapsed={isNoteFocused}
                                          onExpand={() => setIsNoteFocused(false)}
                                          isMinimized={false}
                                          mobileIsRecording={mobileIsRecording}
                                        />
                                      )
                                    : (
                                        <TypedInput
                                          collapsed={isNoteFocused}
                                          onExpand={() => setIsNoteFocused(false)}
                                          isMinimized={false}
                                        />
                                      )}

                                  <AdditionalNotes
                                    items={consultationItems}
                                    onNotesChange={setConsultationNotes}
                                    notes={consultationNotes}
                                    placeholder="Additional information gathered during consultation..."
                                    isMinimized={false}
                                    defaultExpanded={inputMode === 'audio'}
                                    expandedSize={inputMode === 'audio' ? 'large' : 'normal'}
                                  />
                                </div>

                                {/* Clinical Documentation - Bottom */}
                                <div className="mt-auto flex flex-col">
                                  <GeneratedNotes
                                    onGenerate={handleGenerateNotes}
                                    onClearAll={handleClearAll}
                                    loading={loading}
                                    isNoteFocused={isNoteFocused}
                                    isDocumentationMode={isDocumentationMode}
                                  />
                                </div>
                              </div>
                            )}
                      </div>
                    </div>
                  )
                : (
                  /* Tablet/Mobile/Small Desktop Single-Column Layout (Unchanged) */
                    <Stack spacing={isDesktop ? 'sm' : 'sm'} className="h-full">
                      {/* Patient Session Manager - V2 Feature */}
                      <PatientSessionManager />

                      {/* Documentation Settings Badge - Always visible below session bar */}
                      <DocumentationSettingsBadge />

                      {/* Conditional Layout Based on Documentation Mode */}
                      {isDocumentationMode
                        ? (
                            <>
                              {/* Clinical Documentation - Top Priority */}
                              <div className="flex flex-1 flex-col">
                                {/* Removed TranscriptProcessingStatus - no longer needed in single-pass */}
                                <GeneratedNotes
                                  onGenerate={handleGenerateNotes}
                                  onClearAll={handleClearAll}
                                  loading={loading}
                                  isNoteFocused={isNoteFocused}
                                  isDocumentationMode={isDocumentationMode}
                                />
                              </div>

                              {/* Minimized Consultation Sections */}
                              <div className="space-y-1">
                                <div className="space-y-2">
                                  {inputMode === 'audio'
                                    ? (
                                        <TranscriptionControls
                                          collapsed={false}
                                          onExpand={() => setIsNoteFocused(false)}
                                          isMinimized
                                          mobileIsRecording={mobileIsRecording}
                                        />
                                      )
                                    : (
                                        <TypedInput
                                          collapsed={false}
                                          onExpand={() => setIsNoteFocused(false)}
                                          isMinimized
                                        />
                                      )}

                                  <AdditionalNotes
                                    items={consultationItems}
                                    onNotesChange={setConsultationNotes}
                                    notes={consultationNotes}
                                    placeholder="Additional information gathered during consultation..."
                                    isMinimized
                                    defaultExpanded={inputMode === 'audio'}
                                    expandedSize={inputMode === 'audio' ? 'large' : 'normal'}
                                  />
                                </div>
                              </div>
                            </>
                          )
                        : (
                            <div className="flex flex-1 flex-col space-y-4">
                              {/* Input Components */}
                              <div className="flex flex-1 flex-col space-y-4">
                                {inputMode === 'audio'
                                  ? (
                                      <TranscriptionControls
                                        collapsed={isNoteFocused}
                                        onExpand={() => setIsNoteFocused(false)}
                                        isMinimized={false}
                                        mobileIsRecording={mobileIsRecording}
                                      />
                                    )
                                  : (
                                      <TypedInput
                                        collapsed={isNoteFocused}
                                        onExpand={() => setIsNoteFocused(false)}
                                        isMinimized={false}
                                      />
                                    )}

                                <AdditionalNotes
                                  items={consultationItems}
                                  onNotesChange={setConsultationNotes}
                                  notes={consultationNotes}
                                  placeholder="Additional information gathered during consultation..."
                                  isMinimized={false}
                                  defaultExpanded={inputMode === 'audio'}
                                  expandedSize={inputMode === 'audio' ? 'large' : 'normal'}
                                />
                              </div>

                                {/* Clinical Documentation - Bottom */}
                                <div className="mt-auto flex flex-col">
                                 <GeneratedNotes
                                   onGenerate={handleGenerateNotes}
                                   onClearAll={handleClearAll}
                                   loading={loading}
                                   isNoteFocused={isNoteFocused}
                                   isDocumentationMode={isDocumentationMode}
                                 />
                                </div>
                            </div>
                          )}
                    </Stack>
                  )}
            </div>
          </div>
        </Container>
      </div>

      {/* Mobile Right Panel Overlay (hidden on phones) */}
      {isTablet && (
        <MobileRightPanelOverlay
          isOpen={rightPanelOpen}
          onClose={() => setRightPanelOpen(false)}
        />
      )}

      {/* Rate Limit Modal */}
      {rateLimitError && (
        <RateLimitModal
          isOpen={rateLimitModalOpen}
          onClose={() => setRateLimitModalOpen(false)}
          error={rateLimitError}
        />
      )}

      {/* Removed Admin Preview Modal - no longer needed in single-pass architecture */}

      {/* Mobile Block Modal */}
      <MobileBlockModal isOpen={showMobileBlock} />

      {/* Contact Link - Fixed bottom for non-large desktop */}
      {!isLargeDesktop && (
        <div className="fixed bottom-4 left-4 z-20">
          <ContactLink />
        </div>
      )}

      {/* Floating Feedback Button */}
      <FloatingFeedbackButton
        currentFeature={
          generatedNotes && !loading
            ? 'notes'
            : (transcription.transcript || inputMode === 'audio')
                ? 'transcription'
                : 'general'
        }
        context={`
          Page: Consultation, 
          Template: ${templateId || 'none'}, 
          Input Mode: ${inputMode}, 
          Has Notes: ${!!generatedNotes}, 
          Has Transcript: ${!!transcription.transcript},
          User Tier: ${userTier}
        `.trim()}
      />
    </div>
  );
}
