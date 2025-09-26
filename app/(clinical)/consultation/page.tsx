'use client';

import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { Crown } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AdditionalNotes } from '@/src/features/clinical/main-ui/components/AdditionalNotes';
import { DefaultSettings } from '@/src/features/clinical/main-ui/components/DefaultSettings';
import { DocumentationSettingsBadge } from '@/src/features/clinical/main-ui/components/DocumentationSettingsBadge';
import { GeneratedNotes } from '@/src/features/clinical/main-ui/components/GeneratedNotes';
import { TranscriptionControls } from '@/src/features/clinical/main-ui/components/TranscriptionControls';
import { TypedInput } from '@/src/features/clinical/main-ui/components/TypedInput';
import { useTranscription } from '@/src/features/clinical/main-ui/hooks/useTranscription';
// Removed MobileRightPanelOverlay; widgets now live in main column
import { useSimpleAbly } from '@/src/features/clinical/mobile/hooks/useSimpleAbly';
// Removed RightPanelFeatures; widgets embedded below settings
import ClinicalToolsTabs from '@/src/features/clinical/right-sidebar/components/ClinicalToolsTabs';
import { WorkflowInstructions } from '@/src/features/clinical/right-sidebar/components/WorkflowInstructions';
import { PatientSessionManager } from '@/src/features/clinical/session-management/components/PatientSessionManager';
import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { RecordingAwareSessionContext } from '@/src/hooks/useRecordingAwareSession';
import { ContactLink } from '@/src/shared/components/ContactLink';
import { FeatureFeedbackButton } from '@/src/shared/components/FeatureFeedbackButton';
import { Container } from '@/src/shared/components/layout/Container';
import { Stack } from '@/src/shared/components/layout/Stack';
import { MobileBlockModal } from '@/src/shared/components/MobileBlockModal';
import { RateLimitModal } from '@/src/shared/components/RateLimitModal';
import { Button } from '@/src/shared/components/ui/button';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { useResponsive } from '@/src/shared/hooks/useResponsive';
import { createAuthHeaders } from '@/src/shared/utils';
import { useUserSettingsStore } from '@/src/stores/userSettingsStore';

export default function ConsultationPage() {
  const queryClient = useQueryClient();
  const {
    setError,
    setStatus,
    currentPatientSessionId,
    inputMode,
    typedInput,
    transcription,
    setTranscription,
    generatedNotes,
    setGeneratedNotes,
    // Deprecated legacy notes
    consultationNotes,
    setConsultationNotes,
    consultationItems,
    getCompiledConsultationText,
    templateId,
    setLastGeneratedInput,
    setTemplateId,
    setInputMode,
    // mutation queue controls
    pauseMutations,
    resumeMutations,

    saveNotesToCurrentSession, // For saving generated notes
    // Removed unused legacy save functions
    ensureActiveSession, // For ensuring session exists before note generation
    switchToPatientSession: originalSwitchToPatientSession, // Rename to create wrapper
    deletePatientSession,
    createPatientSession,
  } = useConsultationStores();
  const { isSignedIn: _isSignedIn, userId } = useAuth();
  const { getUserTier, user } = useClerkMetadata();
  const userTier = getUserTier();
  const [loading, setLoading] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isNoteFocused, setIsNoteFocused] = useState(false);
  const [isDocumentationMode, setIsDocumentationMode] = useState(false);
  // Sidebar removed
  const [rateLimitModalOpen, setRateLimitModalOpen] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<{ limit: number; resetIn: number; message: string } | null>(null);
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();
  // Guard to prevent doc-mode auto-toggle during clear-all flow
  const isClearingRef = useRef(false);
  // Abort controller for in-flight note generation requests
  const genAbortRef = useRef<AbortController | null>(null);
  // Apply user defaults only once on initial settings load
  const hasAppliedDefaultsRef = useRef(false);

  // Mobile block modal - prevent mobile access to consultation
  const showMobileBlock = isMobile;

  

  // Check for upgrade redirect
  const [showUpgradeNotification, setShowUpgradeNotification] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  // Mobile recording status
  const [mobileIsRecording, setMobileIsRecording] = useState(false);
  const lastMobileStatusAtRef = useRef<number>(0);
  const [defaultRecordingMethod, setDefaultRecordingMethod] = useState<'desktop' | 'mobile'>('desktop');

  // Desktop recording controls
  const { stopRecording, isRecording } = useTranscription();

  // Load user settings and apply defaults
  const { settings, loadSettings } = useUserSettingsStore();
  useEffect(() => {
    if (!userId) {
      return;
    }
    loadSettings(userId, userTier);
  }, [loadSettings, userId, userTier]);

  // Apply default input mode and template only once after settings load
  useEffect(() => {
    if (!settings || hasAppliedDefaultsRef.current) {
      return;
    }
    // Apply input mode default once
    if (settings.defaultInputMode === 'typed') {
      setInputMode('typed');
    } else {
      setInputMode('audio');
    }

    // Apply template default once
    const fav = settings.favouriteTemplateId || '20dc1526-62cc-4ff4-a370-ffc1ded52aef';
    setTemplateId(fav);

    hasAppliedDefaultsRef.current = true;
  }, [settings, setInputMode, setTemplateId]);

  // Always reflect default recording method changes from settings
  useEffect(() => {
    if (!settings) {
      return;
    }
    setDefaultRecordingMethod((settings.defaultRecordingMethod as any) || 'desktop');
  }, [settings]);

  // Handle Ably errors (moved before useSimpleAbly)
  const handleError = useCallback((error: string) => {
    // Suppress Ably/auth noise and clear mobile state on auth failures
    const isAblyNoise = /Failed to publish|Connection closed|Ably/i.test(error);
    if (isAblyNoise) {
      console.warn('[Ably]', error);
      return;
    }
    setError(error);
  }, [setError]);

  // Simple Ably sync implementation - always connected when token exists (moved before switchToPatientSession)
  const queryClientRef = useRef(queryClient);
  const currentSessionIdRef = useRef<string | null>(null);
  useEffect(() => {
    currentSessionIdRef.current = currentPatientSessionId || null;
  }, [currentPatientSessionId]);

  // Incremental append + debounce helpers
  const lastAppliedChunkIdRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { sendRecordingControl } = useSimpleAbly({
    userId: userId ?? null,
    onRecordingStatusChanged: (isRecording: boolean) => {
      setMobileIsRecording(isRecording);
      lastMobileStatusAtRef.current = Date.now();
    },
    onError: handleError,
    
    isMobile: false,
    onTranscriptionsUpdated: async (signalledSessionId?: string) => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return;
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(async () => {
        const activeSessionId = signalledSessionId || currentPatientSessionId;
        if (!activeSessionId) {
          return;
        }

        let session: any = null;
        try {
          session = await queryClientRef.current.fetchQuery({
            queryKey: ['consultation', 'session', activeSessionId],
            queryFn: async () => {
              const response = await fetch(`/api/patient-sessions?sessionId=${encodeURIComponent(activeSessionId)}`, {
                method: 'GET',
                headers: createAuthHeaders(userId, userTier),
              });
              if (!response.ok) {
                throw new Error('Failed to fetch session');
              }
              const data = await response.json();
              const sessions = data.sessions || [];
              return sessions[0] || null;
            },
            staleTime: 0,
          });
        } catch {
          session = queryClientRef.current.getQueryData(['consultation', 'session', activeSessionId]);
        }
        if (session) {
          let chunks: any[] = [];
          try {
            chunks = typeof session.transcriptions === 'string' ? JSON.parse(session.transcriptions) : (session.transcriptions || []);
          } catch {
            chunks = [];
          }
          if (Array.isArray(chunks) && chunks.length > 0) {
            let startIndex = 0;
            if (lastAppliedChunkIdRef.current) {
              const idx = chunks.findIndex((c: any) => c.id === lastAppliedChunkIdRef.current);
              startIndex = idx >= 0 ? idx + 1 : 0;
            }
            const newChunks = chunks.slice(startIndex).filter((c: any) => (c?.text || '').trim().length > 0);
            if (newChunks.length > 0) {
              const delta = newChunks.map((t: any) => (t?.text || '').trim()).join(' ').trim();
              const prev = typeof transcription?.transcript === 'string' ? transcription.transcript : '';
              const next = prev ? `${prev} ${delta}`.trim() : delta;
              setTranscription(next, false, undefined, undefined);
              lastAppliedChunkIdRef.current = chunks[chunks.length - 1]?.id || lastAppliedChunkIdRef.current;
            } else {
              lastAppliedChunkIdRef.current = chunks[chunks.length - 1]?.id || lastAppliedChunkIdRef.current;
            }
          }
        }
      }, 900);
    },
  });

  // Auto-clear stale mobile recording state if no heartbeat/status received recently
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        if (mobileIsRecording) {
          const last = lastMobileStatusAtRef.current || 0;
          if (Date.now() - last > 15000) {
            setMobileIsRecording(false);
          }
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [mobileIsRecording]);

  // Ensure global hook proxy exists as early as possible to aid diagnostics
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (typeof (window as any).ablySyncHook !== 'object') {
        (window as any).ablySyncHook = {
          sendRecordingControl: () => false,
        };
      }
    }
  }, []);

  // 🛡️ GP WORKFLOW: Wrapper to stop recording before session switching
  const switchToPatientSession = useCallback(async (sessionId: string, onSwitch?: (sessionId: string, patientName: string) => void) => {
    // Stop recording before switching sessions
    if (isRecording || mobileIsRecording) {
      try {
        // Stop desktop recording
        if (isRecording) {
          stopRecording();
        }

        // Stop mobile recording
        if (mobileIsRecording && sendRecordingControl) {
          sendRecordingControl('stop');
        }

        // Brief delay to ensure recording stops and final chunks are saved
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.warn('Error stopping recording before session switch:', error);
      }
    }

    // Now perform the actual session switch
    originalSwitchToPatientSession(sessionId, onSwitch);
    
  }, [isRecording, mobileIsRecording, stopRecording, sendRecordingControl, originalSwitchToPatientSession]);

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

  // Ensure there is always an active patient session; retry on relevant changes
  const hasEnsuredSessionRef = useRef(false);
  const isEnsuringSessionRef = useRef(false);
  useEffect(() => {
    if (hasEnsuredSessionRef.current || isEnsuringSessionRef.current) {
      return;
    }

    let isMounted = true;
    isEnsuringSessionRef.current = true;

    (async () => {
      try {
        const sessionId = await ensureActiveSession();
        if (isMounted && sessionId) {
          hasEnsuredSessionRef.current = true;
          
        }
      } finally {
        if (isMounted) {
          isEnsuringSessionRef.current = false;
        } else {
          isEnsuringSessionRef.current = false;
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [ensureActiveSession, userId]);

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

  // Reset mobile recording status when connection drops
  useEffect(() => {
    if (mobileIsRecording) {
      // no-op: will be updated via signals
    }
  }, [mobileIsRecording]);

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

  

  

  // On mount, sync current session from server (server truth); create one if missing
  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        if (!userId) {
          return;
        }
        const res = await fetch('/api/current-session', { method: 'GET', headers: createAuthHeaders(userId, userTier) });
        if (res.ok) {
          const data = await res.json();
          const serverId = data?.currentSessionId as string | null;
          if (serverId) {
            if (serverId !== currentPatientSessionId) {
              originalSwitchToPatientSession(serverId);
            }
          } else {
            // No server-side current session → ensure one exists
            try {
              await ensureActiveSession();
            } catch {}
          }
        }
      } catch {}
    };
    fetchCurrent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userTier]);

  
  // This eliminates dual broadcasting sources and race conditions

  const waitForTranscriptionFlush = async (sessionId: string, maxMs = 6000): Promise<void> => {
    const start = Date.now();
    let lastLen = -1;
    let lastId = '';
    let stableCount = 0;
    while (Date.now() - start < maxMs) {
      try {
        const res = await fetch(`/api/patient-sessions?sessionId=${encodeURIComponent(sessionId)}`, { method: 'GET', headers: createAuthHeaders(userId, userTier) });
        if (res.ok) {
          const data = await res.json();
          const s = (data?.sessions || [])[0] || null;
          let chunks: any[] = [];
          if (s?.transcriptions) {
            chunks = Array.isArray(s.transcriptions) ? s.transcriptions : JSON.parse(s.transcriptions);
          }
          const len = Array.isArray(chunks) ? chunks.length : 0;
          const id = len > 0 ? (chunks[len - 1]?.id || '') : '';
          if (len === lastLen && id === lastId) {
            stableCount += 1;
          } else {
            stableCount = 0;
          }
          lastLen = len;
          lastId = id;
          if (stableCount >= 2) {
            return;
          }
        }
      } catch {}
      await new Promise(r => setTimeout(r, 500));
    }
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    // Keep documentation view until operations complete; do not flip modes early
    try { pauseMutations?.(); } catch {}
    // Abort any in-flight note generation to prevent stream from repopulating notes
    if (genAbortRef.current) {
      try {
 genAbortRef.current.abort();
} catch { /* ignore */ }
      genAbortRef.current = null;
    }
    // Keep current UI visible until operations complete
    setLoading(false);
    setStatus('idle');
    setError(null);

    // Stop recordings only if active, and wait for transcript flush (poll fallback)
    try {
      if ((isRecording || mobileIsRecording) && currentPatientSessionId) {
        try {
          if (isRecording) {
            stopRecording();
          }
          if (mobileIsRecording && sendRecordingControl) {
            sendRecordingControl('stop');
          }
        } catch {}
        try {
          await waitForTranscriptionFlush(currentPatientSessionId);
        } catch {}
      }
      // Create a fresh session using favourite template, then switch, then soft-delete old in background
      const oldSessionId = currentPatientSessionId || null;
      const newSession = await createPatientSession?.('Patient');
      if (!newSession || !newSession.id) {
        throw new Error('Failed to create new session');
      }
      try {
        await switchToPatientSession(newSession.id as string);
      } catch {}
      // Soft-delete previous session in background (now it's not current)
      if (oldSessionId && deletePatientSession) {
        try { deletePatientSession(oldSessionId); } catch {}
      }
    } catch (error) {
      console.error('Error finishing session:', error);
    } finally {
      // Release guard after state has settled and a tick has elapsed to avoid flash
      requestAnimationFrame(() => {
        try { resumeMutations?.(); } catch {}
        setIsFinishing(false);
      });
    }
  };

  const handleGenerateNotes = async () => {
    // 🛡️ GP WORKFLOW: Stop recording before generating notes
    if (isRecording || mobileIsRecording) {
      try {
        // Stop desktop recording
        if (isRecording) {
          stopRecording();
        }

        // Stop mobile recording
        if (mobileIsRecording && sendRecordingControl) {
          sendRecordingControl('stop');
        }

        // Brief delay to ensure recording stops properly
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.warn('Error stopping recording before note generation:', error);
      }
    }

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
      // Include both inputs if present and label transcription as GP–patient conversation
      const hasTranscript = typeof transcription?.transcript === 'string' && transcription.transcript.trim().length > 0;
      const hasTyped = typeof typedInput === 'string' && typedInput.trim().length > 0;
      const inputBlocks: string[] = [];
      if (hasTranscript) {
        inputBlocks.push('TRANSCRIPTION (GP–patient conversation, unlabelled):');
        inputBlocks.push(transcription.transcript.trim());
      }
      if (hasTyped) {
        inputBlocks.push('TYPED INPUT:');
        inputBlocks.push(typedInput.trim());
      }
      const mainContent = inputBlocks.join('\n\n');
      const additionalContent = getCompiledConsultationText();

      // Combine main content with additional notes as raw consultation data
      const rawConsultationData = additionalContent && additionalContent.trim()
        ? `${mainContent}\n\n${additionalContent}`
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

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ switchToPatientSession }), [switchToPatientSession]);

  return (
    <RecordingAwareSessionContext.Provider value={contextValue}>
      <div className="flex h-full flex-col">
      <div className={`
        flex h-screen flex-col transition-all duration-300 ease-in-out
      `}
      >
        <Container size="fluid" className="h-full">
          <div className={`flex h-full flex-col ${(isMobile || isTablet) ? 'py-4' : 'py-6'}`}>
            {/* Mobile Tools Button removed; tools embedded below settings */}

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

                        {/* Clinical Widgets - Icon-only tabs under settings */}
                        <ClinicalToolsTabs fixedHeightClass="h-[400px]" />

                        {/* Default Settings */}
                        <DefaultSettings />

                        {/* Bottom helpers */}
                        <div className="mt-auto space-y-4">
                          {/* Workflow Instructions - moved to bottom */}
                          <WorkflowInstructions />
                          {/* Contact & Feedback - moved to bottom */}
                          <div className="flex gap-2">
                            <div className="w-1/2">
                              <FeatureFeedbackButton
                                feature="general"
                                context={`Page: Consultation; Template: ${templateId || 'none'}; Input Mode: ${inputMode}`}
                                variant="text"
                                className="w-full justify-center"
                              />
                            </div>
                            <div className="w-1/2">
                              <ContactLink className="w-full justify-center" />
                            </div>
                          </div>
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
                                  
                                  <GeneratedNotes
                                    onGenerate={handleGenerateNotes}
                                    onFinish={handleFinish}
                                    loading={loading}
                                    isNoteFocused={isNoteFocused}
                                    isDocumentationMode={isDocumentationMode}
                                    isFinishing={isFinishing}
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
                                          defaultRecordingMethod={defaultRecordingMethod}
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
                                    onFinish={handleFinish}
                                    loading={loading}
                                    isNoteFocused={isNoteFocused}
                                    isDocumentationMode={isDocumentationMode}
                                    isFinishing={isFinishing}
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

                      {/* Clinical Widgets - Icon-only tabs under settings for smaller screens */}
                      <ClinicalToolsTabs fixedHeightClass="h-[400px]" />

                      {/* Conditional Layout Based on Documentation Mode */}
                      {isDocumentationMode
                        ? (
                            <>
                              {/* Clinical Documentation - Top Priority */}
                              <div className="flex flex-1 flex-col">
                                
                                <GeneratedNotes
                                  onGenerate={handleGenerateNotes}
                                  onFinish={handleFinish}
                                  loading={loading}
                                  isNoteFocused={isNoteFocused}
                                  isDocumentationMode={isDocumentationMode}
                                  isFinishing={isFinishing}
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
                                          defaultRecordingMethod={defaultRecordingMethod}
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
                                        defaultRecordingMethod={defaultRecordingMethod}
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
                                   onFinish={handleFinish}
                                   loading={loading}
                                   isNoteFocused={isNoteFocused}
                                   isDocumentationMode={isDocumentationMode}
                                   isFinishing={isFinishing}
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

      {/* Right panel overlay removed */}

      {/* Rate Limit Modal */}
      {rateLimitError && (
        <RateLimitModal
          isOpen={rateLimitModalOpen}
          onClose={() => setRateLimitModalOpen(false)}
          error={rateLimitError}
        />
      )}

      {/* Centered loading overlay for Delete flow */}
      {isFinishing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20">
          <div className="flex items-center gap-3 rounded-md bg-white px-4 py-3 shadow">
            <svg className="size-4 animate-spin text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="text-sm text-slate-700">Deleting and creating new session...</span>
          </div>
        </div>
      )}

      

      {/* Mobile Block Modal */}
      <MobileBlockModal isOpen={showMobileBlock} />

      {/* Fixed bottom buttons removed; now placed at bottom of content */}
      </div>
    </RecordingAwareSessionContext.Provider>
  );
}
